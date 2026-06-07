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
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new ApiError(401, "Unauthorized");

    const { id } = await params;

    const { data: job, error } = await supabase
      .from("jobs")
      .select("*, quotes(quote_number, total, subtotal, quote_items(*))")
      .eq("id", id)
      .eq("user_id", user.id)
      .single();

    if (error || !job) throw new ApiError(404, "Job not found");

    const { data: profile } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();

    const pdfDoc = await PDFDocument.create();
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

    const page = pdfDoc.addPage([595.28, 841.89]);
    const { width } = page.getSize();

    const companyName = profile?.company_name ?? "Your Company";
    const profileData = profile as {
      company_name?: string; phone?: string; address?: string;
      city?: string; state?: string; zip?: string;
    } | null;

    let y = 50;

    // Company header
    page.drawText(companyName, { x: 50, y, size: 22, font: boldFont, color: rgb(0.1, 0.1, 0.1) });
    y += 22;

    if (profileData?.phone) {
      page.drawText(`Phone: ${profileData.phone}`, { x: 50, y, size: 10, font, color: rgb(0.4, 0.4, 0.4) });
      y += 14;
    }

    const addrParts = [profileData?.address, profileData?.city, profileData?.state, profileData?.zip].filter(Boolean);
    if (addrParts.length > 0) {
      page.drawText(addrParts.join(", "), { x: 50, y, size: 10, font, color: rgb(0.4, 0.4, 0.4) });
      y += 14;
    }

    if (user?.email) {
      page.drawText(`Email: ${user.email}`, { x: 50, y, size: 10, font, color: rgb(0.4, 0.4, 0.4) });
      y += 14;
    }

    y += 16;

    // Divider
    page.drawLine({ start: { x: 50, y }, end: { x: width - 50, y }, thickness: 1, color: rgb(0.8, 0.8, 0.8) });
    y += 16;

    // Title
    page.drawText("JOB SHEET", { x: 50, y, size: 18, font: boldFont, color: rgb(0.12, 0.42, 0.31) });
    y += 12;
    page.drawText(job.job_title as string, { x: 50, y, size: 14, font: boldFont, color: rgb(0.1, 0.1, 0.1) });
    y += 24;

    // Job details
    const detailRows: [string, string][] = [
      ["Customer", (job.customer_name as string) || "—"],
      ["Date", job.job_date as string],
      ["Time", `${job.start_time as string}${job.end_time ? ` – ${job.end_time}` : ""}`],
      ["Status", (job.status as string).charAt(0).toUpperCase() + (job.status as string).slice(1)],
    ];

    if (job.location) {
      detailRows.push(["Location", job.location as string]);
    }

    const detailsStart = y;
    detailRows.forEach(([label, value]) => {
      page.drawText(label, { x: 50, y, size: 10, font: boldFont, color: rgb(0.4, 0.4, 0.4) });
      page.drawText(value, { x: 160, y, size: 10, font, color: rgb(0.1, 0.1, 0.1) });
      y += 18;
    });

    y += 8;

    // Linked quote
    const quotes = job.quotes;
    if (quotes && !Array.isArray(quotes)) {
      const q = quotes as { quote_number?: string; total?: number };
      page.drawLine({ start: { x: 50, y }, end: { x: width - 50, y }, thickness: 0.5, color: rgb(0.9, 0.9, 0.9) });
      y += 14;
      page.drawText("Linked Quote", { x: 50, y, size: 11, font: boldFont, color: rgb(0.3, 0.3, 0.3) });
      y += 16;
      page.drawText(`Quote #${q.quote_number ?? "—"}`, { x: 50, y, size: 10, font, color: rgb(0.1, 0.1, 0.1) });
      if (q.total) {
        page.drawText(`Total: £${Number(q.total).toFixed(2)}`, { x: 200, y, size: 10, font, color: rgb(0.1, 0.1, 0.1) });
      }
      y += 18;
    }

    y += 8;

    // Notes
    if (job.notes) {
      page.drawLine({ start: { x: 50, y }, end: { x: width - 50, y }, thickness: 0.5, color: rgb(0.9, 0.9, 0.9) });
      y += 14;
      page.drawText("Notes", { x: 50, y, size: 11, font: boldFont, color: rgb(0.3, 0.3, 0.3) });
      y += 16;
      const noteLines = splitText(job.notes as string, font, 10, width - 100);
      noteLines.forEach((line) => {
        page.drawText(line, { x: 50, y, size: 10, font, color: rgb(0.2, 0.2, 0.2) });
        y += 14;
      });
    }

    // Footer
    y = Math.max(y + 30, 780);
    page.drawLine({ start: { x: 50, y }, end: { x: width - 50, y }, thickness: 1, color: rgb(0.8, 0.8, 0.8) });
    y += 16;
    page.drawText(`Generated on ${new Date().toLocaleDateString()} by ${companyName}`, {
      x: 50, y, size: 9, font, color: rgb(0.6, 0.6, 0.6),
    });

    const pdfBytes = await pdfDoc.save();
    const fileName = `Job_${(job.job_title as string).replace(/\s+/g, "_")}.pdf`;

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

function splitText(text: string, font: any, fontSize: number, maxWidth: number): string[] {
  const lines: string[] = [];
  let current = "";
  for (const char of text) {
    const testLine = current + char;
    const w = font.widthOfTextAtSize(testLine, fontSize);
    if (w > maxWidth && current.length > 0) {
      lines.push(current);
      current = char;
    } else {
      current = testLine;
    }
  }
  if (current) lines.push(current);
  return lines;
}
