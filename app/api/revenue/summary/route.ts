import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { ApiError, errorResponse } from "@/lib/api-error";

function formatMonth(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

const MONTH_NAMES = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

export async function GET(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient(request);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new ApiError(401, "Unauthorized");

    const { searchParams } = new URL(request.url);
    const months = parseInt(searchParams.get("months") ?? "12");

    const { data: quotes, error } = await supabase
      .from("quotes")
      .select("total, paid_at")
      .eq("user_id", user.id)
      .eq("paid", true)
      .order("paid_at", { ascending: true });

    if (error) throw new ApiError(400, error.message);

    // Group by month
    const monthly: Record<string, number> = {};

    // Fill in the last N months with 0
    const now = new Date();
    for (let i = months - 1; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      monthly[formatMonth(d)] = 0;
    }

    for (const q of quotes ?? []) {
      if (q.paid_at) {
        const month = formatMonth(new Date(q.paid_at as string));
        if (monthly[month] !== undefined) {
          monthly[month] += Number(q.total ?? 0);
        } else if (months === 12) {
          monthly[month] = (monthly[month] ?? 0) + Number(q.total ?? 0);
        }
      }
    }

    const sorted = Object.entries(monthly)
      .sort(([a], [b]) => a.localeCompare(b));

    const monthlyData = sorted.map(([month, total]) => {
      const [y, m] = month.split("-").map(Number);
      return {
        month,
        label: `${MONTH_NAMES[m - 1]} ${y}`,
        total: Math.round(total * 100) / 100,
      };
    });

    const lifetimeTotal = Math.round(
      (quotes ?? []).reduce((sum, q) => sum + Number(q.total ?? 0), 0) * 100,
    ) / 100;

    const thisMonth = formatMonth(now);
    const lastMonth = formatMonth(new Date(now.getFullYear(), now.getMonth() - 1, 1));
    const thisMonthTotal = monthly[thisMonth] ?? 0;
    const lastMonthTotal = monthly[lastMonth] ?? 0;
    const pctChange = lastMonthTotal > 0
      ? Math.round(((thisMonthTotal - lastMonthTotal) / lastMonthTotal) * 100)
      : thisMonthTotal > 0 ? 100 : 0;

    return NextResponse.json({
      lifetimeTotal,
      thisMonthTotal,
      lastMonthTotal,
      pctChange,
      months: months,
      monthlyData,
    });
  } catch (error) {
    return errorResponse(error);
  }
}
