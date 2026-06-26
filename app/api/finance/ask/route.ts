import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { sanitizeString } from "@/lib/validation";
import { ApiError, errorResponse } from "@/lib/api-error";
import { PLANS, normalizeTier } from "@/lib/stripe";

let _openai: any = null;
async function getOpenAI() {
  if (!_openai) {
    const { default: OpenAI } = await import("openai");
    const apiKey = process.env.GROQ_API_KEY || process.env.OPENAI_API_KEY || "";
    const baseURL = process.env.GROQ_API_KEY ? "https://api.groq.com/openai/v1" : undefined;
    _openai = new OpenAI({ apiKey, baseURL });
  }
  return _openai;
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient(request);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new ApiError(401, "Unauthorized");

    // Plan-based rate limit: check profile tier
    const admin = createAdminClient();
    const { data: profile } = await admin
      .from("profiles")
      .select("plan_tier, cost_rates")
      .eq("id", user.id)
      .single();

    const tier = normalizeTier((profile as { plan_tier?: string } | null)?.plan_tier ?? "solo");
    const plan = PLANS[tier];
    const costRates = (profile as { cost_rates?: string } | null)?.cost_rates ?? null;

    // Count AI finance queries this month for rate limiting
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
    const { count } = await supabase
      .from("quotes")
      .select("*", { count: "exact", head: true })
      .eq("user_id", user.id)
      .gte("created_at", monthStart);

    const monthlyLimit = plan.aiGenerationsPerMonth > 0 ? Math.ceil(plan.aiGenerationsPerMonth / 2) : -1;
    if (monthlyLimit > 0 && count != null && count >= monthlyLimit) {
      throw new ApiError(429, `Monthly AI query limit reached (${monthlyLimit}). Please wait until next month.`);
    }

    const body = await request.json();
    const question = sanitizeString(body.question);
    const context = body.context;

    if (!question || question.length < 3) throw new ApiError(400, "Question must be at least 3 characters");

    const systemPrompt = `You are a finance assistant for a tradesperson using JobStacker.

You have access to ALL their financial data: revenue, expenses, jobs, quotes, and per-job cost estimates.

RULES:
- "patio cleaning" and "patio clean" are the SAME service — always merge similar services.
- "hedge trimming" and "hedge trim" are the same. General gardening and labour both count as "gardening labour".
- When asked about costs, check the cost_sync data (perJobCost) and also look at expenses.
- When answering, ALWAYS reference specific figures from the data.
- If a cost is set per job (e.g. patio cleaning = £15), show that cost and how many times it was incurred.
- Never invent numbers. If data is missing, say so.
- Keep answers practical and specific to the user's business.
- Always end with: "Estimates only. Always consult a qualified accountant."`;

    const contextStr = typeof context === "string" ? context : JSON.stringify(context, null, 2);
    const fullContext = costRates
      ? `COST RATES FROM PROFILE:\n${costRates}\n\nFINANCIAL DATA:\n${contextStr}`
      : contextStr;

    const openai = await getOpenAI();
    const response = await openai.chat.completions.create({
      model: process.env.AI_MODEL ?? (process.env.GROQ_API_KEY ? "llama-3.3-70b-versatile" : "gpt-4o-mini"),
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: `Question: ${question}\n\n${fullContext}` },
      ],
      temperature: 0.3,
      max_tokens: 400,
    });

    const answer = response.choices[0]?.message?.content?.trim() ?? "Unable to generate an answer. Please try again.";

    return NextResponse.json({ answer });
  } catch (error) {
    return errorResponse(error);
  }
}
