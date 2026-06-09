import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
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
  try {
    const supabase = await createServerSupabaseClient(request);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new ApiError(401, "Unauthorized");

    const body = await request.json();
    const question = sanitizeString(body.question);
    const context = body.context;

    if (!question || question.length < 3) throw new ApiError(400, "Question must be at least 3 characters");

    const systemPrompt = `You are a finance assistant for a tradesperson using JobStacker. 
Answer ONLY using the financial data provided below.
Never fabricate numbers or invent information that is not in the data.
If the data is missing for a specific question, say so honestly.
Keep answers concise, practical, and helpful.
Always include specific figures when available.
Always end with: "Estimates only. Always consult a qualified accountant."`;

    const contextStr = typeof context === "string" ? context : JSON.stringify(context, null, 2);

    const openai = await getOpenAI();
    const response = await openai.chat.completions.create({
      model: process.env.AI_MODEL ?? (process.env.GROQ_API_KEY ? "llama-3.3-70b-versatile" : "gpt-4o-mini"),
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: `Question: ${question}\n\nFinancial data:\n${contextStr}` },
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
