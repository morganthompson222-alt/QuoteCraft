import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { ApiError, errorResponse } from "@/lib/api-error";
import { sendQuoteEmail } from "@/lib/email";

const currencySymbols: Record<string, string> = { GBP: "£", USD: "$", CAD: "C$", AUD: "A$", EUR: "€" };

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const supabase = await createServerSupabaseClient(request);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new ApiError(401, "Unauthorized");

    const { id } = await params;

    const { data: quote, error: quoteError } = await supabase
      .from("quotes")
      .select("*, customers(*), quote_items(*)")
      .eq("id", id)
      .eq("user_id", user.id)
      .single();

    if (quoteError) throw new ApiError(404, "Quote not found");

    const customer = quote.customers;
    if (!customer?.email) {
      throw new ApiError(400, "Customer has no email address");
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("company_name, currency_code")
      .eq("id", user.id)
      .single();

    const companyName = profile?.company_name ?? "Your tradesperson";
    const currencyCode = profile?.currency_code ?? "GBP";
    const currencySymbol = currencySymbols[currencyCode] ?? "£";
    const publicUrl = `${process.env.NEXT_PUBLIC_APP_URL || "https://quotecraft026.vercel.app"}/q/${id}`;

    const result = await sendQuoteEmail({
      to: customer.email,
      companyName,
      quoteNumber: quote.quote_number,
      customerName: customer.name,
      total: quote.total,
      currencySymbol,
      publicUrl,
    });

    if (!result.success) {
      throw new ApiError(500, result.error ?? "Failed to send email");
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return errorResponse(error);
  }
}
