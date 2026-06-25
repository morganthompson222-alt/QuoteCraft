import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const admin = createAdminClient();
    const { id } = await params;
    const body = await _request.json();
    const action = body.action as string;

    if (!action || !["accepted", "rejected", "request_new_quote"].includes(action)) {
      return NextResponse.json({ error: { message: "Invalid action", statusCode: 400 } }, { status: 400 });
    }

    const { data: quote, error: fetchErr } = await admin
      .from("quotes")
      .select("status, user_id, quote_number, customers(name)")
      .eq("id", id)
      .single();

    if (fetchErr || !quote) {
      return NextResponse.json({ error: { message: "Quote not found", statusCode: 404 } }, { status: 404 });
    }

    // Handle "request new quote" for expired quotes
    if (action === "request_new_quote") {
      if (quote.status !== "expired") {
        return NextResponse.json({ error: { message: "Only expired quotes can request a new quote", statusCode: 400 } }, { status: 400 });
      }
      const customerName = (quote.customers as { name?: string })?.name ?? "";
      await admin.from("notifications").insert({
        user_id: quote.user_id,
        type: "quote_requested",
        quote_id: id,
        message: `${customerName} is requesting a new quote for #${quote.quote_number} (previously expired)`,
      });
      return NextResponse.json({ status: "requested" });
    }

    if (quote.status !== "sent") {
      return NextResponse.json({ error: { message: "Quote is not in a state that can be accepted or rejected", statusCode: 400 } }, { status: 400 });
    }

    const newStatus = action; // "accepted" or "rejected"
    const customerName = (quote.customers as { name?: string })?.name ?? "";

    const { error: updateErr } = await admin
      .from("quotes")
      .update({ status: newStatus, updated_at: new Date().toISOString() })
      .eq("id", id);

    if (updateErr) {
      return NextResponse.json({ error: { message: "Failed to update", statusCode: 500 } }, { status: 500 });
    }

    // Notify trader
    const type = action === "accepted" ? "quote_accepted" : "quote_rejected";
    const msg = `${customerName} has ${action} your quote #${quote.quote_number}`;
    await admin.from("notifications").insert({
      user_id: quote.user_id,
      type,
      quote_id: id,
      message: msg,
    });

    return NextResponse.json({ status: newStatus });
  } catch {
    return NextResponse.json({ error: { message: "Server error", statusCode: 500 } }, { status: 500 });
  }
}
