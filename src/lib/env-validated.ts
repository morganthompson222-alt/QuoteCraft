const REQUIRED_ENV_VARS = [
  "NEXT_PUBLIC_SUPABASE_URL",
  "NEXT_PUBLIC_SUPABASE_ANON_KEY",
  "SUPABASE_SERVICE_ROLE_KEY",
  "STRIPE_SECRET_KEY",
  "NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY",
] as const;

const OPTIONAL_ENV_VARS = [
  "STRIPE_WEBHOOK_SECRET",
  "OPENAI_API_KEY",
  "STRIPE_PRO_PRICE_ID",
  "STRIPE_UNLIMITED_PRICE_ID",
  "NEXT_PUBLIC_APP_URL",
] as const;

let validated = false;

export function validateEnv(): void {
  if (validated) return;

  const missing: string[] = [];

  for (const key of REQUIRED_ENV_VARS) {
    if (!process.env[key]) {
      missing.push(key);
    }
  }

  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables:\n  ${missing.join("\n  ")}\n\n` +
        "See .env.example for all required variables.",
    );
  }

  if (process.env.NEXT_PUBLIC_SUPABASE_URL) {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    if (!url.startsWith("https://") && !url.startsWith("http://localhost")) {
      throw new Error("NEXT_PUBLIC_SUPABASE_URL must start with https:// or http://localhost");
    }
  }

  validated = true;
}
