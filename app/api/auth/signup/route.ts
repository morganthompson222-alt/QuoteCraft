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

    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (!url || !key) {
      throw new ApiError(400, "Account creation unavailable. Contact support.", "CONFIG_ERROR");
    }

    const admin = createAdminClient();

    // Check if email already exists
    const { data: existingUsers } = await admin.auth.admin.listUsers();
    const existing = existingUsers?.users?.find(
      (u: { email?: string }) => u.email?.toLowerCase() === email.toLowerCase()
    );
    if (existing) {
      throw new ApiError(409, "Email already registered");
    }

    // Create user via admin API (bypasses email confirmation & rate limits)
    const { data: newUser, error: createErr } = await admin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { name, region_code: region.code },
    });

    if (createErr) {
      if (createErr.message.includes("already been registered")) {
        throw new ApiError(409, "Email already registered");
      }
      throw new ApiError(400, createErr.message);
    }

    if (!newUser.user) {
      throw new ApiError(500, "Failed to create account");
    }

    // Create profile with correct plan_tier (admin client bypasses RLS & trigger constraints)
    await admin.from("profiles").upsert({
      id: newUser.user.id,
      plan_tier: "solo",
      region_code: region.code,
      currency_code: region.currencyCode,
      locale: region.locale,
    });

    // Sign in to get a session token
    const supabase = await createServerSupabaseClient(request);
    const { data: session, error: signInErr } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (signInErr) {
      throw new ApiError(400, "Account created but unable to sign in. Please try logging in.");
    }

    return NextResponse.json({
      userId: newUser.user.id,
      email: newUser.user.email,
      token: session.session.access_token,
    });
  } catch (error) {
    return errorResponse(error);
  }
}
