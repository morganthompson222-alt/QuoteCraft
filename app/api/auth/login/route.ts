import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { sanitizeEmail, sanitizeString } from "@/lib/validation";
import { ApiError, errorResponse } from "@/lib/api-error";

function isValidUrl(s: string): boolean {
  try {
    const url = new URL(s);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

function requireValidSupabaseUrl() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key || !isValidUrl(url)) {
    throw new ApiError(401, "Invalid email or password");
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const email = sanitizeEmail(body.email);
    const password = sanitizeString(body.password);

    requireValidSupabaseUrl();

    const supabase = await createServerSupabaseClient(request);

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      throw new ApiError(401, "Invalid email or password");
    }

    return NextResponse.json({
      userId: data.user.id,
      email: data.user.email,
      token: data.session.access_token,
    });
  } catch (error) {
    return errorResponse(error);
  }
}
