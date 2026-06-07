import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import {
  sanitizeString,
  sanitizeNumber,
  sanitizeOptionalString,
} from "@/lib/validation";
import { ApiError, errorResponse } from "@/lib/api-error";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const supabase = await createServerSupabaseClient(request);
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) throw new ApiError(401, "Unauthorized");

    const { id } = await params;
    const body = await request.json();

    // Verify ownership
    const { data: existing } = await supabase
      .from("quotes")
      .select("id, status")
      .eq("id", id)
      .eq("user_id", user.id)
      .single();

    if (!existing) throw new ApiError(404, "Quote not found");
    if (existing.status !== "draft") {
      throw new ApiError(400, "Only draft quotes can be edited");
    }

    // Update quote fields
    const quoteUpdate: Record<string, unknown> = {};
    if (body.customerId !== undefined) quoteUpdate.customer_id = sanitizeString(body.customerId);
    if (body.taxRate !== undefined) quoteUpdate.tax_rate = sanitizeNumber(body.taxRate, 0, 100);
    if (body.notes !== undefined) quoteUpdate.notes = sanitizeOptionalString(body.notes);
    if (body.validUntil !== undefined) quoteUpdate.valid_until = body.validUntil;

    if (Object.keys(quoteUpdate).length > 0) {
      quoteUpdate.updated_at = new Date().toISOString();

      const { error: updateError } = await supabase
        .from("quotes")
        .update(quoteUpdate)
        .eq("id", id)
        .eq("user_id", user.id);

      if (updateError) throw new ApiError(400, updateError.message);
    }

    // If items provided, replace all items
    if (Array.isArray(body.items)) {
      if (body.items.length === 0) {
        throw new ApiError(400, "At least one item is required");
      }

      // Delete existing items
      await supabase.from("quote_items").delete().eq("quote_id", id);

      // Insert new items
      const newItems = body.items.map(
        (item: { description: string; quantity: number; unitPrice: number }, i: number) => ({
          quote_id: id,
          description: sanitizeString(item.description),
          quantity: sanitizeNumber(item.quantity, 0.01),
          unit_price: sanitizeNumber(item.unitPrice, 0),
          sort_order: i,
        }),
      );

      const { error: itemsError } = await supabase
        .from("quote_items")
        .insert(newItems);

      if (itemsError) throw new ApiError(400, itemsError.message);
    }

    // Return updated quote
    const { data: updated } = await supabase
      .from("quotes")
      .select("*, quote_items(*)")
      .eq("id", id)
      .single();

    return NextResponse.json({
      id: updated!.id,
      quoteNumber: updated!.quote_number,
      customerId: updated!.customer_id,
      status: updated!.status,
      subtotal: Number(updated!.subtotal),
      taxRate: Number(updated!.tax_rate),
      taxAmount: Number(updated!.tax_amount),
      total: Number(updated!.total),
      items: (updated!.quote_items || [])
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
