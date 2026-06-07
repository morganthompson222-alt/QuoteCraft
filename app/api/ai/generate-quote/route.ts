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
    throw new ApiError(429, "Rate limit exceeded.", "RATE_LIMITED");
  }
  entry.count++;
  return { limit: RATE_LIMIT, remaining: RATE_LIMIT - entry.count, reset: entry.windowStart + RATE_WINDOW_MS };
}

async function estimateWithAI(input: string): Promise<{
  description: string; materials: Array<{ name: string; quantity: number; unitPrice: number }>;
  labourCost: number; total: number;
}> {
  const openai = await getOpenAI();
  const response = await openai.chat.completions.create({
    model: process.env.AI_MODEL ?? (process.env.GROQ_API_KEY ? "llama-3.3-70b-versatile" : "gpt-4o-mini"),
    messages: [{
      role: "user",
      content: `Generate a realistic quote for: "${input}"

Return JSON: { "description": "...", "materials": [{ "name": "...", "quantity": number, "unitPrice": number }], "labourCost": number }

Rules:
- Add 15% markup to all prices
- Use GBP pricing, realistic UK 2026 rates
- Return ONLY valid JSON, no markdown`,
    }],
    temperature: 0.3,
    max_tokens: 500,
  });

  const content = response.choices[0]?.message?.content;
  if (!content) throw new ApiError(500, "AI failed to respond");
  const cleaned = content.replace(/```(?:json)?\n?/g, "").trim();
  const parsed = JSON.parse(cleaned);
  const materialsTotal = (parsed.materials || []).reduce(
    (sum: number, m: { quantity: number; unitPrice: number }) => sum + m.quantity * m.unitPrice, 0,
  );
  return {
    description: parsed.description ?? input,
    materials: parsed.materials ?? [],
    labourCost: parsed.labourCost ?? 0,
    total: materialsTotal + (parsed.labourCost ?? 0),
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

    const body = await request.json();
    const input = sanitizeString(body.input);
    if (input.length < 3) throw new ApiError(400, "Input must be at least 3 characters");

    // Fetch custom instructions
    let customInstructions = "";
    try {
      const { data: profile } = await supabase
        .from("profiles").select("custom_ai_instructions")
        .eq("id", user.id).single();
      customInstructions = (profile as { custom_ai_instructions?: string } | null)?.custom_ai_instructions ?? "";
    } catch { /* skip */ }

    const hasInstructions = customInstructions.trim().length > 0;

    // If user has custom instructions, use the rules engine
    if (hasInstructions) {
      let result;
      try {
        const pricingPrompt = getPricingPrompt(customInstructions);
        const parseResult = await parseJobWithAI(input, pricingPrompt, getOpenAI);
        if (parseResult) {
          const tasks = JSON.parse(parseResult);
          if (Array.isArray(tasks) && tasks.length > 0) {
            result = calculateFromAITasks(
              tasks as Array<{ task: string; quantity?: number; unit?: string }>,
              customInstructions,
            );
          }
        }
      } catch { /* AI parsing failed */ }

      if (!result) result = calculateQuote(input, customInstructions);

      if (result.status === "success") {
        const rateLimit = checkRateLimit(user.id);
        return NextResponse.json({
          description: input.substring(0, 50),
          materials: result.breakdown.map(b => ({
            name: b.item, quantity: b.quantity, unitPrice: Math.round(b.unitPrice * 100) / 100,
          })),
          labourCost: 0,
          total: result.total,
          sourceMap: result.sourceMap,
          breakdown: result.breakdown,
          pricingSource: "rules_engine",
        }, { headers: { "X-RateLimit-Limit": String(rateLimit.limit), "X-RateLimit-Remaining": String(rateLimit.remaining), "X-RateLimit-Reset": String(rateLimit.reset) } });
      }

      // Missing data — tell user what's missing
      return NextResponse.json(result, { status: 400 });
    }

    // No custom instructions — use AI estimation
    const rateLimit = checkRateLimit(user.id);
    const result = await estimateWithAI(input);
    return NextResponse.json({
      description: result.description,
      materials: result.materials.map(m => ({ name: m.name, quantity: m.quantity, unitPrice: Math.round(m.unitPrice * 100) / 100 })),
      labourCost: result.labourCost,
      total: result.total,
      pricingSource: "ai_estimate",
    }, {
      headers: {
        "X-RateLimit-Limit": String(rateLimit.limit),
        "X-RateLimit-Remaining": String(rateLimit.remaining),
        "X-RateLimit-Reset": String(rateLimit.reset),
      },
    });
  } catch (error) {
    if (error instanceof SyntaxError) {
      return Response.json({ error: "AI returned invalid response." }, { status: 500 });
    }
    return errorResponse(error);
  }
}

async function parseJobWithAI(input: string, pricingPrompt: string, getAI: typeof getOpenAI): Promise<string | null> {
  const openai = await getAI();
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
  return content.replace(/```(?:json)?\n?/g, "").trim();
}
