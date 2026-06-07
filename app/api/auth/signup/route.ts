import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  sanitizeEmail,
  sanitizeString,
  sanitizeOptionalString,
} from "@/lib/validation";
import { ApiError, errorResponse } from "@/lib/api-error";
import { REGIONS } from "@/lib/localization";

async function tryAdminSignup(email: string, password: string, name: string | null, region: { code: string; currencyCode: string; locale: string }) {
  const admin = createAdminClient();

  const { data: existingUsers } = await admin.auth.admin.listUsers();
  const exists = existingUsers?.users?.find(
    (u: { email?: string }) => u.email?.toLowerCase() === email.toLowerCase()
  );
  if (exists) {
    throw new ApiError(409, "Email already registered");
  }

  const { data: newUser, error: createErr } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { name, region_code: region.code },
  });

  if (createErr || !newUser?.user) {
    throw new Error(createErr?.message ?? "Failed to create account");
  }

  await admin.from("profiles").upsert({
    id: newUser.user.id,
    plan_tier: "solo",
    region_code: region.code,
    currency_code: region.currencyCode,
    locale: region.locale,
  });

  return newUser.user;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const email = sanitizeEmail(body.email);
    const password = sanitizeString(body.password);
    const name = sanitizeOptionalString(body.name);

    const rawRegion = sanitizeOptionalString(body.region_code) ?? "UK";
    const region = REGIONS[rawRegion.toUpperCase()];
    if (!region) {
      throw new ApiError(400, "Invalid region", "VALIDATION_ERROR");
    }

    if (password.length < 6) {
      throw new ApiError(400, "Password must be at least 6 characters");
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (!supabaseUrl || !supabaseKey) {
      throw new ApiError(400, "Account creation unavailable. Contact support.", "CONFIG_ERROR");
    }

    // Try admin API first (bypasses email rate limits & confirmation)
    // If admin fails for any reason, fall back to standard signUp
    let userId: string | undefined;
    let didAdminWork = false;

    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (serviceKey) {
      try {
        const user = await tryAdminSignup(email, password, name, region);
        userId = user.id;
        didAdminWork = true;
      } catch (adminError) {
        // Admin path failed — silently fall through to standard signUp
      }
    }

    if (!didAdminWork) {
      const supabase = await createServerSupabaseClient(request);
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { name, region_code: region.code } },
      });

      if (error) {
        if (error.message.includes("already registered")) {
          throw new ApiError(409, "Email already registered");
        }
        if (error.message.includes("rate limit") || error.message.includes("over_email")) {
          throw new ApiError(429, "Please wait a moment and try again.");
        }
        throw new ApiError(400, error.message);
      }

      if (!data.user?.id) {
        throw new ApiError(500, "Failed to create account");
      }

      userId = data.user.id;

      // Try to upsert profile with admin client (best effort)
      try {
        const admin = createAdminClient();
        await admin.from("profiles").upsert({
          id: data.user.id,
          plan_tier: "solo",
          region_code: region.code,
          currency_code: region.currencyCode,
          locale: region.locale,
        });
      } catch { /* silent */ }
    }

    // Sign in to get a session token
    const supabase = await createServerSupabaseClient(request);
    const { data: session, error: signInErr } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (signInErr) {
      throw new ApiError(400, "Account created. Please log in now.");
    }

    return NextResponse.json({
      userId,
      email,
      token: session.session.access_token,
    });
  } catch (error) {
    return errorResponse(error);
  }
}
