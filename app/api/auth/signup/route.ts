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
      throw new ApiError(400, error.message.includes("rate limit")
        ? "Please wait a moment and try again."
        : "Unable to create account. Please try again later.");
    }

    if (data.user && data.user.id) {
      try {
        const admin = createAdminClient();
        await admin
          .from("profiles")
          .upsert({
            id: data.user.id,
            region_code: region.code,
            currency_code: region.currencyCode,
            locale: region.locale,
          });
      } catch {
        // profile creation handled by DB trigger — silent fallback
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
