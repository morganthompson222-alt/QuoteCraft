import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

function isValidUrl(s: string): boolean {
  try {
    const url = new URL(s);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

export async function updateSession(request: NextRequest, token?: string | null) {
  let supabaseResponse = NextResponse.next({ request });

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey || !isValidUrl(supabaseUrl)) {
    return { supabase: null, supabaseResponse, user: null };
  }

  let user = null;
  try {
    const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options),
          );
        },
      },
    });

    if (token) {
      const { error: sessionError } = await supabase.auth.setSession({
        access_token: token,
        refresh_token: "",
      });
      if (!sessionError) {
        const { data } = await supabase.auth.getUser();
        user = data.user;
      }
    }

    if (!user) {
      const { data } = await supabase.auth.getUser();
      user = data.user;
    }
  } catch {
    // Supabase unavailable
  }

  return { supabase: null, supabaseResponse, user };
}
