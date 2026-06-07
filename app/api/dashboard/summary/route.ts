import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { ApiError, errorResponse } from "@/lib/api-error";

function toKey(d: Date) { return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`; }

export async function GET(_request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient(_request);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new ApiError(401, "Unauthorized", "UNAUTHORIZED");

    const userId = user.id;
    const today = new Date();
    const todayKey = toKey(today);
    const endKey = toKey(new Date(today.getTime() + 3 * 86400000));

    const [customerCountResult, openQuotesResult, recentQuotesResult, recentCustomersResult, upcomingJobsResult] = await Promise.all([
      supabase.from("customers").select("id", { count: "exact", head: true }).eq("user_id", userId),
      supabase.from("quotes").select("id", { count: "exact", head: true }).eq("user_id", userId).in("status", ["draft", "sent"]),
      supabase.from("quotes").select("id, quote_number, customer_id, status, total, created_at, customers!inner(name)").eq("user_id", userId).order("created_at", { ascending: false }).limit(10),
      supabase.from("customers").select("id, name").eq("user_id", userId).order("created_at", { ascending: false }).limit(5),
      supabase.from("jobs").select("*").eq("user_id", userId).gte("job_date", todayKey).lte("job_date", endKey).order("job_date", { ascending: true }),
    ]);

    if (customerCountResult.error) throw new ApiError(400, customerCountResult.error.message);
    if (openQuotesResult.error) throw new ApiError(400, openQuotesResult.error.message);
    if (recentQuotesResult.error) throw new ApiError(400, recentQuotesResult.error.message);
    if (recentCustomersResult.error) throw new ApiError(400, recentCustomersResult.error.message);
    if (upcomingJobsResult.error) throw new ApiError(400, upcomingJobsResult.error.message);

    const recentQuotes = (recentQuotesResult.data ?? []).map((q: Record<string, unknown>) => {
      const customers = q.customers;
      const customerName = Array.isArray(customers) ? (customers[0] as Record<string, unknown>)?.name : (customers as Record<string, unknown>)?.name;
      return { id: q.id, quoteNumber: q.quote_number, customerName: (customerName ?? "") as string, status: q.status, total: Number(q.total), createdAt: q.created_at };
    });

    const recentCustomerIds = (recentCustomersResult.data ?? []).map((c: Record<string, unknown>) => c.id as string);
    let recentCustomers: Array<{ id: string; name: string; totalQuotes: number }> = [];
    if (recentCustomerIds.length > 0) {
      const { data: quoteCounts } = await supabase.from("quotes").select("customer_id").eq("user_id", userId).in("customer_id", recentCustomerIds);
      const countMap = new Map<string, number>();
      for (const q of quoteCounts ?? []) { const cid = (q as Record<string, unknown>).customer_id as string; countMap.set(cid, (countMap.get(cid) ?? 0) + 1); }
      recentCustomers = (recentCustomersResult.data ?? []).map((c: Record<string, unknown>) => ({ id: c.id as string, name: c.name as string, totalQuotes: countMap.get(c.id as string) ?? 0 }));
    }

    // Build upcoming 3-day calendar data
    const jobMap: Record<string, Array<{ id: string; job_title: string; start_time: string; customer_name: string; status: string }>> = {};
    for (const j of upcomingJobsResult.data ?? []) {
      const d = j.job_date as string;
      (jobMap[d] ??= []).push({
        id: j.id as string, job_title: j.job_title as string, start_time: j.start_time as string,
        customer_name: (j.customer_name as string) ?? "", status: j.status as string,
      });
    }

    const calendarDays = [0, 1, 2].map(offset => {
      const d = new Date(today.getTime() + offset * 86400000);
      const key = toKey(d);
      return {
        date: key,
        dayName: ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"][d.getDay()],
        dayNum: d.getDate(),
        isToday: offset === 0,
        jobs: jobMap[key] ?? [],
      };
    });

    const upcomingJobCount = (upcomingJobsResult.data ?? []).length;

    return NextResponse.json({
      customerCount: customerCountResult.count ?? 0,
      openQuotesCount: openQuotesResult.count ?? 0,
      recentQuotes, recentCustomers,
      upcomingJobCount,
      calendarDays,
    });
  } catch (error) {
    return errorResponse(error);
  }
}
