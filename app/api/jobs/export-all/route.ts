import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { ApiError, errorResponse } from "@/lib/api-error";
import { PLANS, normalizeTier } from "@/lib/stripe";

function fmtICS(d: Date): string {
  return d.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
}

export async function GET(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient(request);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new ApiError(401, "Unauthorized");

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

    const { searchParams } = new URL(request.url);
    const from = searchParams.get("from") ?? "";
    const to = searchParams.get("to") ?? "";

    let query = supabase
      .from("jobs")
      .select("*")
      .eq("user_id", user.id);

    if (from) query = query.gte("job_date", from);
    if (to) query = query.lte("job_date", to);

    const { data: jobs, error } = await query.order("job_date", { ascending: true });
    if (error) throw new ApiError(400, error.message);

    const now = fmtICS(new Date());

    const vevents = (jobs ?? [])
      .filter((job) => job.job_date)
      .map((job) => {
      const dtStart = fmtICS(new Date(`${job.job_date}T${job.start_time || "09:00"}:00`));
      const endTime = job.end_time || job.start_time || "09:00";
      const dtEnd = fmtICS(new Date(`${job.job_date}T${endTime}:00`));
      const uid = `jobstacker-job-${job.id}@jobstacker.app`;
      const lines = [
        "BEGIN:VEVENT",
        `UID:${uid}`,
        `DTSTAMP:${now}`,
        `DTSTART:${dtStart}`,
        `DTEND:${dtEnd}`,
        `SUMMARY:${job.job_title}${job.customer_name ? ` - ${job.customer_name}` : ""}`,
        `DESCRIPTION:Customer: ${job.customer_name || ""}\\nNotes: ${job.notes || ""}`,
        job.location ? `LOCATION:${job.location}` : "",
        "END:VEVENT",
      ].filter(Boolean);
      return lines.join("\r\n");
    });

    const ics = [
      "BEGIN:VCALENDAR",
      "VERSION:2.0",
      "PRODID:-//JobStacker//Job Calendar//EN",
      "CALSCALE:GREGORIAN",
      "METHOD:PUBLISH",
      ...vevents,
      "END:VCALENDAR",
    ].join("\r\n");

    return new NextResponse(ics, {
      headers: {
        "Content-Type": "text/calendar; charset=utf-8",
        "Content-Disposition": `attachment; filename="jobstacker-calendar.ics"`,
      },
    });
  } catch (error) {
    return errorResponse(error);
  }
}
