import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { sanitizeString, sanitizeOptionalString, sanitizeNumber } from "@/lib/validation";
import { ApiError, errorResponse } from "@/lib/api-error";

// GET — list all services for the user
export async function GET(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient(request);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new ApiError(401, "Unauthorized");

    const { data: profile } = await supabase
      .from("profiles")
      .select("cost_rates")
      .eq("id", user.id)
      .single();

    const raw = (profile as { cost_rates?: string } | null)?.cost_rates ?? "";
    const services = raw.split("\n").filter(l => l.trim()).map(line => {
      const parts = line.split("|");
      return {
        name: parts[0] ?? line.trim(),
        unitType: parts[1] ?? "item",
        chargePerUnit: parseFloat(parts[2]) || 0,
        costPerUnit: parseFloat(parts[3]) || 0,
      };
    });

    return NextResponse.json({ services });
  } catch (error) {
    return errorResponse(error);
  }
}

// PUT — save services (replaces all)
export async function PUT(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient(request);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new ApiError(401, "Unauthorized");

    const body = await request.json();
    const services = body.services as Array<{ name: string; unitType: string; chargePerUnit: number; costPerUnit: number }>;

    // Store as pipe-delimited lines
    const raw = services.map(s =>
      `${sanitizeString(s.name)}|${sanitizeString(s.unitType)}|${sanitizeNumber(s.chargePerUnit, 0)}|${sanitizeNumber(s.costPerUnit, 0)}`
    ).join("\n");

    await supabase
      .from("profiles")
      .update({ cost_rates: raw, updated_at: new Date().toISOString() })
      .eq("id", user.id);

    return NextResponse.json({ ok: true, count: services.length });
  } catch (error) {
    return errorResponse(error);
  }
}
