import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { ApiError, errorResponse } from "@/lib/api-error";

export async function GET(_request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient(_request);
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) throw new ApiError(401, "Unauthorized", "UNAUTHORIZED");

    const userId = user.id;

    // Parallel: total customer count + total open quotes count
    const [customerCountResult, openQuotesResult] = await Promise.all([
      supabase
        .from("customers")
        .select("id", { count: "exact", head: true })
        .eq("user_id", userId),
      supabase
        .from("quotes")
        .select("id", { count: "exact", head: true })
        .eq("user_id", userId)
        .in("status", ["draft", "sent"]),
    ]);

    if (customerCountResult.error) throw new ApiError(400, customerCountResult.error.message);
    if (openQuotesResult.error) throw new ApiError(400, openQuotesResult.error.message);

    // Parallel: recent 10 quotes + recent 5 customers
    const [recentQuotesResult, recentCustomersResult] = await Promise.all([
      supabase
        .from("quotes")
        .select("id, quote_number, customer_id, status, total, created_at, customers!inner(name)")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(10),
      supabase
        .from("customers")
        .select("id, name")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(5),
    ]);

    if (recentQuotesResult.error) throw new ApiError(400, recentQuotesResult.error.message);
    if (recentCustomersResult.error) throw new ApiError(400, recentCustomersResult.error.message);

    // Build recent quotes
    const recentQuotes = (recentQuotesResult.data ?? []).map((q: Record<string, unknown>) => {
      const customers = q.customers;
      const customerName = Array.isArray(customers)
        ? (customers[0] as Record<string, unknown>)?.name
        : (customers as Record<string, unknown>)?.name;
      return {
        id: q.id as string,
        quoteNumber: q.quote_number as string,
        customerName: (customerName ?? "") as string,
        status: q.status as string,
        total: Number(q.total),
        createdAt: q.created_at as string,
      };
    });

    // Get quote counts for recent customers in a single query
    const recentCustomerIds = (recentCustomersResult.data ?? []).map(
      (c: Record<string, unknown>) => c.id as string,
    );

    let recentCustomers: Array<{ id: string; name: string; totalQuotes: number }> = [];

    if (recentCustomerIds.length > 0) {
      const { data: quoteCounts } = await supabase
        .from("quotes")
        .select("customer_id")
        .eq("user_id", userId)
        .in("customer_id", recentCustomerIds);

      const countMap = new Map<string, number>();
      for (const q of quoteCounts ?? []) {
        const cid = (q as Record<string, unknown>).customer_id as string;
        countMap.set(cid, (countMap.get(cid) ?? 0) + 1);
      }

      recentCustomers = (recentCustomersResult.data ?? []).map(
        (c: Record<string, unknown>) => ({
          id: c.id as string,
          name: c.name as string,
          totalQuotes: countMap.get(c.id as string) ?? 0,
        }),
      );
    }

    return NextResponse.json({
      customerCount: customerCountResult.count ?? 0,
      openQuotesCount: openQuotesResult.count ?? 0,
      recentQuotes,
      recentCustomers,
    });
  } catch (error) {
    return errorResponse(error);
  }
}
