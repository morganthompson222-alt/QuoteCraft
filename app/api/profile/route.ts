import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { sanitizeOptionalString } from "@/lib/validation";
import { ApiError, errorResponse } from "@/lib/api-error";
import { REGIONS, getRegion } from "@/lib/localization";
import { normalizeTier, PLANS } from "@/lib/stripe";

export async function GET(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient(request);
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) throw new ApiError(401, "Unauthorized", "UNAUTHORIZED");

    const { data: profile, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();

    if (error && error.code !== "PGRST116") {
      throw new ApiError(400, error.message);
    }

    return NextResponse.json({
      id: user.id,
      email: user.email,
      name: user.user_metadata?.name ?? null,
      avatarUrl: user.user_metadata?.avatar_url ?? null,
      companyName: profile?.company_name ?? null,
      logoUrl: profile?.logo_url ?? null,
      phone: profile?.phone ?? null,
      address: profile?.address ?? null,
      city: profile?.city ?? null,
      state: profile?.state ?? null,
      zip: profile?.zip ?? null,
      defaultTaxRate: profile?.default_tax_rate ?? 0,
      quotePrefix: profile?.quote_prefix ?? "Q-",
      planTier: normalizeTier((profile?.plan_tier as string) ?? "solo"),
      regionCode: profile?.region_code ?? "UK",
      currencyCode: profile?.currency_code ?? "GBP",
      locale: profile?.locale ?? "en-GB",
      customAiInstructions: profile?.custom_ai_instructions ?? null,
      costRates: profile?.cost_rates ?? null,
    });
  } catch (error) {
    return errorResponse(error);
  }
}

export async function PUT(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient(request);
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) throw new ApiError(401, "Unauthorized", "UNAUTHORIZED");

    const body = await request.json();

    const profileUpdate: Record<string, unknown> = {};
    let nameUpdate: string | null | undefined;

    if (body.name !== undefined) nameUpdate = sanitizeOptionalString(body.name);
    if (body.companyName !== undefined) profileUpdate.company_name = sanitizeOptionalString(body.companyName);
    if (body.phone !== undefined) profileUpdate.phone = sanitizeOptionalString(body.phone);
    if (body.address !== undefined) profileUpdate.address = sanitizeOptionalString(body.address);
    if (body.city !== undefined) profileUpdate.city = sanitizeOptionalString(body.city);
    if (body.state !== undefined) profileUpdate.state = sanitizeOptionalString(body.state);
    if (body.zip !== undefined) profileUpdate.zip = sanitizeOptionalString(body.zip);
    if (body.defaultTaxRate !== undefined) {
      const rate = Number(body.defaultTaxRate);
      if (isNaN(rate) || rate < 0 || rate > 100) {
        throw new ApiError(400, "Tax rate must be between 0 and 100", "VALIDATION_ERROR");
      }
      profileUpdate.default_tax_rate = rate;
    }
    if (body.quotePrefix !== undefined) profileUpdate.quote_prefix = sanitizeOptionalString(body.quotePrefix);
    if (body.logoUrl !== undefined) profileUpdate.logo_url = sanitizeOptionalString(body.logoUrl);
    if (body.regionCode !== undefined) {
      const regionStr = sanitizeOptionalString(body.regionCode);
      if (regionStr) {
        const region = REGIONS[regionStr.toUpperCase()];
        if (!region) throw new ApiError(400, "Invalid region", "VALIDATION_ERROR");
        profileUpdate.region_code = region.code;
        profileUpdate.currency_code = region.currencyCode;
        profileUpdate.locale = region.locale;
      }
    }

    if (body.planTier !== undefined) {
      const tier = sanitizeOptionalString(body.planTier);
      if (tier && !(tier in PLANS)) {
        throw new ApiError(400, "Invalid plan tier", "VALIDATION_ERROR");
      }
      profileUpdate.plan_tier = tier;
    }
    if (body.customAiInstructions !== undefined) {
      profileUpdate.custom_ai_instructions = sanitizeOptionalString(body.customAiInstructions);
    }

    if (body.costRates !== undefined) {
      profileUpdate.cost_rates = sanitizeOptionalString(body.costRates);
    }

    const hasUpdates = Object.keys(profileUpdate).length > 0 || nameUpdate !== undefined;
    if (!hasUpdates) {
      throw new ApiError(400, "No fields to update", "VALIDATION_ERROR");
    }

    if (nameUpdate !== undefined) {
      const { error: nameErr } = await supabase
        .from("users")
        .update({ name: nameUpdate })
        .eq("id", user.id);
      if (nameErr) throw new ApiError(400, nameErr.message);
    }

    if (Object.keys(profileUpdate).length > 0) {
      profileUpdate.updated_at = new Date().toISOString();
      const { error: profileErr } = await supabase
        .from("profiles")
        .update(profileUpdate)
        .eq("id", user.id);
      if (profileErr) throw new ApiError(400, profileErr.message);
    }

    const { data: updated } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();

    return NextResponse.json({
      id: user.id,
      email: user.email,
      name: user.user_metadata?.name ?? null,
      avatarUrl: user.user_metadata?.avatar_url ?? null,
      companyName: updated?.company_name ?? null,
      logoUrl: updated?.logo_url ?? null,
      phone: updated?.phone ?? null,
      address: updated?.address ?? null,
      city: updated?.city ?? null,
      state: updated?.state ?? null,
      zip: updated?.zip ?? null,
      defaultTaxRate: updated?.default_tax_rate ?? 0,
      quotePrefix: updated?.quote_prefix ?? "Q-",
      planTier: normalizeTier((updated?.plan_tier as string) ?? "solo"),
      regionCode: updated?.region_code ?? "UK",
      currencyCode: updated?.currency_code ?? "GBP",
      locale: updated?.locale ?? "en-GB",
      customAiInstructions: updated?.custom_ai_instructions ?? null,
      costRates: updated?.cost_rates ?? null,
    });
  } catch (error) {
    return errorResponse(error);
  }
}
