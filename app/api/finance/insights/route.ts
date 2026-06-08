import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { ApiError, errorResponse } from "@/lib/api-error";

function monthKey(d: Date) { return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}`; }

export async function GET(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient(request);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new ApiError(401, "Unauthorized");

    const userId = user.id;
    const month = monthKey(new Date());
    const thisMonthStart = `${month}-01`;

    const [paidResult, allPaid, expenseResult, allExpenses] = await Promise.all([
      supabase.from("quotes").select("total, paid_at").eq("user_id", userId).eq("paid", true).gte("paid_at", thisMonthStart),
      supabase.from("quotes").select("total, paid_at").eq("user_id", userId).eq("paid", true).order("paid_at"),
      supabase.from("expenses").select("amount, category, expense_date").eq("user_id", userId).gte("expense_date", thisMonthStart),
      supabase.from("expenses").select("amount, category, expense_date").eq("user_id", userId).order("expense_date"),
    ]);

    // Build monthly data
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

    const months = [...new Set([...Object.keys(revenueByMonth), ...Object.keys(expensesByMonth)])].sort();

    const chartData = months.map(m => ({
      month: m,
      revenue: revenueByMonth[m] ?? 0,
      expenses: expensesByMonth[m] ?? 0,
      profit: (revenueByMonth[m] ?? 0) - (expensesByMonth[m] ?? 0),
    }));

    // Current month
    const monthlyRevenue = (paidResult.data ?? []).reduce((s: number, q: any) => s + (q.total ?? 0), 0);
    const monthlyExpenses = (expenseResult.data ?? []).reduce((s: number, e: any) => s + (e.amount ?? 0), 0);
    const monthlyProfit = monthlyRevenue - monthlyExpenses;

    // Insights
    const insights: string[] = [];
    const recommendations: string[] = [];

    if (chartData.length >= 2) {
      const curr = chartData[chartData.length - 1];
      const prev = chartData[chartData.length - 2];
      if (prev.revenue > 0) {
        const revChange = ((curr.revenue - prev.revenue) / prev.revenue) * 100;
        insights.push(`Revenue ${revChange >= 0 ? "increased" : "fell"} by ${Math.abs(revChange).toFixed(1)}% compared to last month.`);
      }
      if (curr.profit < prev.profit && curr.revenue > prev.revenue) {
        recommendations.push("Revenue grew but profit fell. Review your expenses — material or labour costs may have increased.");
      }
    }

    const profitMargin = monthlyRevenue > 0 ? (monthlyProfit / monthlyRevenue) * 100 : 0;
    if (profitMargin < 20 && monthlyRevenue > 0) {
      recommendations.push(`Your profit margin is ${profitMargin.toFixed(1)}%. Consider reviewing material costs and operational efficiency.`);
    }

    // Top expense category
    const topExpense = Object.entries(expenseByCategory).sort((a, b) => b[1] - a[1])[0];
    if (topExpense) {
      insights.push(`${topExpense[0]} is your largest expense category at £${topExpense[1].toFixed(0)}.`);
    }

    if (monthlyRevenue > 0 && (paidResult.data ?? []).length > 0) {
      const avgJob = monthlyRevenue / (paidResult.data ?? []).length;
      insights.push(`Average job value is £${avgJob.toFixed(0)} this month.`);
    }

    return NextResponse.json({
      chartData,
      monthlyRevenue, monthlyProfit, monthlyExpenses, profitMargin,
      insights, recommendations,
      expenseByCategory,
      disclaimer: "Estimates only. Always consult a qualified accountant or tax professional.",
    });
  } catch (error) {
    return errorResponse(error);
  }
}
