import { NextRequest, NextResponse } from "next/server";
import type OpenAI from "openai";
import { createClient } from "@supabase/supabase-js";
import { sanitizeString } from "@/lib/validation";
import { ApiError, errorResponse } from "@/lib/api-error";
import { enforcePlanLimit } from "@/lib/plan-enforcement";

let _openai: OpenAI | null = null;
async function getOpenAI(): Promise<OpenAI> {
  if (!_openai) {
    const { default: OpenAI } = await import("openai");
    const apiKey = process.env.GROQ_API_KEY || process.env.OPENAI_API_KEY || "";
    const baseURL = process.env.GROQ_API_KEY
      ? "https://api.groq.com/openai/v1"
      : undefined;
    _openai = new OpenAI({ apiKey, baseURL });
  }
  return _openai;
}

const rateLimitMap = new Map<string, { count: number; windowStart: number }>();
const RATE_LIMIT = parseInt(process.env.AI_RATE_LIMIT ?? "10", 10);
const RATE_WINDOW_MS = parseInt(process.env.AI_RATE_WINDOW_MS ?? "60000", 10);

function checkRateLimit(userId: string) {
  const now = Date.now();
  const entry = rateLimitMap.get(userId);
  if (!entry || now - entry.windowStart > RATE_WINDOW_MS) {
    rateLimitMap.set(userId, { count: 1, windowStart: now });
    return { limit: RATE_LIMIT, remaining: RATE_LIMIT - 1, reset: now + RATE_WINDOW_MS };
  }
  if (entry.count >= RATE_LIMIT) {
    throw new ApiError(429, "Rate limit exceeded. Try again later.", "RATE_LIMITED");
  }
  entry.count++;
  return {
    limit: RATE_LIMIT,
    remaining: RATE_LIMIT - entry.count,
    reset: entry.windowStart + RATE_WINDOW_MS,
  };
}

async function parseNaturalLanguage(input: string, customInstructions?: string | null) {
  let prompt = `You are a quote generation assistant for a contracting business.
Parse the following natural language request and return a JSON object with:
- description: a short summary of the job
- materials: an array of { name: string, quantity: number, unitPrice: number }
- labourCost: a number (total labour cost)

Rules:
- Add a 15% markup to all prices (materials and labour)
- Be realistic about quantities and pricing
- Return ONLY valid JSON, no markdown, no explanation
- Use GBP pricing`;

  if (customInstructions) {
    prompt += `\n\nCRITICAL - Use the following pricing and preferences from the business owner:\n${customInstructions}\n\nThese rates override any default pricing.`;
  }

  prompt += `\n\nInput: "${input}"`;

  const openai = await getOpenAI();
  const response = await openai.chat.completions.create({
    model: process.env.AI_MODEL ?? (process.env.GROQ_API_KEY ? "llama-3.3-70b-versatile" : "gpt-4o-mini"),
    messages: [{ role: "user", content: prompt }],
    temperature: 0.3,
    max_tokens: 500,
  });

  const content = response.choices[0]?.message?.content;
  if (!content) throw new ApiError(500, "AI failed to generate a response", "AI_GENERATION_FAILED");

  const cleaned = content.replace(/```(?:json)?\n?/g, "").trim();
  const parsed = JSON.parse(cleaned);

  const materialsTotal = (parsed.materials || []).reduce(
    (sum: number, m: { quantity: number; unitPrice: number }) =>
      sum + m.quantity * m.unitPrice,
    0,
  );
  const labourCost = parsed.labourCost ?? 0;

  return {
    description: parsed.description ?? "",
    materials: parsed.materials ?? [],
    labourCost,
    total: materialsTotal + labourCost,
  };
}

export async function POST(request: NextRequest) {
  const supabaseUrl = (process.env.NEXT_PUBLIC_SUPABASE_URL ?? "").trim().replace(/^["']|["']$/g, "").replace(/\n|\r/g, "");
  const anonKey = (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "").trim().replace(/^["']|["']$/g, "").replace(/\n|\r/g, "");

  try {
    const authHeader = request.headers.get("Authorization") ?? "";
    const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;
    if (!token) throw new ApiError(401, "Unauthorized");

    const supabase = createClient(supabaseUrl, anonKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    const { data: userData, error: userErr } = await supabase.auth.getUser(token);
    if (userErr || !userData.user) throw new ApiError(401, "Unauthorized");

    await supabase.auth.setSession({ access_token: token, refresh_token: token });
    const user = userData.user;
    await enforcePlanLimit(user.id, "ai_generate");
    const rateLimit = checkRateLimit(user.id);

    const body = await request.json();
    const input = sanitizeString(body.input);
    if (input.length < 3) {
      throw new ApiError(400, "Input must be at least 3 characters", "VALIDATION_ERROR");
    }

    // Fetch custom AI instructions
    let customInstructions: string | null = null;
    try {
      const { data: profile } = await supabase
        .from("profiles")
        .select("custom_ai_instructions")
        .eq("id", user.id)
        .single();
      customInstructions = (profile as { custom_ai_instructions?: string } | null)?.custom_ai_instructions ?? null;
    } catch { /* skip if column doesn't exist */ }

    const result = await parseNaturalLanguage(input, customInstructions);

    return NextResponse.json(
      {
        description: result.description,
        materials: result.materials,
        labourCost: result.labourCost,
        total: result.total,
      },
      {
        headers: {
          "X-RateLimit-Limit": String(rateLimit.limit),
          "X-RateLimit-Remaining": String(rateLimit.remaining),
          "X-RateLimit-Reset": String(rateLimit.reset),
        },
      },
    );
  } catch (error) {
    if (error instanceof SyntaxError) {
      return Response.json(
        { error: "AI returned invalid response. Try rephrasing." },
        { status: 500 },
      );
    }
    return errorResponse(error);
  }
}
