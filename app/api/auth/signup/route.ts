import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
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

    const supabaseUrl = (process.env.NEXT_PUBLIC_SUPABASE_URL ?? "").trim().replace(/^["']|["']$/g, "").replace(/\n|\r/g, "");
    const anonKey = (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "").trim().replace(/^["']|["']$/g, "").replace(/\n|\r/g, "");
    const serviceKey = (process.env.SUPABASE_SERVICE_ROLE_KEY ?? "").trim().replace(/^["']|["']$/g, "").replace(/\n|\r/g, "");

    if (!supabaseUrl || !anonKey) {
      const debug = supabaseUrl ? `got "${supabaseUrl.substring(0, 15)}" (${supabaseUrl.length} chars)` : "not set";
      throw new ApiError(500, `Missing Supabase config: url=${debug}`);
    }

    // Validate URL format
    try {
      new URL(supabaseUrl);
    } catch {
      throw new ApiError(500, `Invalid URL format: "${supabaseUrl.substring(0, 30)}"`);
    }

    let userId: string | undefined;

    // Path A: Admin API if service key is set
    if (serviceKey) {
      try {
        const admin = createClient(supabaseUrl, serviceKey, {
          auth: { autoRefreshToken: false, persistSession: false },
        });

        // Check existing user
        const listed = await admin.auth.admin.listUsers();
        const found = listed.data?.users?.find(
          (u) => (u.email ?? "").toLowerCase() === email.toLowerCase()
        );
        if (found) {
          throw new ApiError(409, "Email already registered");
        }

        const created = await admin.auth.admin.createUser({
          email,
          password,
          email_confirm: true,
          user_metadata: { name, region_code: region.code },
        });

        if (created.error) {
          const m = created.error.message ?? "";
          if (m.toLowerCase().includes("already")) {
            throw new ApiError(409, "Email already registered");
          }
          throw new ApiError(400, `Admin createUser failed: ${m}`);
        }

        if (!created.data?.user?.id) {
          throw new ApiError(500, "Admin createUser returned no user");
        }

        userId = created.data.user.id;

        // Upsert profile with required fields
        const profileRes = await admin.from("profiles").upsert({
          id: userId,
          plan_tier: "solo",
          region_code: region.code,
          currency_code: region.currencyCode,
          locale: region.locale,
        });

        if (profileRes.error) {
          // Profile upsert failed - log but continue (DB trigger may have already created it)
          console.warn("Profile upsert warning:", profileRes.error.message);
        }
      } catch (adminErr) {
        // If it's already an ApiError (e.g. 409), rethrow
        if (adminErr instanceof ApiError) throw adminErr;
        // Otherwise, fall through to standard signUp
        console.warn("Admin path failed, falling back to anon signUp:", adminErr);
      }
    }

    // Path B: Standard signUp via anon key (used if admin path didn't succeed)
    if (!userId) {
      const anon = createClient(supabaseUrl, anonKey, {
        auth: { autoRefreshToken: false, persistSession: false },
      });

      const signUp = await anon.auth.signUp({
        email,
        password,
        options: { data: { name, region_code: region.code } },
      });

      if (signUp.error) {
        const m = signUp.error.message ?? "";
        if (m.toLowerCase().includes("already") || m.toLowerCase().includes("registered")) {
          throw new ApiError(409, "Email already registered");
        }
        if (m.toLowerCase().includes("rate") || m.toLowerCase().includes("over_email")) {
          throw new ApiError(429, "Email rate limit hit. Please try again in a moment, or set up the SUPABASE_SERVICE_ROLE_KEY environment variable to bypass this.");
        }
        throw new ApiError(400, `Signup failed: ${m}`);
      }

      if (!signUp.data.user?.id) {
        throw new ApiError(500, "Signup returned no user");
      }

      userId = signUp.data.user.id;

      // Best-effort: upsert profile via admin client if available
      if (serviceKey) {
        try {
          const admin = createClient(supabaseUrl, serviceKey, {
            auth: { autoRefreshToken: false, persistSession: false },
          });
          await admin.from("profiles").upsert({
            id: userId,
            plan_tier: "solo",
            region_code: region.code,
            currency_code: region.currencyCode,
            locale: region.locale,
          });
        } catch (e) {
          console.warn("Profile upsert (fallback) failed:", e);
        }
      }
    }

    // Sign in to get session token
    const anon = createClient(supabaseUrl, anonKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });
    const session = await anon.auth.signInWithPassword({ email, password });

    if (session.error || !session.data.session?.access_token) {
      throw new ApiError(
        400,
        `Account created but sign-in failed: ${session.error?.message ?? "no session"}. Try logging in.`,
      );
    }

    const response = NextResponse.json({
      userId,
      email,
      token: session.data.session.access_token,
    });

    // Set auth cookie so middleware recognizes the session
    const projectRef = (supabaseUrl.match(/https:\/\/([^.]+)/)?.[1] ?? "");
    const cookieName = `sb-${projectRef}-auth-token.0`;
    const cookieValue = Buffer.from(JSON.stringify([
      session.data.session.access_token,
      session.data.session.refresh_token,
      session.data.session.access_token,
    ])).toString("base64");
    response.cookies.set(cookieName, cookieValue, {
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
      sameSite: "lax",
      secure: true,
      httpOnly: false,
    });
    return response;
  } catch (error) {
    // Surface real error for debugging
    if (error instanceof ApiError) {
      return errorResponse(error);
    }
    console.error("Unhandled signup error:", error);
    const msg = error instanceof Error ? error.message : String(error);
    return NextResponse.json(
      { error: { message: `Internal error: ${msg}`, statusCode: 500 } },
      { status: 500 },
    );
  }
}
