import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { ApiError, errorResponse } from "@/lib/api-error";
import { PLANS, normalizeTier } from "@/lib/stripe";

function formatICSDate(dateStr: string, timeStr: string | null): string {
  const [y, m, d] = dateStr.split("-").map(Number);
  if (timeStr) {
    const [hh, mm] = timeStr.split(":").map(Number);
    const dt = new Date(y, m - 1, d, hh, mm);
    return dt.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
  }
  return `${y}${String(m).padStart(2, "0")}${String(d).padStart(2, "0")}T000000Z`;
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

    const { data: profile } = await supabase
      .from("profiles")
      .select("plan_tier")
      .eq("id", user.id)
      .single();

    const tierRaw = (profile as { plan_tier?: string })?.plan_tier ?? "solo";
    const tier = normalizeTier(tierRaw);
    if (!PLANS[tier].calendarExport) {
      throw new ApiError(403, "Export is available on Pro and Unlimited plans", "PLAN_LIMIT_REACHED");
    }

    const { data: job, error } = await supabase
      .from("jobs")
      .select("*")
      .eq("id", id)
      .eq("user_id", user.id)
      .single();

    if (error) throw new ApiError(404, "Job not found");

    const dtStart = formatICSDate(job.job_date, job.start_time);
    const dtEnd = formatICSDate(job.job_date, job.end_time || job.start_time);
    const now = new Date().toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
    const uid = `quotecraft-job-${job.id}@quotecraft.app`;

    const ics = [
      "BEGIN:VCALENDAR",
      "VERSION:2.0",
      "PRODID:-//QuoteCraft//Job Calendar//EN",
      "CALSCALE:GREGORIAN",
      "METHOD:PUBLISH",
      "BEGIN:VEVENT",
      `UID:${uid}`,
      `DTSTAMP:${now}`,
      `DTSTART:${dtStart}`,
      `DTEND:${dtEnd}`,
      `SUMMARY:${job.job_title}`,
      `DESCRIPTION:Customer: ${job.customer_name}\\nNotes: ${job.notes || ""}`,
      job.location ? `LOCATION:${job.location}` : "",
      `X-QUOTECRAFT-JOB-ID:${job.id}`,
      "END:VEVENT",
      "END:VCALENDAR",
    ]
      .filter(Boolean)
      .join("\r\n");

    return new NextResponse(ics, {
      headers: {
        "Content-Type": "text/calendar; charset=utf-8",
        "Content-Disposition": `attachment; filename="job-${job.id}.ics"`,
      },
    });
  } catch (error) {
    return errorResponse(error);
  }
}
