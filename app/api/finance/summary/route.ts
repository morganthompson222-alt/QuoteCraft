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
    const { searchParams } = request.nextUrl;
    const month = searchParams.get("month") ?? monthKey(new Date());

    const now = new Date();
    const thisMonthStart = `${month}-01`;
    const [year, mon] = month.split("-").map(Number);
    const nextMonth = new Date(year, mon, 1);
    const thisMonthEnd = nextMonth.toISOString().slice(0, 10);

    // Revenue: paid quotes this month
    const [paidResult, quoteResult, expenseResult, customerResult] = await Promise.all([
      supabase.from("quotes").select("total, paid_at").eq("user_id", userId).eq("paid", true).gte("paid_at", thisMonthStart).lt("paid_at", thisMonthEnd),
      supabase.from("quotes").select("total, status").eq("user_id", userId).in("status", ["sent", "accepted"]),
      supabase.from("expenses").select("amount, category, expense_date").eq("user_id", userId).gte("expense_date", thisMonthStart).lt("expense_date", thisMonthEnd),
      supabase.from("customers").select("id", { count: "exact", head: true }).eq("user_id", userId),
    ]);

    // Revenue this month
    const monthlyRevenue = (paidResult.data ?? []).reduce((s: number, q: any) => s + (q.total ?? 0), 0);
    const monthlyExpenses = (expenseResult.data ?? []).reduce((s: number, e: any) => s + (e.amount ?? 0), 0);
    const monthlyProfit = monthlyRevenue - monthlyExpenses;

    // Outstanding quotes
    const outstandingValue = (quoteResult.data ?? []).reduce((s: number, q: any) => s + (q.total ?? 0), 0);

    // Average job value
    const paidCount = (paidResult.data ?? []).length;
    const avgJobValue = paidCount > 0 ? monthlyRevenue / paidCount : 0;

    // All-time revenue for growth comparisons
    const { data: allPaid } = await supabase.from("quotes").select("total, paid_at").eq("user_id", userId).eq("paid", true);

    // Revenue growth vs last month
    const lastMonthNum = mon === 1 ? 12 : mon - 1;
    const lastMonthYear = mon === 1 ? year - 1 : year;
    const prevMonthStart = `${lastMonthYear}-${String(lastMonthNum).padStart(2, "0")}-01`;
    const { data: prevPaid } = await supabase.from("quotes").select("total").eq("user_id", userId).eq("paid", true).gte("paid_at", prevMonthStart).lt("paid_at", month === "01" ? `${year}-01-01` : thisMonthStart);
    const prevMonthRevenue = (prevPaid ?? []).reduce((s: number, q: any) => s + (q.total ?? 0), 0);

    const revenueGrowth = prevMonthRevenue > 0 ? ((monthlyRevenue - prevMonthRevenue) / prevMonthRevenue) * 100 : 0;

    // Customer retention (customers with quotes across multiple months)
    const totalCustomers = customerResult.count ?? 0;

    // Expense categories breakdown
    const categoryMap: Record<string, number> = {};
    for (const e of expenseResult.data ?? []) {
      categoryMap[e.category] = (categoryMap[e.category] ?? 0) + (e.amount ?? 0);
    }

    // Estimated tax (simplified: 20% of profit for UK sole trader, configurable)
    const estimatedTaxRate = 0.20;
    const estimatedTax = Math.max(0, monthlyProfit * estimatedTaxRate);

    // Business health score
    const profitMargin = monthlyRevenue > 0 ? (monthlyProfit / monthlyRevenue) * 100 : 0;
    const quoteConversionRate = totalCustomers > 0 ? paidCount / Math.max(1, totalCustomers) * 20 : 0;
    const revenueScore = Math.min(30, (monthlyRevenue / 10000) * 30);
    const profitScore = Math.min(25, profitMargin * 0.5);
    const conversionScore = Math.min(15, quoteConversionRate);
    const expenseScore = monthlyRevenue > 0 ? Math.min(30, (1 - monthlyExpenses / Math.max(1, monthlyRevenue)) * 30) : 10;
    const growthScore = revenueGrowth > 0 ? Math.min(15, revenueGrowth * 0.5) : 0;
    const healthScore = Math.round(revenueScore + profitScore + conversionScore + expenseScore + growthScore);

    return NextResponse.json({
      metrics: {
        monthlyRevenue, monthlyProfit, monthlyExpenses, estimatedTax,
        outstandingValue, avgJobValue, revenueGrowth, profitMargin,
        totalCustomers, paidCount, healthScore,
      },
      expenseCategories: categoryMap,
      disclaimer: "Estimates only. Always consult a qualified accountant or tax professional.",
    });
  } catch (error) {
    return errorResponse(error);
  }
}
