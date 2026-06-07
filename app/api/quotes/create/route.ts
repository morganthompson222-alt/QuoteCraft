import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  sanitizeString,
  sanitizeNumber,
  sanitizeOptionalString,
} from "@/lib/validation";
import { ApiError, errorResponse } from "@/lib/api-error";
import { enforcePlanLimit } from "@/lib/plan-enforcement";

export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient(request);
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) throw new ApiError(401, "Unauthorized");

    await enforcePlanLimit(user.id, "create_quote");

    const body = await request.json();
    const customerId = sanitizeString(body.customerId);
    const taxRate = sanitizeNumber(body.taxRate ?? 0, 0, 100);
    const notes = sanitizeOptionalString(body.notes);
    const imageUrl = sanitizeOptionalString(body.imageUrl);

    const items: Array<{
      description: string;
      quantity: number;
      unitPrice: number;
    }> = body.items;

    if (!Array.isArray(items) || items.length === 0) {
      throw new ApiError(400, "At least one item is required");
    }

    // Verify customer belongs to user
    const { data: customer } = await supabase
      .from("customers")
      .select("id")
      .eq("id", customerId)
      .eq("user_id", user.id)
      .single();

    if (!customer) throw new ApiError(404, "Customer not found");

    // Generate quote number
    const admin = createAdminClient();

    const { data: profile } = await admin
      .from("profiles")
      .select("quote_prefix, next_quote_number")
      .eq("id", user.id)
      .single();

    if (!profile) throw new ApiError(500, "Profile not found");

    const currentNum = profile.next_quote_number;
    const quoteNumber = `${profile.quote_prefix}${String(currentNum).padStart(4, "0")}`;

    // Increment counter (best-effort; UNIQUE constraint on quotes prevents duplicates)
    await admin
      .from("profiles")
      .update({ next_quote_number: currentNum + 1 })
      .eq("id", user.id)
      .eq("next_quote_number", currentNum);

    // Create quote with items
    const { data: quote, error: quoteError } = await supabase
      .from("quotes")
      .insert({
        user_id: user.id,
        customer_id: customerId,
        quote_number: quoteNumber,
        tax_rate: taxRate,
        notes,
        image_url: imageUrl,
        valid_until: body.validUntil ?? null,
      })
      .select()
      .single();

    if (quoteError) throw new ApiError(400, quoteError.message);

    // Insert items
    const quoteItems = items.map((item, i) => ({
      quote_id: quote.id,
      description: sanitizeString(item.description),
      quantity: sanitizeNumber(item.quantity, 0.01),
      unit_price: sanitizeNumber(item.unitPrice, 0),
      sort_order: i,
    }));

    const { data: insertedItems, error: itemsError } = await supabase
      .from("quote_items")
      .insert(quoteItems)
      .select();

    if (itemsError) throw new ApiError(400, itemsError.message);

    // Increment quote number
    await admin
      .from("profiles")
      .update({ next_quote_number: profile.next_quote_number + 1 })
      .eq("id", user.id);

    // Fetch updated quote with totals (trigger has calculated them)
    const { data: updatedQuote } = await supabase
      .from("quotes")
      .select("*")
      .eq("id", quote.id)
      .single();

    return NextResponse.json({
      id: updatedQuote!.id,
      quoteNumber: updatedQuote!.quote_number,
      customerId: updatedQuote!.customer_id,
      status: updatedQuote!.status,
      subtotal: Number(updatedQuote!.subtotal),
      taxRate: Number(updatedQuote!.tax_rate),
      taxAmount: Number(updatedQuote!.tax_amount),
      total: Number(updatedQuote!.total),
      items: insertedItems.map((item) => ({
        id: item.id,
        description: item.description,
        quantity: Number(item.quantity),
        unitPrice: Number(item.unit_price),
        amount: Number(item.amount),
      })),
      createdAt: updatedQuote!.created_at,
    });
  } catch (error) {
    return errorResponse(error);
  }
}
