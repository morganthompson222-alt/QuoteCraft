import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const admin = createAdminClient();
    const { id } = await params;

    const { data: quote, error } = await admin
      .from("quotes")
      .select("*, customers(name, email, company), quote_items(*)")
      .eq("id", id)
      .single();

    if (error || !quote) {
      return NextResponse.json({ error: { message: "Quote not found", statusCode: 404 } }, { status: 404 });
    }

    // Get company branding
    const { data: profile } = await admin
      .from("profiles")
      .select("company_name, logo_url, phone")
      .eq("id", quote.user_id)
      .single();

    const items = ((quote.quote_items || []) as Array<Record<string, unknown>>)
      .sort((a, b) => (a.sort_order as number) - (b.sort_order as number))
      .map((item) => ({
        description: item.description as string,
        quantity: Number(item.quantity),
        unitPrice: Number(item.unit_price),
        amount: Number(item.amount),
      }));

    const customer = quote.customers as Record<string, unknown>;

    return NextResponse.json({
      id: quote.id,
      quoteNumber: quote.quote_number as string,
      status: quote.status as string,
      subtotal: Number(quote.subtotal),
      taxRate: Number(quote.tax_rate),
      taxAmount: Number(quote.tax_amount),
      total: Number(quote.total),
      notes: quote.notes as string | null,
      imageUrl: quote.image_url as string | null,
      validUntil: quote.valid_until as string | null,
      createdAt: quote.created_at as string,
      companyName: profile?.company_name ?? "Your Company",
      companyLogo: profile?.logo_url ?? null,
      companyPhone: profile?.phone ?? null,
      customer: {
        name: customer.name as string,
        email: customer.email as string,
        company: customer.company as string | null,
      },
      items,
      traderId: quote.user_id as string,
    });
  } catch {
    return NextResponse.json({ error: { message: "Quote not found", statusCode: 404 } }, { status: 404 });
  }
}
