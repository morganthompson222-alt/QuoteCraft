import { NextRequest, NextResponse } from "next/server";
import { PDFDocument, rgb, StandardFonts, degrees } from "pdf-lib";
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
    if (!quote.paid) throw new ApiError(400, "Quote is not marked as paid", "VALIDATION_ERROR");

    const { data: profile } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();

    const pdfDoc = await PDFDocument.create();
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

    const page = pdfDoc.addPage([595.28, 841.89]);
    const { width, height } = page.getSize();

    const companyName = profile?.company_name ?? "Your Company";
    const quoteNumber = quote.quote_number;
    const customerName = quote.customers?.name ?? "Customer";

    // Watermark ─ "PAID" diagonally across the page
    const watermarkText = "PAID";
    const watermarkSize = 60;
    const wColor = rgb(0.80, 0.97, 0.85);
    const wWidth = boldFont.widthOfTextAtSize(watermarkText, watermarkSize);
    const offset = wWidth * 0.35355;
    const spacing = wWidth * 1.2;

    for (let row = -1; row * spacing < height + spacing; row++) {
      for (let col = -1; col * spacing < width + spacing; col++) {
        const cx = col * spacing;
        const cy = row * spacing;
        page.drawText(watermarkText, {
          x: cx - offset,
          y: cy - offset,
          size: watermarkSize,
          font: boldFont,
          color: wColor,
          rotate: degrees(45),
        });
      }
    }

    // RECEIPT banner at top
    page.drawText("RECEIPT", {
      x: 50,
      y: height - 40,
      size: 11,
      font: boldFont,
      color: rgb(0.12, 0.42, 0.31),
    });

    let y = height - 72;

    // Company info
    page.drawText(companyName, { x: 50, y, size: 24, font: boldFont, color: rgb(0.1, 0.1, 0.1) });
    y -= 20;

    const profileData = profile as {
      company_name?: string; phone?: string; address?: string;
      city?: string; state?: string; zip?: string;
    } | null;

    if (profileData?.phone) {
      page.drawText(`Phone: ${profileData.phone}`, { x: 50, y, size: 10, font, color: rgb(0.4, 0.4, 0.4) });
      y -= 14;
    }

    const addrParts = [profileData?.address, profileData?.city, profileData?.state, profileData?.zip].filter(Boolean);
    if (addrParts.length > 0) {
      page.drawText(addrParts.join(", "), { x: 50, y, size: 10, font, color: rgb(0.4, 0.4, 0.4) });
      y -= 14;
    }

    if (user?.email) {
      page.drawText(`Email: ${user.email}`, { x: 50, y, size: 10, font, color: rgb(0.4, 0.4, 0.4) });
      y -= 14;
    }

    y -= 6;

    page.drawText(`Quote #${quoteNumber}`, { x: 50, y, size: 16, font: boldFont, color: rgb(0.3, 0.3, 0.3) });
    y -= 10;
    page.drawText(`Status: PAID`, { x: 50, y, size: 11, font: boldFont, color: rgb(0.12, 0.42, 0.31) });
    y -= 25;

    page.drawLine({ start: { x: 50, y }, end: { x: width - 50, y }, thickness: 1, color: rgb(0.8, 0.8, 0.8) });
    y -= 25;

    page.drawText("Bill To:", { x: 50, y, size: 12, font: boldFont });
    y -= 18;
    page.drawText(customerName, { x: 50, y, size: 11, font });
    y -= 15;

    const customer = quote.customers as {
      company?: string; email?: string; phone?: string;
      address?: string; city?: string; state?: string; zip?: string;
    } | null;

    if (customer?.company) { page.drawText(customer.company, { x: 50, y, size: 11, font }); y -= 15; }
    if (customer?.email) { page.drawText(customer.email, { x: 50, y, size: 11, font }); y -= 15; }

    y -= 15;

    const dateY = y + 48;
    page.drawText(`Date: ${new Date(quote.created_at).toLocaleDateString()}`, {
      x: width - 200, y: dateY, size: 11, font, color: rgb(0.5, 0.5, 0.5),
    });

    if (quote.paid_at) {
      page.drawText(`Date Paid: ${new Date(quote.paid_at as string).toLocaleDateString()}`, {
        x: width - 200, y: dateY - 15, size: 11, font: boldFont, color: rgb(0.12, 0.42, 0.31),
      });
    }

    y -= 15;
    page.drawLine({ start: { x: 50, y }, end: { x: width - 50, y }, thickness: 1, color: rgb(0.8, 0.8, 0.8) });
    y -= 20;

    const colX = [50, 250, 350, 420, 490];
    ["Description", "Qty", "Unit Price", "Amount", ""].forEach((h, i) => {
      page.drawText(h, { x: colX[i], y, size: 9, font: boldFont, color: rgb(0.4, 0.4, 0.4) });
    });
    y -= 10;
    page.drawLine({ start: { x: 50, y }, end: { x: width - 50, y }, thickness: 0.5, color: rgb(0.9, 0.9, 0.9) });
    y -= 15;

    const items = (quote.quote_items || []).sort(
      (a: { sort_order: number }, b: { sort_order: number }) => a.sort_order - b.sort_order,
    );

    items.forEach((item: { description: string; quantity: number; unit_price: number; amount: number }) => {
      if (y < 80) { pdfDoc.addPage([595.28, 841.89]); y = height - 50; }
      page.drawText(item.description.substring(0, 25), { x: colX[0], y, size: 10, font });
      page.drawText(String(item.quantity), { x: colX[1], y, size: 10, font });
      page.drawText(`£${Number(item.unit_price).toFixed(2)}`, { x: colX[2], y, size: 10, font });
      page.drawText(`£${Number(item.amount).toFixed(2)}`, { x: colX[3], y, size: 10, font });
      y -= 18;
    });

    y -= 10;
    page.drawLine({ start: { x: 50, y }, end: { x: width - 50, y }, thickness: 1, color: rgb(0.8, 0.8, 0.8) });
    y -= 20;

    const labelX = width - 200;
    const valueX = width - 100;

    page.drawText("Subtotal:", { x: labelX, y, size: 11, font });
    page.drawText(`£${Number(quote.subtotal).toFixed(2)}`, { x: valueX, y, size: 11, font });
    y -= 18;

    if (Number(quote.tax_rate) > 0) {
      page.drawText(`Tax (${quote.tax_rate}%):`, { x: labelX, y, size: 11, font });
      page.drawText(`£${Number(quote.tax_amount).toFixed(2)}`, { x: valueX, y, size: 11, font });
      y -= 18;
    }

    page.drawText("Total:", { x: labelX, y, size: 13, font: boldFont });
    page.drawText(`£${Number(quote.total).toFixed(2)}`, { x: valueX, y, size: 13, font: boldFont });

    // Paid stamp
    y -= 24;
    page.drawText("PAID", {
      x: valueX,
      y,
      size: 14,
      font: boldFont,
      color: rgb(0.12, 0.42, 0.31),
    });

    const pdfBytes = await pdfDoc.save();
    const fileName = `Receipt_Quote_${quoteNumber}.pdf`;

    return new NextResponse(pdfBytes as BodyInit, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${fileName}"`,
      },
    });
  } catch (error) {
    return errorResponse(error);
  }
}
