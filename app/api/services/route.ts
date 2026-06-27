import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { sanitizeString, sanitizeNumber } from "@/lib/validation";
import { ApiError, errorResponse } from "@/lib/api-error";

export async function GET(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient(request);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new ApiError(401, "Unauthorized");

    const { data: profile } = await supabase
      .from("profiles")
      .select("cost_rates, default_tax_rate")
      .eq("id", user.id)
      .single();

    const p = profile as Record<string, unknown>;
    const raw = (p?.cost_rates as string) ?? "";
    const services = raw.split("\n").filter(l => l.trim()).map(line => {
      const parts = line.split("|");
      return {
        name: parts[0]?.trim() ?? "",
        category: parts[1]?.trim() ?? "",
        unit: parts[2]?.trim() ?? "job",
        charge: parseFloat(parts[3]) || 0,
        cost: parseFloat(parts[4]) || 0,
      };
    }).filter(s => s.name && s.charge > 0);

    return NextResponse.json({
      services,
      taxRate: Number(p?.default_tax_rate ?? 0),
      overheads: [
        { name: "Fuel", amount: 8, per: "job" },
        { name: "Equipment Wear", amount: 3, per: "job" },
      ],
    });
  } catch (error) {
    return errorResponse(error);
  }
}

export async function PUT(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient(request);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new ApiError(401, "Unauthorized");

    const body = await request.json();
    const services = (body.services ?? []) as Array<{ name: string; category: string; unit: string; charge: number; cost: number }>;

    const raw = services.map(s =>
      `${sanitizeString(s.name)}|${sanitizeString(s.category)}|${sanitizeString(s.unit)}|${sanitizeNumber(s.charge, 0)}|${sanitizeNumber(s.cost, 0)}`
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
