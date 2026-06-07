import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { ApiError, errorResponse } from "@/lib/api-error";

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

export async function GET(request: NextRequest) {
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

    const userId = userData.user.id;

    // Fetch all quote items with their quote dates
    const { data: items } = await supabase
      .from("quote_items")
      .select("description, unit_price, quantity, quotes!inner(created_at, paid)")
      .eq("quotes.user_id", userId)
      .order("quotes(created_at)", { ascending: false })
      .limit(200);

    // Fetch AI instructions
    const { data: profile } = await supabase
      .from("profiles")
      .select("custom_ai_instructions")
      .eq("id", userId)
      .single();

    const instructions = (profile as { custom_ai_instructions?: string } | null)?.custom_ai_instructions ?? "";

    // Build item summary
    const itemMap = new Map<string, { prices: number[]; quantities: number[]; count: number }>();
    for (const item of items ?? []) {
      const desc = (item.description as string).toLowerCase().trim();
      if (!desc || desc.length < 2) continue;
      const key = desc;
      const existing = itemMap.get(key);
      if (existing) {
        existing.prices.push(Number(item.unit_price ?? 0));
        existing.quantities.push(Number(item.quantity ?? 1));
        existing.count++;
      } else {
        itemMap.set(key, {
          prices: [Number(item.unit_price ?? 0)],
          quantities: [Number(item.quantity ?? 1)],
          count: 1,
        });
      }
    }

    // Build summary text
    const summaries = Array.from(itemMap.entries())
      .filter(([_, v]) => v.count >= 1)
      .map(([desc, v]) => {
        const avgPrice = v.prices.reduce((a, b) => a + b, 0) / v.prices.length;
        return `- Used "${desc}" ${v.count}× at avg £${avgPrice.toFixed(2)} per unit`;
      })
      .join("\n");

    const openai = await getOpenAI();
    const response = await openai.chat.completions.create({
      model: process.env.AI_MODEL ?? (process.env.GROQ_API_KEY ? "llama-3.3-70b-versatile" : "gpt-4o-mini"),
      messages: [{
        role: "system",
        content: `You are a service catalogue builder for a tradesperson. 
Based on their pricing instructions and quote history, create a clean catalogue of ALL their services with standardised pricing.

Rules:
- Merge similar services (e.g. "hedge trim", "hedge cutting" → "Hedge trimming")
- Use the prices from instructions if available, otherwise use average from history
- Standardise units: per hour, per sqm, per metre, per item, per job
- Output as a clean list: "Service name = £X per unit"
- Group related services under category headings
- Output ONLY the catalogue text, no explanations`,
      }, {
        role: "user",
        content: `${instructions ? `PRICING INSTRUCTIONS:\n${instructions}\n\n` : ""}QUOTE HISTORY (${items?.length ?? 0} line items):\n${summaries}\n\nBuild a complete service catalogue from this data.`,
      }],
      temperature: 0.2,
      max_tokens: 800,
    });

    const catalogue = response.choices[0]?.message?.content?.trim() ?? "Could not generate catalogue.";

    return NextResponse.json({ catalogue, itemCount: items?.length ?? 0 });
  } catch (error) {
    return errorResponse(error);
  }
}
