import { NextRequest, NextResponse } from "next/server";
import { PDFDocument, rgb, StandardFonts } from "pdf-lib";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { ApiError, errorResponse } from "@/lib/api-error";
import { REGIONS } from "@/lib/localization";

function drawHeader(page: any, font: any, boldFont: any, width: number, height: number, config: {
  companyName: string; phone?: string; email?: string; quoteNumber: string; status: string;
  logoImage?: any; logoDims?: { width: number; height: number };
}) {
  let y = height - 50;
  page.drawText(config.companyName, { x: 50, y, size: 24, font: boldFont, color: rgb(0.1, 0.1, 0.1) });
  y -= 20;
  if (config.phone) { page.drawText(`Phone: ${config.phone}`, { x: 50, y, size: 10, font, color: rgb(0.4, 0.4, 0.4) }); y -= 14; }
  if (config.email) { page.drawText(`Email: ${config.email}`, { x: 50, y, size: 10, font, color: rgb(0.4, 0.4, 0.4) }); y -= 14; }
  if (config.logoImage && config.logoDims) {
    page.drawImage(config.logoImage, { x: width - 50 - config.logoDims.width, y: height - 60 - config.logoDims.height, width: config.logoDims.width, height: config.logoDims.height });
  }
  y -= 6;
  page.drawText(`Quote #${config.quoteNumber}`, { x: 50, y, size: 16, font: boldFont, color: rgb(0.3, 0.3, 0.3) });
  y -= 10;
  page.drawText(`Status: ${config.status.toUpperCase()}`, { x: 50, y, size: 11, font, color: rgb(0.5, 0.5, 0.5) });
  y -= 20;
  page.drawLine({ start: { x: 50, y }, end: { x: width - 50, y }, thickness: 1, color: rgb(0.8, 0.8, 0.8) });
  return y - 25;
}

function drawTableHead(page: any, font: any, boldFont: any, width: number, currentY: number, cols: number[]) {
  const headers = ["Description", "Qty", "Unit Price", "Amount"];
  headers.forEach((h, i) => page.drawText(h, { x: cols[i], y: currentY, size: 9, font: boldFont, color: rgb(0.4, 0.4, 0.4) }));
  const lineY = currentY - 10;
  page.drawLine({ start: { x: 50, y: lineY }, end: { x: width - 50, y: lineY }, thickness: 0.5, color: rgb(0.9, 0.9, 0.9) });
  return lineY - 15;
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
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

    // Currency symbol from region
    const regionCode = (profile as any)?.region_code ?? "UK";
    const currencySymbol = REGIONS[regionCode]?.currencySymbol ?? "£";

    // Generate PDF
    const pdfDoc = await PDFDocument.create();
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

    // Logo
    let logoImage: any = null;
    let logoDims: { width: number; height: number } | null = null;
    const logoUrl = (profile as any)?.logo_url;
    if (logoUrl && typeof logoUrl === "string" && logoUrl.startsWith("data:image/")) {
      try {
        const match = logoUrl.match(/^data:image\/(png|jpeg|jpg);base64,(.+)$/);
        if (match) {
          const bytes = Uint8Array.from(atob(match[2]), (c) => c.charCodeAt(0));
          logoImage = match[1] === "png" ? await pdfDoc.embedPng(bytes) : await pdfDoc.embedJpg(bytes);
          const scale = Math.min(120 / logoImage.width, 60 / logoImage.height, 1);
          logoDims = { width: logoImage.width * scale, height: logoImage.height * scale };
        }
      } catch { /* skip */ }
    }

    const page = pdfDoc.addPage([595.28, 841.89]);
    const { width, height } = page.getSize();

    const companyName = profile?.company_name ?? "Your Company";
    const quoteNumber = quote.quote_number;
    const customer = quote.customers as any;
    const customerName = customer?.name ?? "Customer";

    // Header
    let y = drawHeader(page, font, boldFont, width, height, {
      companyName,
      phone: (profile as any)?.phone,
      email: user?.email,
      quoteNumber,
      status: "sent",
      logoImage,
      logoDims: logoDims ? { ...logoDims } : undefined,
    });

    // Customer info section
    y -= 20;
    const customerStartY = y;
    page.drawText("Bill To:", { x: 50, y, size: 12, font: boldFont });
    y -= 18;
    page.drawText(customerName, { x: 50, y, size: 11, font });
    y -= 15;
    if (customer?.company) { page.drawText(customer.company, { x: 50, y, size: 11, font }); y -= 15; }
    if (customer?.email) { page.drawText(customer.email, { x: 50, y, size: 11, font }); y -= 15; }
    if (customer?.phone) { page.drawText(customer.phone, { x: 50, y, size: 11, font }); y -= 15; }

    // Dates — right-aligned, at same height as customer info
    const dateY = customerStartY - 18;
    page.drawText(`Date: ${new Date(quote.created_at).toLocaleDateString()}`, {
      x: width - 200, y: dateY, size: 10, font, color: rgb(0.4, 0.4, 0.4),
    });
    if (quote.valid_until) {
      page.drawText(`Valid until: ${new Date(quote.valid_until).toLocaleDateString()}`, {
        x: width - 200, y: dateY - 15, size: 10, font, color: rgb(0.4, 0.4, 0.4),
      });
    }

    y -= 20;
    page.drawLine({ start: { x: 50, y }, end: { x: width - 50, y }, thickness: 0.5, color: rgb(0.8, 0.8, 0.8) });
    y -= 20;

    // Items table
    const colX = [50, 250, 350, 420];
    let currentPage = page;
    y = drawTableHead(page, font, boldFont, width, y, colX);

    const items = (quote.quote_items || []).sort(
      (a: any, b: any) => a.sort_order - b.sort_order,
    );

    items.forEach((item: any) => {
      if (y < 120) {
        currentPage = pdfDoc.addPage([595.28, 841.89]);
        y = height - 50;
        y = drawTableHead(currentPage, font, boldFont, width, y, colX);
      }

      const desc = item.description.length > 30 ? item.description.substring(0, 29) + "…" : item.description;
      currentPage.drawText(desc, { x: colX[0], y, size: 10, font });
      currentPage.drawText(String(item.quantity), { x: colX[1], y, size: 10, font });
      currentPage.drawText(`${currencySymbol}${Number(item.unit_price).toFixed(2)}`, { x: colX[2], y, size: 10, font });
      currentPage.drawText(`${currencySymbol}${Number(item.amount).toFixed(2)}`, { x: colX[3], y, size: 10, font });
      y -= 18;
    });

    if (y < 180) {
      currentPage = pdfDoc.addPage([595.28, 841.89]);
      y = height - 50;
    }

    // Line before totals
    y -= 5;
    currentPage.drawLine({ start: { x: 50, y }, end: { x: width - 50, y }, thickness: 1, color: rgb(0.6, 0.6, 0.6) });
    y -= 22;

    const labelX = width - 200;
    const valueX = width - 100;

    currentPage.drawText("Subtotal:", { x: labelX, y, size: 11, font });
    currentPage.drawText(`${currencySymbol}${Number(quote.subtotal).toFixed(2)}`, { x: valueX, y, size: 11, font });
    y -= 18;

    if (Number(quote.tax_rate) > 0) {
      currentPage.drawText(`Tax (${quote.tax_rate}%):`, { x: labelX, y, size: 11, font });
      currentPage.drawText(`${currencySymbol}${Number(quote.tax_amount).toFixed(2)}`, { x: valueX, y, size: 11, font });
      y -= 18;
    }

    currentPage.drawText("Total:", { x: labelX, y, size: 14, font: boldFont });
    currentPage.drawText(`${currencySymbol}${Number(quote.total).toFixed(2)}`, { x: valueX, y, size: 14, font: boldFont });

    // Notes
    if (quote.notes) {
      y -= 40;
      currentPage.drawText("Notes", { x: 50, y, size: 10, font: boldFont, color: rgb(0.4, 0.4, 0.4) });
      y -= 16;
      currentPage.drawText(quote.notes.substring(0, 80), { x: 50, y, size: 9, font, color: rgb(0.5, 0.5, 0.5) });
    }

    const pdfBytes = await pdfDoc.save();
    return new NextResponse(new Uint8Array(pdfBytes), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="Quote_${quoteNumber}.pdf"`,
      },
    });
  } catch (error) {
    return errorResponse(error);
  }
}
