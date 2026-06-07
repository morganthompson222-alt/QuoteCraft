import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { sanitizeEmail, sanitizeString } from "@/lib/validation";
import { ApiError, errorResponse } from "@/lib/api-error";

function setAuthCookie(response: NextResponse, token: string, refreshToken: string) {
  const projectRef = (process.env.NEXT_PUBLIC_SUPABASE_URL ?? "").match(/https:\/\/([^.]+)/)?.[1] ?? "";
  const cookieName = `sb-${projectRef}-auth-token.0`;
  const cookieValue = Buffer.from(JSON.stringify([token, refreshToken, token])).toString("base64");
  response.cookies.set(cookieName, cookieValue, {
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
    sameSite: "lax",
    secure: true,
    httpOnly: false,
  });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const email = sanitizeEmail(body.email);
    const password = sanitizeString(body.password);

    const supabaseUrl = (process.env.NEXT_PUBLIC_SUPABASE_URL ?? "").trim().replace(/^["']|["']$/g, "").replace(/\n|\r/g, "");
    const anonKey = (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "").trim().replace(/^["']|["']$/g, "").replace(/\n|\r/g, "");

    if (!supabaseUrl || !anonKey) {
      throw new ApiError(500, "Missing Supabase configuration");
    }

    const supabase = createClient(supabaseUrl, anonKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    const { data, error } = await supabase.auth.signInWithPassword({ email, password });

    if (error || !data.session?.access_token) {
      throw new ApiError(401, "Invalid email or password");
    }

    const response = NextResponse.json({
      userId: data.user.id,
      email: data.user.email,
      token: data.session.access_token,
    });

    setAuthCookie(response, data.session.access_token, data.session.refresh_token);
    return response;
  } catch (error) {
    if (error instanceof ApiError) return errorResponse(error);
    console.error("Unhandled login error:", error);
    const msg = error instanceof Error ? error.message : String(error);
    return NextResponse.json(
      { error: { message: `Internal error: ${msg}`, statusCode: 500 } },
      { status: 500 },
    );
  }
}
