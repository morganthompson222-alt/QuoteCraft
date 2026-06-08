import { NextRequest, NextResponse } from "next/server";
import type OpenAI from "openai";
import { createClient } from "@supabase/supabase-js";
import { sanitizeString } from "@/lib/validation";
import { ApiError, errorResponse } from "@/lib/api-error";
import { enforcePlanLimit } from "@/lib/plan-enforcement";
import { calculateQuote, calculateFromAITasks, getPricingPrompt } from "@/lib/pricing-engine";
import { REGIONS } from "@/lib/localization";

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

async function estimateWithAI(input: string, regionLabel: string, currencyCode: string, costRates?: string): Promise<{
  description: string; materials: Array<{ name: string; quantity: number; unitPrice: number }>;
  labourCost: number; total: number;
}> {
  const openai = await getOpenAI();
  let rateGuidance = "";
  if (costRates?.trim()) {
    rateGuidance = `\nUse these cost rates when available:\n${costRates}\n`;
  }

  const response = await openai.chat.completions.create({
    model: process.env.AI_MODEL ?? (process.env.GROQ_API_KEY ? "llama-3.3-70b-versatile" : "gpt-4o-mini"),
    messages: [{
      role: "user",
      content: `Generate a detailed quote for this job: "${input}"

Return JSON:
{
  "description": "brief job summary",
  "materials": [
    { "name": "material name", "quantity": number, "unitPrice": number }
  ],
  "labourCost": number
}

Rules:
- Apply 15% markup to all costs
- Use ${currencyCode} pricing, realistic ${regionLabel} rates
- Include ALL materials needed (supplies, parts, consumables)
- Estimate labour cost based on time × local trade rates${rateGuidance}
- Separate material costs from labour — materials use unitPrice, labourCost is total
- Round to 2 decimal places
- Return ONLY valid JSON, no markdown, no explanation`,
    }],
    temperature: 0.3,
    max_tokens: 600,
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

    // Fetch custom instructions, region, and cost rates
    let customInstructions = "";
    let regionCode = "UK";
    let currencyCode = "GBP";
    let costRates = "";
    try {
      const { data: profile } = await supabase
        .from("profiles").select("custom_ai_instructions, region_code, currency_code, cost_rates")
        .eq("id", user.id).single();
      if (profile) {
        customInstructions = (profile as { custom_ai_instructions?: string }).custom_ai_instructions ?? "";
        regionCode = (profile as { region_code?: string }).region_code ?? "UK";
        currencyCode = (profile as { currency_code?: string }).currency_code ?? "GBP";
        costRates = (profile as { cost_rates?: string }).cost_rates ?? "";
      }
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
    const regionName = REGIONS[regionCode]?.name ?? "United Kingdom";
    const result = await estimateWithAI(input, regionName, currencyCode, costRates);
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
