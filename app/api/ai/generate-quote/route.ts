import { NextRequest, NextResponse } from "next/server";
import type OpenAI from "openai";
import { createClient } from "@supabase/supabase-js";
import { sanitizeString } from "@/lib/validation";
import { ApiError, errorResponse } from "@/lib/api-error";
import { enforcePlanLimit } from "@/lib/plan-enforcement";
import { calculateFromCatalogue, parseJobIntoTasks, parseServicesFromProfile } from "@/lib/pricing-engine";
import { REGIONS } from "@/lib/localization";
import { getAiClient, getAiModel, checkDeepSeekConfigured } from "@/lib/ai-provider";
import { PLANS, normalizeTier } from "@/lib/stripe";

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

async function estimateWithAI(
  input: string,
  regionLabel: string,
  currencyCode: string,
  costRates?: string,
  tier: "premium" | "standard" = "standard",
): Promise<{
  description: string; materials: Array<{ name: string; quantity: number; unitPrice: number }>;
  labourCost: number; total: number;
}> {
  const client = await getAiClient(tier);
  const model = await getAiModel(tier);
  let rateGuidance = "";
  if (costRates?.trim()) {
    rateGuidance = `\nUse these cost rates when available:\n${costRates}\n`;
  }

  const response = await client.chat.completions.create({
    model,
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

    // Fetch profile data
    let customInstructions = "";
    let regionCode = "UK";
    let currencyCode = "GBP";
    let costRates = "";
    let taxRate = 0;
    let planTier = "solo";
    try {
      const { data: profile } = await supabase
        .from("profiles").select("custom_ai_instructions, region_code, currency_code, cost_rates, default_tax_rate, plan_tier")
        .eq("id", user.id).single();
      if (profile) {
        customInstructions = (profile as { custom_ai_instructions?: string }).custom_ai_instructions ?? "";
        regionCode = (profile as { region_code?: string }).region_code ?? "UK";
        currencyCode = (profile as { currency_code?: string }).currency_code ?? "GBP";
        costRates = (profile as { cost_rates?: string }).cost_rates ?? "";
        taxRate = Number((profile as { default_tax_rate?: number }).default_tax_rate ?? 0);
        planTier = normalizeTier((profile as { plan_tier?: string }).plan_tier ?? "solo");
      }
    } catch { /* skip */ }

    const services = parseServicesFromProfile(costRates);
    const plan = PLANS[planTier as keyof typeof PLANS] ?? PLANS.solo;
    const regionName = REGIONS[regionCode]?.name ?? "United Kingdom";

    // If structured services exist, use the catalogue engine (no AI cost)
    if (services.length > 0) {
      const overheads = [
        { name: "Fuel", amount: 8, per: "job" as const },
        { name: "Equipment Wear", amount: 3, per: "job" as const },
      ];
      const tasks = parseJobIntoTasks(input);
      let result = calculateFromCatalogue(tasks, services, overheads, taxRate > 0 ? taxRate : 20);

      if (result.status === "success") {
        const rateLimit = checkRateLimit(user.id);
        return NextResponse.json({
          description: input.substring(0, 50),
          materials: result.items.map(it => ({
            name: it.serviceName, quantity: it.quantity,
            unitPrice: it.unitCharge, unit: it.unit,
            cost: it.unitCost, profit: it.profit, margin: it.marginPct,
          })),
          labourCost: 0,
          total: result.grandTotal,
          subtotal: result.subtotal,
          overheads: result.overheads,
          taxAmount: result.taxAmount,
          taxRate: result.taxRate,
          profit: result.totalProfit,
          costBreakdown: result.items,
          pricingSource: "structured_catalogue",
          modelTier: "catalogue",
        }, {
          headers: {
            "X-RateLimit-Limit": String(rateLimit.limit),
            "X-RateLimit-Remaining": String(rateLimit.remaining),
            "X-RateLimit-Reset": String(rateLimit.reset),
          },
        });
      }

      return NextResponse.json({ status: "missing", missingItem: result.missingItem, message: `No catalogue entry found for "${result.missingItem}"` }, { status: 400 });
    }

    // Determine which AI model tier to use
    const deepSeekAvailable = await checkDeepSeekConfigured();
    let aiTier: "premium" | "standard" = "standard";

    if (deepSeekAvailable && plan.deepSeekGenerations !== 0) {
      // Count quotes created this month for DeepSeek quota
      const now = new Date();
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
      const { count } = await supabase
        .from("quotes")
        .select("*", { count: "exact", head: true })
        .eq("user_id", user.id)
        .gte("created_at", monthStart);

      const deepSeekQuota = plan.deepSeekGenerations === -1 ? Infinity : plan.deepSeekGenerations;
      if (count != null && count < deepSeekQuota) {
        aiTier = "premium";
      }
    }

    // AI estimation
    const rateLimit = checkRateLimit(user.id);
    const result = await estimateWithAI(input, regionName, currencyCode, costRates, aiTier);

    return NextResponse.json({
      description: result.description,
      materials: result.materials.map(m => ({ name: m.name, quantity: m.quantity, unitPrice: Math.round(m.unitPrice * 100) / 100 })),
      labourCost: result.labourCost,
      total: result.total,
      pricingSource: "ai_estimate",
      modelTier: aiTier,
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
