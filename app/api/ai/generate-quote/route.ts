import { NextRequest, NextResponse } from "next/server";
import type OpenAI from "openai";
import { createServerSupabaseClient } from "@/lib/supabase/server";
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

async function parseNaturalLanguage(input: string) {
  const prompt = `You are a quote generation assistant for a contracting business.
Parse the following natural language request and return a JSON object with:
- description: a short summary of the job
- materials: an array of { name: string, quantity: number, unitPrice: number }
- labourCost: a number (total labour cost)

Rules:
- Add a 15% markup to all prices (materials and labour)
- Be realistic about quantities and pricing
- Return ONLY valid JSON, no markdown, no explanation
- Use GBP pricing

Input: "${input}"`;

  const openai = await getOpenAI();
  const response = await openai.chat.completions.create({
    model: process.env.AI_MODEL ?? (process.env.GROQ_API_KEY ? "llama-3.3-70b-versatile" : "gpt-4o-mini"),
    messages: [{ role: "user", content: prompt }],
    temperature: 0.3,
    max_tokens: 500,
  });

  const content = response.choices[0]?.message?.content;
  if (!content) throw new ApiError(500, "AI failed to generate a response", "AI_GENERATION_FAILED");

  // Strip markdown code fences if present
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
  try {
    let user = null;

    const authHeader = request.headers.get("Authorization") ?? "";
    const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;

    const supabase = await createServerSupabaseClient(request);

    if (token) {
      const { data } = await supabase.auth.getUser(token);
      user = data.user;
    }

    if (!user) {
      const { data } = await supabase.auth.getUser();
      user = data.user;
    }

    if (!user) throw new ApiError(401, "Unauthorized");

    await enforcePlanLimit(user.id, "ai_generate");

    const rateLimit = checkRateLimit(user.id);

    const body = await request.json();
    const input = sanitizeString(body.input);

    if (input.length < 3) {
      throw new ApiError(400, "Input must be at least 3 characters", "VALIDATION_ERROR");
    }

    const result = await parseNaturalLanguage(input);

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
