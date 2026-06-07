import { NextRequest } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export async function getAuthedUser(request?: NextRequest): Promise<{ id: string; email?: string } | null> {
  let token: string | null = null;

  if (request) {
    const authHeader = request.headers.get("Authorization") ?? "";
    if (authHeader.startsWith("Bearer ")) {
      token = authHeader.slice(7);
    }
  }

  const supabase = await createServerSupabaseClient();

  if (token) {
    const { data } = await supabase.auth.getUser(token);
    if (data.user) return { id: data.user.id, email: data.user.email };
  }

  const { data } = await supabase.auth.getUser();
  if (data.user) return { id: data.user.id, email: data.user.email };

  return null;
}
