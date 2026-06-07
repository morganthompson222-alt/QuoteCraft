import { type NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";

const publicPaths = ["/login", "/signup", "/api/auth/login", "/api/auth/signup", "/api/health"];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isPublic = publicPaths.some((p) => pathname.startsWith(p));
  const isApi = pathname.startsWith("/api");

  if (process.env.PLAYWRIGHT_TEST && !isApi) {
    return NextResponse.next();
  }

  let supabaseResponse = NextResponse.next({ request });
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (url && anonKey) {
    const authHeader = request.headers.get("Authorization") ?? "";
    const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;

    if (token) {
      try {
        const supabase = createServerClient(url, anonKey, {
          cookies: {
            getAll: () => request.cookies.getAll(),
            setAll(cookiesToSet) {
              cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
              supabaseResponse = NextResponse.next({ request });
              cookiesToSet.forEach(({ name, value, options }) =>
                supabaseResponse.cookies.set(name, value, options),
              );
            },
          },
        });

        const { data, error } = await supabase.auth.getUser(token);
        if (!error && data.user) {
          await supabase.auth.setSession({
            access_token: token,
            refresh_token: token,
          });
        }
      } catch {
        // ignore
      }
    }
  }

  if (isPublic) {
    return NextResponse.next({ request });
  }

  if (isApi) {
    return supabaseResponse;
  }

  if (url && anonKey) {
    try {
      const supabase = createServerClient(url, anonKey, {
        cookies: {
          getAll: () => request.cookies.getAll(),
          setAll: () => {},
        },
      });
      const { data } = await supabase.auth.getUser();
      if (!data.user) {
        return NextResponse.redirect(new URL("/login", request.url));
      }
    } catch {
      return NextResponse.redirect(new URL("/login", request.url));
    }
  }

  return NextResponse.next({ request });
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
