import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { ApiError, errorResponse } from "@/lib/api-error";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const supabase = await createServerSupabaseClient(_request);
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) throw new ApiError(401, "Unauthorized", "UNAUTHORIZED");

    const { id } = await params;

    const { data: quote, error } = await supabase
      .from("quotes")
      .select("*, customers(*), quote_items(*)")
      .eq("id", id)
      .eq("user_id", user.id)
      .single();

    if (error) throw new ApiError(404, "Quote not found", "NOT_FOUND");

    const customer = quote.customers as Record<string, unknown>;
    const items = (quote.quote_items ?? []) as Array<Record<string, unknown>>;
    items.sort((a, b) => (a.sort_order as number) - (b.sort_order as number));

    return NextResponse.json({
      quoteNumber: quote.quote_number,
      status: quote.status,
      createdAt: quote.created_at,
      validUntil: quote.valid_until,
      customer: {
        name: customer.name,
        company: customer.company,
        email: customer.email,
        phone: customer.phone,
      },
      items: items.map((item) => ({
        description: item.description,
        quantity: Number(item.quantity),
        unitPrice: Number(item.unit_price),
        amount: Number(item.amount),
      })),
      subtotal: Number(quote.subtotal),
      taxRate: Number(quote.tax_rate),
      taxAmount: Number(quote.tax_amount),
      total: Number(quote.total),
      notes: quote.notes,
    });
  } catch (error) {
    return errorResponse(error);
  }
}
