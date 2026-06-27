import type { Metadata } from "next";
import Link from "next/link";
import { Breadcrumbs } from "../../components/seo/Breadcrumbs";
import { FAQ } from "../../components/seo/FAQ";
import { CTA } from "../../components/seo/CTA";

export const metadata: Metadata = {
  title: "Scheduling Software for Tradespeople | Job Calendar | JobStacker",
  description:
    "JobStacker scheduling software helps tradespeople plan jobs, avoid double-booking, and keep customers informed. Calendar view, job tracking, and calendar export.",
  alternates: { canonical: "https://jobstacker.app/scheduling-software" },
};

export default function Page() {
  return (
    <section style={{ maxWidth: 800, margin: "0 auto", padding: "40px 20px" }}>
      <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Scheduling Software" }]} />
      <h1 style={{ fontSize: 36, fontWeight: 800, lineHeight: 1.15, marginBottom: 16 }}>Scheduling Software for Tradespeople</h1>
      <p style={{ fontSize: 18, color: "var(--text-muted)", lineHeight: 1.7, marginBottom: 32 }}>
        Stop double-booking and missed appointments. JobStacker's scheduling software automatically creates jobs from accepted quotes and shows your entire week on one calendar.
      </p>
      <h2>Scheduling done right</h2>
      <p>When a customer accepts your quote, the job appears on your calendar automatically — no manual entry needed. See your week at a glance, reschedule with drag-and-drop (coming soon), and never miss an appointment.</p>
      <h2>Key features</h2>
      <ul style={{ lineHeight: 2, paddingLeft: 20 }}>
        <li><strong>Auto-scheduling</strong> — accepted quotes create calendar entries automatically.</li>
        <li><strong>Monthly calendar</strong> — colour-coded jobs, upcoming work, and completed jobs.</li>
        <li><strong>Job status</strong> — mark jobs complete directly from the calendar.</li>
        <li><strong>Calendar export</strong> — export jobs to Apple Calendar or Google Calendar.</li>
        <li><strong>Multi-day jobs</strong> — schedule projects that span multiple days.</li>
      </ul>
      <div style={{ marginTop: 32 }}>Related: <Link href="/job-management-software">Job management</Link> | <Link href="/crm-software">CRM</Link> | <Link href="/quote-software">Quote software</Link></div>
      <FAQ items={[
        { q: "Can I see all my jobs for the month?", a: "Yes. The calendar view shows your entire month with colour-coded job entries." },
        { q: "Can I set job times?", a: "Yes. When scheduling a job, set the start time and end time." },
        { q: "Can I schedule recurring jobs?", a: "Yes. You can set up recurring jobs for regular maintenance or ongoing work." },
      ]} />
      <CTA />
    </section>
  );
}
