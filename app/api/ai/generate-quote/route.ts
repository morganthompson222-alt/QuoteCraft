import { NextRequest, NextResponse } from "next/server";
import type OpenAI from "openai";
import { createClient } from "@supabase/supabase-js";
import { sanitizeString } from "@/lib/validation";
import { ApiError, errorResponse } from "@/lib/api-error";
import { enforcePlanLimit } from "@/lib/plan-enforcement";
import { calculateQuote, calculateFromAITasks, getPricingPrompt } from "@/lib/pricing-engine";

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
  return { limit: RATE_LIMIT, remaining: RATE_LIMIT - entry.count, reset: entry.windowStart + RATE_WINDOW_MS };
}

async function parseJobWithAI(input: string, pricingPrompt: string): Promise<string | null> {
  const openai = await getOpenAI();
  const response = await openai.chat.completions.create({
    model: process.env.AI_MODEL ?? (process.env.GROQ_API_KEY ? "llama-3.3-70b-versatile" : "gpt-4o-mini"),
    messages: [
      { role: "system", content: pricingPrompt },
      { role: "user", content: `Parse this job: "${input}"` },
    ],
    temperature: 0.1,
    max_tokens: 400,
  });

  const content = response.choices[0]?.message?.content;
  if (!content) return null;
  const cleaned = content.replace(/```(?:json)?\n?/g, "").trim();
  return cleaned;
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
    if (input.length < 3) throw new ApiError(400, "Input must be at least 3 characters", "VALIDATION_ERROR");

    // Fetch user instructions
    let customInstructions = "";
    try {
      const { data: profile } = await supabase
        .from("profiles")
        .select("custom_ai_instructions")
        .eq("id", user.id)
        .single();
      customInstructions = (profile as { custom_ai_instructions?: string } | null)?.custom_ai_instructions ?? "";
    } catch { /* skip */ }

    // Try AI-powered parsing first
    let result;
    try {
      const pricingPrompt = getPricingPrompt(customInstructions);
      const parseResult = await parseJobWithAI(input, pricingPrompt);

      if (parseResult) {
        try {
          const tasks = JSON.parse(parseResult);
          if (Array.isArray(tasks) && tasks.length > 0) {
            result = calculateFromAITasks(
              tasks as Array<{ task: string; quantity?: number; unit?: string }>,
              customInstructions,
            );
          }
        } catch { /* AI parsing failed — fall through */ }
      }
    } catch (aiErr) {
      // AI parsing failed — fall back to rule-based
    }

    // Fallback: rule-based parsing without AI
    if (!result) {
      result = calculateQuote(input, customInstructions);
    }

    if (result.status === "missing_data") {
      return NextResponse.json(result, { status: 400 });
    }

    const total = result.status === "success" ? result.total : 0;
    const materials = result.status === "success"
      ? result.breakdown.map((b) => ({
          name: b.item,
          quantity: b.quantity,
          unitPrice: b.unitPrice,
          unit: b.calculation.split("×")[1]?.trim() ?? "",
        }))
      : [];

    return NextResponse.json(
      {
        description: input.substring(0, 50),
        materials,
        labourCost: total,
        total,
        sourceMap: result.status === "success" ? result.sourceMap : {},
        breakdown: result.status === "success" ? result.breakdown : [],
        pricingSource: result.status === "success" ? "rules_engine" : "missing",
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
      return Response.json({ error: "AI returned invalid response. Try rephrasing." }, { status: 500 });
    }
    return errorResponse(error);
  }
}
