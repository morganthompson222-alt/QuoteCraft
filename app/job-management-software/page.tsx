import type { Metadata } from "next";
import Link from "next/link";
import { Breadcrumbs } from "../../components/seo/Breadcrumbs";
import { FAQ } from "../../components/seo/FAQ";
import { CTA } from "../../components/seo/CTA";

export const metadata: Metadata = {
  title: "Job Management Software for Tradespeople | JobStacker",
  description:
    "JobStacker job management software helps tradespeople track jobs from quote to completion. Schedule work, manage customers, and stay organised. Free to start.",
  alternates: { canonical: "https://jobstacker.app/job-management-software" },
};

export default function Page() {
  return (
    <section style={{ maxWidth: 800, margin: "0 auto", padding: "40px 20px" }}>
      <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Job Management Software" }]} />
      <h1 style={{ fontSize: 36, fontWeight: 800, lineHeight: 1.15, marginBottom: 16 }}>Job Management Software for Tradespeople</h1>
      <p style={{ fontSize: 18, color: "var(--text-muted)", lineHeight: 1.7, marginBottom: 32 }}>
        From first customer enquiry to final payment — JobStacker tracks every job through every stage. Know what's booked, what's in progress, and what's complete.
      </p>
      <h2>Never lose track of a job again</h2>
      <p>When you're juggling multiple customers and job sites, it's easy to forget who wanted what done and when. JobStacker gives you a complete view of every job — its status, schedule, customer details, and financials — all in one place.</p>
      <h2>Key features</h2>
      <ul style={{ lineHeight: 2, paddingLeft: 20 }}>
        <li><strong>Full job lifecycle</strong> — from quote → accepted → scheduled → completed → paid.</li>
        <li><strong>Status tracking</strong> — see at a glance which jobs are in progress, completed, or overdue.</li>
        <li><strong>Customer history</strong> — every job linked to the customer, with full quote and payment history.</li>
        <li><strong>Calendar integration</strong> — accepted quotes become scheduled jobs automatically.</li>
        <li><strong>Export and PDF</strong> — download job details, schedules, and export to your phone calendar.</li>
      </ul>
      <div style={{ marginTop: 32 }}>Explore: <Link href="/quote-software">Quote software</Link> | <Link href="/invoice-software">Invoice software</Link> | <Link href="/scheduling-software">Scheduling software</Link></div>
      <FAQ items={[
        { q: "Can I update job status from the calendar?", a: "Yes. Click any job in the calendar view to update its status without leaving the page." },
        { q: "Can I see all my jobs at once?", a: "Yes. The Jobs page lists every job with its status, customer, and scheduled date." },
        { q: "Can I export jobs to my phone calendar?", a: "Yes. Export individual jobs as .ics files for Apple Calendar or Google Calendar." },
      ]} />
      <CTA />
    </section>
  );
}
