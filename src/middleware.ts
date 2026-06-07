import { type NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";

const publicPaths = ["/login", "/signup", "/q", "/api/auth/login", "/api/auth/signup", "/api/health"];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isPublic = publicPaths.some((p) => pathname.startsWith(p));
  const isApi = pathname.startsWith("/api");

  if (process.env.PLAYWRIGHT_TEST && !isApi) {
    return NextResponse.next();
  }

  let supabaseResponse = NextResponse.next({ request });
  const url = (process.env.NEXT_PUBLIC_SUPABASE_URL ?? "").trim().replace(/^["']|["']$/g, "");
  const anonKey = (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "").trim().replace(/^["']|["']$/g, "");

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
        // Debug: log cookies available and the auth check result
        const cookies = request.cookies.getAll().map(c => `${c.name}=${c.value.substring(0, 10)}...`);
        console.warn("Middleware auth failed for", pathname, "cookies:", cookies);
        return NextResponse.redirect(new URL("/login", request.url));
      }
    } catch (e) {
      console.error("Middleware auth error:", e);
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
