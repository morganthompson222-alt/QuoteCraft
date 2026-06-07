import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { sanitizeEmail, sanitizeString } from "@/lib/validation";
import { ApiError, errorResponse } from "@/lib/api-error";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const email = sanitizeEmail(body.email);
    const password = sanitizeString(body.password);

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
