import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { sanitizeEmail, sanitizeString } from "@/lib/validation";
import { ApiError, errorResponse } from "@/lib/api-error";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const email = sanitizeEmail(body.email);
    const password = sanitizeString(body.password);

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !anonKey) {
      throw new ApiError(500, "Missing Supabase configuration");
    }

    const supabase = createClient(supabaseUrl, anonKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error || !data.session?.access_token) {
      throw new ApiError(401, "Invalid email or password");
    }

    return NextResponse.json({
      userId: data.user.id,
      email: data.user.email,
      token: data.session.access_token,
    });
  } catch (error) {
    if (error instanceof ApiError) {
      return errorResponse(error);
    }
    console.error("Unhandled login error:", error);
    const msg = error instanceof Error ? error.message : String(error);
    return NextResponse.json(
      { error: { message: `Internal error: ${msg}`, statusCode: 500 } },
      { status: 500 },
    );
  }
}
