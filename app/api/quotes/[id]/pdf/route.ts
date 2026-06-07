import { NextRequest, NextResponse } from "next/server";
import { PDFDocument, rgb, StandardFonts } from "pdf-lib";
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

    if (!user) throw new ApiError(401, "Unauthorized");

    const { id } = await params;

    const { data: quote, error } = await supabase
      .from("quotes")
      .select("*, customers(*), quote_items(*)")
      .eq("id", id)
      .eq("user_id", user.id)
      .single();

    if (error) throw new ApiError(404, "Quote not found");

    // Get user profile
    const { data: profile } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();

    // Generate PDF
    const pdfDoc = await PDFDocument.create();
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

    // Embed logo if available
    let logoImage: Awaited<ReturnType<typeof pdfDoc.embedPng>> | null = null;
    let logoDims: { width: number; height: number } | null = null;
    const logoUrl = (profile as Record<string, unknown>)?.logo_url as string | undefined;
    if (logoUrl && typeof logoUrl === "string" && logoUrl.startsWith("data:image/")) {
      try {
        const match = logoUrl.match(/^data:image\/(png|jpeg|jpg);base64,(.+)$/);
        if (match) {
          const type = match[1] === "png" ? "png" : "jpg";
          const b64 = match[2];
          const bytes = Uint8Array.from(atob(b64), (c) => c.charCodeAt(0));
          if (type === "png") {
            logoImage = await pdfDoc.embedPng(bytes);
          } else {
            logoImage = await pdfDoc.embedJpg(bytes);
          }
          const scale = Math.min(120 / logoImage.width, 60 / logoImage.height, 1);
          logoDims = { width: logoImage.width * scale, height: logoImage.height * scale };
        }
      } catch { /* logo embed failed, skip */ }
    }

    const page = pdfDoc.addPage([595.28, 841.89]); // A4
    const { width, height } = page.getSize();
    let y = height - 50;

    const companyName = profile?.company_name ?? "Your Company";
    const quoteNumber = quote.quote_number;
    const customerName = quote.customers?.name ?? "Customer";

    // Header
    page.drawText(companyName, { x: 50, y, size: 24, font: boldFont, color: rgb(0.1, 0.1, 0.1) });
    y -= 20;

    const profileData = profile as {
      company_name?: string;
      phone?: string;
      address?: string;
      city?: string;
      state?: string;
      zip?: string;
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

    // Draw logo top-right
    if (logoImage && logoDims) {
      page.drawImage(logoImage, {
        x: width - 50 - logoDims.width,
        y: height - 60 - logoDims.height,
        width: logoDims.width,
        height: logoDims.height,
      });
    }

    y -= 6;

    page.drawText(`Quote #${quoteNumber}`, {
      x: 50,
      y,
      size: 16,
      font: boldFont,
      color: rgb(0.3, 0.3, 0.3),
    });
    y -= 10;

    page.drawText(`Status: ${quote.status.toUpperCase()}`, {
      x: 50,
      y,
      size: 11,
      font,
      color: rgb(0.5, 0.5, 0.5),
    });
    y -= 25;

    // Line
    page.drawLine({
      start: { x: 50, y },
      end: { x: width - 50, y },
      thickness: 1,
      color: rgb(0.8, 0.8, 0.8),
    });
    y -= 25;

    // Customer info
    page.drawText("Bill To:", { x: 50, y, size: 12, font: boldFont });
    y -= 18;
    page.drawText(customerName, { x: 50, y, size: 11, font });
    y -= 15;

    const customer = quote.customers as {
      company?: string;
      email?: string;
      phone?: string;
      address?: string;
      city?: string;
      state?: string;
      zip?: string;
    } | null;

    if (customer?.company) {
      page.drawText(customer.company, { x: 50, y, size: 11, font });
      y -= 15;
    }
    if (customer?.email) {
      page.drawText(customer.email, { x: 50, y, size: 11, font });
      y -= 15;
    }

    y -= 15;

    // Date
    page.drawText(`Date: ${new Date(quote.created_at).toLocaleDateString()}`, {
      x: width - 200,
      y: y + 48,
      size: 11,
      font,
      color: rgb(0.5, 0.5, 0.5),
    });

    if (quote.valid_until) {
      page.drawText(`Valid Until: ${new Date(quote.valid_until).toLocaleDateString()}`, {
        x: width - 200,
        y: y + 33,
        size: 11,
        font,
        color: rgb(0.5, 0.5, 0.5),
      });
    }

    // Items header
    y -= 15;
    page.drawLine({
      start: { x: 50, y },
      end: { x: width - 50, y },
      thickness: 1,
      color: rgb(0.8, 0.8, 0.8),
    });
    y -= 20;

    const colX = [50, 250, 350, 420, 490];
    const headers = ["Description", "Qty", "Unit Price", "Amount", ""];
    headers.forEach((h, i) => {
      page.drawText(h, { x: colX[i], y, size: 9, font: boldFont, color: rgb(0.4, 0.4, 0.4) });
    });
    y -= 10;

    page.drawLine({
      start: { x: 50, y },
      end: { x: width - 50, y },
      thickness: 0.5,
      color: rgb(0.9, 0.9, 0.9),
    });
    y -= 15;

    // Items
    const items = (quote.quote_items || []).sort(
      (a: { sort_order: number }, b: { sort_order: number }) => a.sort_order - b.sort_order,
    );

    items.forEach((item: { description: string; quantity: number; unit_price: number; amount: number }) => {
      if (y < 80) {
        // New page if too low
        const newPage = pdfDoc.addPage([595.28, 841.89]);
        y = height - 50;
      }

      page.drawText(item.description.substring(0, 25), {
        x: colX[0],
        y,
        size: 10,
        font,
      });
      page.drawText(String(item.quantity), { x: colX[1], y, size: 10, font });
      page.drawText(`£${Number(item.unit_price).toFixed(2)}`, {
        x: colX[2],
        y,
        size: 10,
        font,
      });
      page.drawText(`£${Number(item.amount).toFixed(2)}`, {
        x: colX[3],
        y,
        size: 10,
        font,
      });
      y -= 18;
    });

    // Totals
    y -= 10;
    page.drawLine({
      start: { x: 50, y },
      end: { x: width - 50, y },
      thickness: 1,
      color: rgb(0.8, 0.8, 0.8),
    });
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
    page.drawText(`£${Number(quote.total).toFixed(2)}`, {
      x: valueX,
      y,
      size: 13,
      font: boldFont,
    });

    const pdfBytes = await pdfDoc.save();
    const fileName = `Quote_${quoteNumber}.pdf`;

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
