import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { ApiError, errorResponse } from "@/lib/api-error";
import { createClient } from "@supabase/supabase-js";

export async function POST(request: NextRequest) {
  const supabaseUrl = (process.env.NEXT_PUBLIC_SUPABASE_URL ?? "").trim().replace(/^["']|["']$/g, "").replace(/\n|\r/g, "");
  const serviceKey = (process.env.SUPABASE_SERVICE_ROLE_KEY ?? "").trim().replace(/^["']|["']$/g, "").replace(/\n|\r/g, "");

  try {
    const supabase = await createServerSupabaseClient(request);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new ApiError(401, "Unauthorized");

    const body = await request.json();
    const confirmation = (body?.confirm ?? "").toString().toLowerCase();

    // Require explicit confirmation
    if (confirmation !== "delete my account") {
      throw new ApiError(400, "Type 'delete my account' to confirm", "CONFIRMATION_REQUIRED");
    }

    // Delete auth user via service role (cascades to all DB data)
    if (supabaseUrl && serviceKey) {
      const adminClient = createClient(supabaseUrl, serviceKey, {
        auth: { autoRefreshToken: false, persistSession: false },
      });
      const { error: deleteErr } = await adminClient.auth.admin.deleteUser(user.id);
      if (deleteErr) {
        console.error("Failed to delete auth user:", deleteErr.message);
        throw new ApiError(500, "Failed to delete account. Please try again.");
      }
    } else {
      throw new ApiError(500, "Service configuration error. Please contact support.");
    }

    return NextResponse.json({
      deleted: true,
      message: "Your account and all associated data have been permanently deleted.",
    });
  } catch (error) {
    return errorResponse(error);
  }
}
