import { NextRequest, NextResponse } from "next/server";
import { PDFDocument, rgb, StandardFonts, degrees } from "pdf-lib";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { ApiError, errorResponse } from "@/lib/api-error";
import { REGIONS } from "@/lib/localization";

export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const supabase = await createServerSupabaseClient(_request);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new ApiError(401, "Unauthorized");

    const { id } = await params;
    const [quoteResult, profileResult] = await Promise.all([
      supabase.from("quotes").select("*, customers(*), quote_items(*)").eq("id", id).eq("user_id", user.id).single(),
      supabase.from("profiles").select("*").eq("id", user.id).single(),
    ]);
    if (quoteResult.error) throw new ApiError(404, "Quote not found");
    const quote = quoteResult.data;
    const profile = profileResult.data;
    if (!quote.paid) throw new ApiError(400, "Quote is not marked as paid");

    const regionCode = (profile as any)?.region_code ?? "UK";
    const C = REGIONS[regionCode]?.currencySymbol ?? "£";

    const pdfDoc = await PDFDocument.create();
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

    const page = pdfDoc.addPage([595.28, 841.89]);
    const { width, height: pageH } = page.getSize();
    const companyName = profile?.company_name ?? "Your Company";
    const customer = quote.customers as any;
    const customerName = customer?.name ?? "Customer";

    // Watermark
    const wm = "PAID";
    page.drawText(wm, { x: width / 2 - boldFont.widthOfTextAtSize(wm, 48) / 2, y: pageH / 2, size: 48, font: boldFont, color: rgb(0.85, 0.97, 0.88), rotate: degrees(45) });

    // Header
    let y = pageH - 60;
    page.drawText("RECEIPT", { x: 50, y: pageH - 40, size: 11, font: boldFont, color: rgb(0.12, 0.42, 0.31) });
    page.drawText(companyName, { x: 50, y, size: 24, font: boldFont }); y -= 18;
    const pd = profile as any;
    if (pd?.phone) { page.drawText(`Phone: ${pd.phone}`, { x: 50, y, size: 10, font, color: rgb(0.4, 0.4, 0.4) }); y -= 14; }
    if (user?.email) { page.drawText(`Email: ${user.email}`, { x: 50, y, size: 10, font, color: rgb(0.4, 0.4, 0.4) }); y -= 14; }
    y -= 6;
    page.drawText(`Quote #${quote.quote_number}`, { x: 50, y, size: 16, font: boldFont, color: rgb(0.3, 0.3, 0.3) }); y -= 10;
    page.drawText("Status: PAID", { x: 50, y, size: 11, font: boldFont, color: rgb(0.12, 0.42, 0.31) });
    y -= 20;
    page.drawLine({ start: { x: 50, y }, end: { x: width - 50, y }, thickness: 1, color: rgb(0.8, 0.8, 0.8) });
    y -= 25;

    const csY = y;
    page.drawText("Bill To:", { x: 50, y, size: 12, font: boldFont }); y -= 18;
    page.drawText(customerName, { x: 50, y, size: 11, font }); y -= 15;
    if (customer?.company) { page.drawText(customer.company, { x: 50, y, size: 11, font }); y -= 15; }
    if (customer?.email) { page.drawText(customer.email, { x: 50, y, size: 11, font }); y -= 15; }

    page.drawText(`Date: ${new Date(quote.created_at).toLocaleDateString()}`, { x: width - 200, y: csY - 18, size: 10, font, color: rgb(0.4, 0.4, 0.4) });
    if (quote.paid_at) page.drawText(`Paid: ${new Date(quote.paid_at as string).toLocaleDateString()}`, { x: width - 200, y: csY - 33, size: 10, font: boldFont, color: rgb(0.12, 0.42, 0.31) });

    y -= 20;
    page.drawLine({ start: { x: 50, y }, end: { x: width - 50, y }, thickness: 0.5, color: rgb(0.8, 0.8, 0.8) });
    y -= 20;

    const cols = [50, 250, 350, 420];
    let cp = page;
    ["Description", "Qty", "Unit Price", "Amount"].forEach((h, i) => cp.drawText(h, { x: cols[i], y, size: 9, font: boldFont, color: rgb(0.4, 0.4, 0.4) }));
    y -= 10;
    cp.drawLine({ start: { x: 50, y }, end: { x: width - 50, y }, thickness: 0.5, color: rgb(0.9, 0.9, 0.9) });
    y -= 15;

    (quote.quote_items || []).sort((a: any, b: any) => a.sort_order - b.sort_order).forEach((item: any) => {
      if (y < 120) { cp = pdfDoc.addPage([595.28, 841.89]); y = pageH - 50; ["Description","Qty","Unit Price","Amount"].forEach((h, i) => cp.drawText(h, { x: cols[i], y: y + 10, size: 8, font: boldFont, color: rgb(0.4, 0.4, 0.4) })); }
      const d = item.description.length > 30 ? item.description.substring(0, 29) + "…" : item.description;
      cp.drawText(d, { x: cols[0], y, size: 10, font });
      cp.drawText(String(item.quantity), { x: cols[1], y, size: 10, font });
      cp.drawText(`${C}${Number(item.unit_price).toFixed(2)}`, { x: cols[2], y, size: 10, font });
      cp.drawText(`${C}${Number(item.amount).toFixed(2)}`, { x: cols[3], y, size: 10, font });
      y -= 18;
    });

    if (y < 180) { cp = pdfDoc.addPage([595.28, 841.89]); y = pageH - 50; }
    y -= 5;
    cp.drawLine({ start: { x: 50, y }, end: { x: width - 50, y }, thickness: 1, color: rgb(0.6, 0.6, 0.6) });
    y -= 22;

    const lx = width - 200, vx = width - 100;
    cp.drawText("Subtotal:", { x: lx, y, size: 11, font }); cp.drawText(`${C}${Number(quote.subtotal).toFixed(2)}`, { x: vx, y, size: 11, font }); y -= 18;
    if (Number(quote.tax_rate) > 0) { cp.drawText(`Tax (${quote.tax_rate}%):`, { x: lx, y, size: 11, font }); cp.drawText(`${C}${Number(quote.tax_amount).toFixed(2)}`, { x: vx, y, size: 11, font }); y -= 18; }
    cp.drawText("Total:", { x: lx, y, size: 14, font: boldFont }); cp.drawText(`${C}${Number(quote.total).toFixed(2)}`, { x: vx, y, size: 14, font: boldFont });
    y -= 28;
    cp.drawText("PAID", { x: vx, y, size: 14, font: boldFont, color: rgb(0.12, 0.42, 0.31) });

    const pdfBytes = await pdfDoc.save();
    return new NextResponse(new Uint8Array(pdfBytes), {
      headers: { "Content-Type": "application/pdf", "Content-Disposition": `attachment; filename="Receipt_${quote.quote_number}.pdf"` },
    });
  } catch (error) {
    return errorResponse(error);
  }
}
