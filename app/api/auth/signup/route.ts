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

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (!supabaseUrl || !supabaseKey) {
      throw new ApiError(400, "Account creation unavailable. Contact support.", "CONFIG_ERROR");
    }

    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    // Try admin API first (bypasses email confirmation & rate limits)
    if (serviceKey) {
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

      if (createErr) {
        if (createErr.message.includes("already been registered")) {
          throw new ApiError(409, "Email already registered");
        }
        throw new ApiError(400, createErr.message);
      }

      if (!newUser.user) {
        throw new ApiError(500, "Failed to create account");
      }

      await admin.from("profiles").upsert({
        id: newUser.user.id,
        plan_tier: "solo",
        region_code: region.code,
        currency_code: region.currencyCode,
        locale: region.locale,
      });

      const supabase = await createServerSupabaseClient(request);
      const { data: session, error: signInErr } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInErr) {
        throw new ApiError(400, "Account created. Please log in.");
      }

      return NextResponse.json({
        userId: newUser.user.id,
        email: newUser.user.email,
        token: session.session.access_token,
      });
    }

    // Fallback: standard signUp via anon key
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
      if (error.message.includes("rate limit") || error.message.includes("rate_limit")) {
        throw new ApiError(429, "Please wait a moment and try again. If this persists, contact support.");
      }
      throw new ApiError(400, error.message);
    }

    if (data.user && data.user.id) {
      try {
        const admin = createAdminClient();
        await admin.from("profiles").upsert({
          id: data.user.id,
          plan_tier: "solo",
          region_code: region.code,
          currency_code: region.currencyCode,
          locale: region.locale,
        });
      } catch {
        // silent — DB trigger should handle it
      }
    }

    return NextResponse.json({
      userId: data.user!.id,
      email: data.user!.email,
      token: data.session!.access_token,
    });
  } catch (error) {
    return errorResponse(error);
  }
}
