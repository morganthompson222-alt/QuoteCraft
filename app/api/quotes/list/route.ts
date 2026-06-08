import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { ApiError, errorResponse } from "@/lib/api-error";

const VALID_SORT_FIELDS = ["created_at", "total", "status", "quote_number", "paid_at"] as const;
const VALID_SORT_ORDERS = ["asc", "desc"] as const;

export async function GET(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient(request);
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) throw new ApiError(401, "Unauthorized", "UNAUTHORIZED");

    const { searchParams } = new URL(request.url);
    const page = Math.max(1, parseInt(searchParams.get("page") ?? "1"));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") ?? "10")));
    const status = searchParams.get("status");
    const customerId = searchParams.get("customerId");
    const paidFilter = searchParams.get("paid");
    const showArchived = searchParams.get("archived") === "1";

    const sortBy = searchParams.get("sortBy") ?? "created_at";
    const sortOrder = (searchParams.get("sortOrder") ?? "desc") as "asc" | "desc";

    if (!VALID_SORT_FIELDS.includes(sortBy as typeof VALID_SORT_FIELDS[number])) {
      throw new ApiError(400, `Invalid sortBy. Allowed: ${VALID_SORT_FIELDS.join(", ")}`, "VALIDATION_ERROR");
    }
    if (!VALID_SORT_ORDERS.includes(sortOrder as typeof VALID_SORT_ORDERS[number])) {
      throw new ApiError(400, `Invalid sortOrder. Use "asc" or "desc"`, "VALIDATION_ERROR");
    }

    const from = (page - 1) * limit;
    const to = from + limit - 1;

    let query = supabase
      .from("quotes")
      .select(
        "id, quote_number, customer_id, status, total, created_at, paid, paid_at, customers!inner(name)",
        { count: "exact" },
      )
      .eq("user_id", user.id);

    if (status) {
      if (status === "archived") {
        query = query.eq("archived", true);
      } else {
        query = query.eq("status", status);
      }
    }

    if (customerId) {
      query = query.eq("customer_id", customerId);
    }

    if (paidFilter === "true") {
      query = query.eq("paid", true);
    } else if (paidFilter === "false") {
      query = query.eq("paid", false);
    }

    if (!showArchived && status !== "archived") {
      query = query.neq("archived", true);
    }

    const { data, error, count } = await query
      .order(sortBy, { ascending: sortOrder === "asc" })
      .range(from, to);

    if (error) throw new ApiError(400, error.message);

    const totalPagesCalc = count ? Math.ceil(count / limit) : 0;

    const quotes = data.map((q: Record<string, unknown>) => {
      const customers = q.customers;
      const customerName = Array.isArray(customers)
        ? (customers[0] as Record<string, unknown>)?.name
        : (customers as Record<string, unknown>)?.name;
      return {
        id: q.id as string,
        quoteNumber: q.quote_number as string,
        customerId: q.customer_id as string,
        customerName: (customerName ?? "") as string,
        status: q.status as string,
        total: Number(q.total),
        paid: q.paid ?? false,
        paidAt: q.paid_at ?? null,
        createdAt: q.created_at as string,
      };
    });

    return NextResponse.json({
      quotes,
      pagination: {
        total: count ?? 0,
        page,
        limit,
        totalPages: totalPagesCalc,
        hasNext: page < totalPagesCalc,
        hasPrev: page > 1,
      },
      sort: {
        by: sortBy,
        order: sortOrder,
      },
    });
  } catch (error) {
    return errorResponse(error);
  }
}
