import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { sanitizeString } from "@/lib/validation";
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

    const body = await request.json();
    const instructions = sanitizeString(body.instructions);

    if (instructions.length < 5) {
      throw new ApiError(400, "Instructions must be at least 5 characters");
    }

    const openai = await getOpenAI();
    const response = await openai.chat.completions.create({
      model: process.env.AI_MODEL ?? (process.env.GROQ_API_KEY ? "llama-3.3-70b-versatile" : "gpt-4o-mini"),
      messages: [{
        role: "system",
        content: `You are a pricing formatter for a tradesperson. Clean up these notes into clear, machine-readable pricing rules.

Rules:
- Remove duplicates, filler words, and redundancy
- Keep ALL pricing data intact — never delete a rate
- **Preserve tiered pricing as a single line** — e.g. "£30 first metre, £18 per additional metre" stays as one line, NOT split into two
- Format flat rates as: "service" = £X per unit
- Format tiered rates as: "service" = £X first UNIT, £Y per additional UNIT
- Standardise units: "per hour", "per sqm", "per metre", "per ton", "per item"
- If a service has no unit, default to "per job"
- Remove markdown, quotes, and explanations
- Output ONLY the cleaned text

Example 1 (flat rate):
Input: "so i ussually charge about 80 an hour for tree work"
Output: Tree cutting/work = £80 per hour

Example 2 (tiered pricing — KEEP TOGETHER):
Input: "for gutter cleaning i charge £30 for the first meter and then £18 for every additional meter"
Output: Gutter cleaning = £30 first metre, £18 per additional metre

Now clean up:

${instructions}`,
      }, {
        role: "user",
        content: `Clean up these pricing instructions:\n\n${instructions}`,
      }],
      temperature: 0.2,
      max_tokens: 500,
    });

    const cleaned = response.choices[0]?.message?.content?.trim() ?? instructions;

    return NextResponse.json({ cleaned });
  } catch (error) {
    return errorResponse(error);
  }
}
