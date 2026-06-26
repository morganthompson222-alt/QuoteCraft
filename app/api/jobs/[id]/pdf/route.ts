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
    const pageHeight = page.getHeight();

    const companyName = profile?.company_name ?? "Your Company";
    const profileData = profile as {
      company_name?: string; phone?: string; address?: string;
      city?: string; state?: string; zip?: string;
    } | null;

    let y = pageHeight - 50;

    // Company header
    page.drawText(companyName, { x: 50, y, size: 22, font: boldFont, color: rgb(0.1, 0.1, 0.1) });
    y -= 24;

    if (profileData?.phone) {
      page.drawText(`Phone: ${profileData.phone}`, { x: 50, y, size: 10, font, color: rgb(0.4, 0.4, 0.4) });
      y -= 16;
    }

    const addrParts = [profileData?.address, profileData?.city, profileData?.state, profileData?.zip].filter(Boolean);
    if (addrParts.length > 0) {
      page.drawText(addrParts.join(", "), { x: 50, y, size: 10, font, color: rgb(0.4, 0.4, 0.4) });
      y -= 16;
    }

    if (user?.email) {
      page.drawText(`Email: ${user.email}`, { x: 50, y, size: 10, font, color: rgb(0.4, 0.4, 0.4) });
      y -= 16;
    }

    y -= 16;

    // Divider
    page.drawLine({ start: { x: 50, y }, end: { x: width - 50, y }, thickness: 1, color: rgb(0.8, 0.8, 0.8) });
    y -= 20;

    // Title
    page.drawText("JOB SHEET", { x: 50, y, size: 18, font: boldFont, color: rgb(0.12, 0.42, 0.31) });
    y -= 14;
    const jobTitle = (job.job_title as string) || "";
    page.drawText(jobTitle.length > 50 ? jobTitle.slice(0, 47) + "..." : jobTitle, { x: 50, y, size: 14, font: boldFont, color: rgb(0.1, 0.1, 0.1) });
    y -= 24;

    // Job details
    const customerName = (job.customer_name as string) || "—";
    const details: [string, string][] = [
      ["Customer", customerName.length > 40 ? customerName.slice(0, 37) + "..." : customerName],
      ["Date", job.job_date as string],
      ["Time", `${job.start_time as string}${job.end_time ? ` – ${job.end_time}` : ""}`],
      ["Status", (job.status as string).charAt(0).toUpperCase() + (job.status as string).slice(1)],
    ];
    if (job.location) details.push(["Location", job.location as string]);

    details.forEach(([label, value]) => {
      page.drawText(label, { x: 50, y, size: 10, font: boldFont, color: rgb(0.4, 0.4, 0.4) });
      page.drawText(value, { x: 160, y, size: 10, font, color: rgb(0.1, 0.1, 0.1) });
      y -= 20;
    });

    y -= 8;

    // Linked quote
    let linkedQuote = null;
    if (Array.isArray(job.quotes) && job.quotes.length > 0) {
      linkedQuote = job.quotes[0];
    } else if (job.quotes && !Array.isArray(job.quotes)) {
      linkedQuote = job.quotes;
    }

    if (linkedQuote) {
      const q = linkedQuote as { quote_number?: string; total?: number };
      page.drawLine({ start: { x: 50, y }, end: { x: width - 50, y }, thickness: 0.5, color: rgb(0.9, 0.9, 0.9) });
      y -= 16;
      page.drawText("Linked Quote", { x: 50, y, size: 11, font: boldFont, color: rgb(0.3, 0.3, 0.3) });
      y -= 18;
      page.drawText(`Quote #${q.quote_number ?? "—"}`, { x: 50, y, size: 10, font, color: rgb(0.1, 0.1, 0.1) });
      if (q.total) {
        const totalText = `Total: ${new Intl.NumberFormat("en", { style: "currency", currency: "GBP" }).format(q.total)}`;
        page.drawText(totalText, { x: 200, y, size: 10, font, color: rgb(0.1, 0.1, 0.1) });
      }
      y -= 20;
    }

    y -= 8;

    // Notes
    if (job.notes) {
      page.drawLine({ start: { x: 50, y }, end: { x: width - 50, y }, thickness: 0.5, color: rgb(0.9, 0.9, 0.9) });
      y -= 16;
      page.drawText("Notes", { x: 50, y, size: 11, font: boldFont, color: rgb(0.3, 0.3, 0.3) });
      y -= 18;
      const noteLines = splitText(job.notes as string, font, 10, width - 100, 20);
      noteLines.forEach((line) => {
        if (y < 60) return; // skip lines that would overflow bottom
        page.drawText(line, { x: 50, y, size: 10, font, color: rgb(0.2, 0.2, 0.2) });
        y -= 16;
      });
    }

    // Footer
    y = Math.min(y - 30, pageHeight - 80);
    page.drawLine({ start: { x: 50, y }, end: { x: width - 50, y }, thickness: 1, color: rgb(0.8, 0.8, 0.8) });
    y -= 18;
    page.drawText(`Generated on ${new Intl.DateTimeFormat("en-GB", { day: "2-digit", month: "short", year: "numeric" }).format(new Date())} by ${companyName}`, {
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

function splitText(text: string, font: any, fontSize: number, maxWidth: number, maxLines: number): string[] {
  const lines: string[] = [];
  let current = "";
  for (const char of text) {
    const testLine = current + char;
    const w = font.widthOfTextAtSize ? font.widthOfTextAtSize(testLine, fontSize) : testLine.length * fontSize * 0.5;
    if (w > maxWidth && current.length > 0) {
      lines.push(current);
      if (lines.length >= maxLines) return lines;
      current = char;
    } else {
      current = testLine;
    }
  }
  if (current) lines.push(current);
  return lines;
}
