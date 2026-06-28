const DEEPSEEK_BASE_URL = "https://api.deepseek.com/v1";

export type AiModelTier = "premium" | "standard";

function getApiKey(tier: AiModelTier): string {
  if (tier === "premium") {
    return process.env.DEEPSEEK_API_KEY || process.env.GROQ_API_KEY || process.env.OPENAI_API_KEY || "";
  }
  return process.env.GROQ_API_KEY || process.env.OPENAI_API_KEY || "";
}

function getBaseUrl(tier: AiModelTier): string | undefined {
  if (tier === "premium") {
    return DEEPSEEK_BASE_URL;
  }
  if (process.env.GROQ_API_KEY) return "https://api.groq.com/openai/v1";
  return undefined;
}

function getModel(tier: AiModelTier): string {
  if (tier === "premium") return "deepseek-chat";
  return process.env.AI_MODEL ?? (process.env.GROQ_API_KEY ? "llama-3.3-70b-versatile" : "gpt-4o-mini");
}

let _clients: Record<string, any> = {};

export async function getAiClient(tier: AiModelTier): Promise<any> {
  const key = `${tier}-${getBaseUrl(tier) || "openai"}`;
  if (_clients[key]) return _clients[key];

  const { default: OpenAI } = await import("openai");
  const apiKey = getApiKey(tier);
  const baseURL = getBaseUrl(tier);

  _clients[key] = new OpenAI({ apiKey, baseURL });
  return _clients[key];
}

export async function getAiModel(tier: AiModelTier): Promise<string> {
  return getModel(tier);
}

export async function checkDeepSeekConfigured(): Promise<boolean> {
  return !!process.env.DEEPSEEK_API_KEY;
}
