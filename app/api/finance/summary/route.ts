import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { ApiError, errorResponse } from "@/lib/api-error";

export async function GET(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient(request);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new ApiError(401, "Unauthorized");

    const userId = user.id;
    const { searchParams } = request.nextUrl;
    const period = searchParams.get("period") ?? "1m";
    const taxRate = parseFloat(searchParams.get("taxRate") ?? "20");

    const now = new Date();
    let fromDate: string;
    const months = parseInt(period) || 1;

    if (period === "all") {
      fromDate = "2000-01-01";
    } else {
      const d = new Date(now);
      d.setMonth(d.getMonth() - months);
      fromDate = d.toISOString().slice(0, 10);
    }

    const [paidResult, quoteResult, expenseResult, allPaid, allExpenses] = await Promise.all([
      supabase.from("quotes").select("total, paid_at").eq("user_id", userId).eq("paid", true).gte("paid_at", fromDate),
      supabase.from("quotes").select("total, status").eq("user_id", userId).in("status", ["sent", "accepted"]),
      supabase.from("expenses").select("amount, category, expense_date").eq("user_id", userId).gte("expense_date", fromDate),
      supabase.from("quotes").select("total, paid_at").eq("user_id", userId).eq("paid", true).order("paid_at"),
      supabase.from("expenses").select("amount, category, expense_date").eq("user_id", userId).order("expense_date"),
    ]);

    const revenue = (paidResult.data ?? []).reduce((s: number, q: any) => s + (q.total ?? 0), 0);
    const expenses = (expenseResult.data ?? []).reduce((s: number, e: any) => s + (e.amount ?? 0), 0);
    const profit = revenue - expenses;
    const estimatedTax = Math.max(0, profit * (taxRate / 100));

    const outstandingValue = (quoteResult.data ?? []).reduce((s: number, q: any) => s + (q.total ?? 0), 0);
    const paidCount = (paidResult.data ?? []).length;
    const avgJobValue = paidCount > 0 ? revenue / paidCount : 0;
    const profitMargin = revenue > 0 ? (profit / revenue) * 100 : 0;

    // Growth compared to previous period
    const prevFrom = getPrevPeriod(fromDate, months);
    const { data: prevPaid } = await supabase.from("quotes").select("total").eq("user_id", userId).eq("paid", true).gte("paid_at", prevFrom).lt("paid_at", fromDate);
    const prevRevenue = (prevPaid ?? []).reduce((s: number, q: any) => s + (q.total ?? 0), 0);
    const revenueGrowth = prevRevenue > 0 ? ((revenue - prevRevenue) / prevRevenue) * 100 : 0;

    // Build monthly data for charts
    const revenueByMonth: Record<string, number> = {};
    for (const q of allPaid.data ?? []) {
      const m = (q.paid_at as string).slice(0, 7);
      revenueByMonth[m] = (revenueByMonth[m] ?? 0) + (q.total ?? 0);
    }

    const expensesByMonth: Record<string, number> = {};
    const expenseByCategory: Record<string, number> = {};
    for (const e of allExpenses.data ?? []) {
      const m = (e.expense_date as string).slice(0, 7);
      expensesByMonth[m] = (expensesByMonth[m] ?? 0) + (e.amount ?? 0);
      expenseByCategory[e.category] = (expenseByCategory[e.category] ?? 0) + (e.amount ?? 0);
    }

    const chartMonths = [...new Set([...Object.keys(revenueByMonth), ...Object.keys(expensesByMonth)])].sort().slice(-12);
    const chartData = chartMonths.map(m => ({
      month: m,
      revenue: revenueByMonth[m] ?? 0,
      expenses: expensesByMonth[m] ?? 0,
      profit: (revenueByMonth[m] ?? 0) - (expensesByMonth[m] ?? 0),
    }));

    // Forecasting (simple: average last 3 months × projection)
    const recentMonths = chartData.slice(-3).filter(d => d.revenue > 0 || d.expenses > 0);
    const avgRevenue = recentMonths.length > 0 ? recentMonths.reduce((s, d) => s + d.revenue, 0) / recentMonths.length : 0;
    const avgExpenses = recentMonths.length > 0 ? recentMonths.reduce((s, d) => s + d.expenses, 0) / recentMonths.length : 0;
    const nextMonthRevenue = avgRevenue;
    const nextMonthProfit = avgRevenue - avgExpenses;
    const nextQuarterRevenue = avgRevenue * 3;
    const nextQuarterProfit = (avgRevenue - avgExpenses) * 3;

    // Health score
    const revenueScore = Math.min(30, Math.min(revenue, 10000) / 10000 * 30);
    const profitScore = Math.min(25, Math.max(0, profitMargin) * 0.5);
    const growthScore = revenueGrowth > 0 ? Math.min(20, revenueGrowth * 0.4) : Math.max(0, 10 + revenueGrowth * 0.2);
    const expenseScore = revenue > 0 ? Math.min(25, (1 - expenses / Math.max(1, revenue)) * 25) : 10;
    const healthScore = Math.round(revenueScore + profitScore + growthScore + expenseScore);

    return NextResponse.json({
      metrics: {
        revenue, profit, expenses, estimatedTax, outstandingValue,
        avgJobValue, revenueGrowth, profitMargin, paidCount, healthScore,
      },
      chartData,
      expenseCategories: expenseByCategory,
      forecast: { nextMonthRevenue, nextMonthProfit, nextQuarterRevenue, nextQuarterProfit },
      disclaimer: "Estimates only. Always consult a qualified accountant or tax professional.",
    });
  } catch (error) {
    return errorResponse(error);
  }
}

function getPrevPeriod(fromDate: string, months: number): string {
  const d = new Date(fromDate);
  d.setMonth(d.getMonth() - months);
  return d.toISOString().slice(0, 10);
}
