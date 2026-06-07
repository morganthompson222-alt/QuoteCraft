import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { ApiError, errorResponse } from "@/lib/api-error";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const supabase = await createServerSupabaseClient(_request);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new ApiError(401, "Unauthorized");

    const { id } = await params;

    const { data: quote, error } = await supabase
      .from("quotes")
      .select("*, customers(*), quote_items(*)")
      .eq("id", id)
      .eq("user_id", user.id)
      .single();

    if (error) throw new ApiError(404, "Quote not found");

    // Fetch linked job status
    const { data: linkedJob } = await supabase
      .from("jobs")
      .select("id, status")
      .eq("quote_id", id)
      .eq("user_id", user.id)
      .maybeSingle();

    return NextResponse.json({
      id: quote.id,
      quoteNumber: quote.quote_number,
      customerId: quote.customer_id,
      status: quote.status,
      paid: quote.paid ?? false,
      paidAt: quote.paid_at ?? null,
      jobId: linkedJob?.id ?? null,
      jobStatus: linkedJob?.status ?? null,
      subtotal: Number(quote.subtotal),
      taxRate: Number(quote.tax_rate),
      taxAmount: Number(quote.tax_amount),
      total: Number(quote.total),
      notes: quote.notes,
      validUntil: quote.valid_until,
      createdAt: quote.created_at,
      updatedAt: quote.updated_at,
      jobDate: quote.job_date ?? null,
      startTime: quote.start_time ?? null,
      endTime: quote.end_time ?? null,
      customer: {
        id: quote.customers.id,
        name: quote.customers.name,
        email: quote.customers.email,
        phone: quote.customers.phone,
        company: quote.customers.company,
      },
      items: (quote.quote_items || [])
        .sort((a: { sort_order: number }, b: { sort_order: number }) => a.sort_order - b.sort_order)
        .map((item: { id: string; description: string; quantity: number; unit_price: number; amount: number }) => ({
          id: item.id,
          description: item.description,
          quantity: Number(item.quantity),
          unitPrice: Number(item.unit_price),
          amount: Number(item.amount),
        })),
    });
  } catch (error) {
    return errorResponse(error);
  }
}
