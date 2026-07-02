import type { Metadata } from "next";
import Link from "next/link";
import { Breadcrumbs } from "../../components/seo/Breadcrumbs";
import { CTA } from "../../components/seo/CTA";

export const metadata: Metadata = {
  title: "Electrician Scheduling Software | Job Calendar | JobStacker",
  description: "Electrician scheduling software with calendar view, job status tracking and calendar export. Schedule jobs automatically from accepted quotes.",
  alternates: { canonical: "https://jobstacker.app/electrician-scheduling-software" },
};

export default function Page() {
  return (
    <section style={{ maxWidth: 800, margin: "0 auto", padding: "40px 20px" }}>
      <Breadcrumbs items={{{ label: "Home", href: "/" }, {{ label: "Electrician Scheduling Software" }}}} />
      <h1 style={{ fontSize: 34, fontWeight: 800, lineHeight: 1.15, marginBottom: 12 }}>Electrician Scheduling Software</h1>
      <p style={{ fontSize: 18, color: "var(--text-muted)", lineHeight: 1.7, marginBottom: 32 }}>Schedule electrical work without double-booking. Calendar view, auto-scheduling from accepted quotes, and calendar export.</p>
      <div style={{ fontSize: 16, color: "var(--text)", lineHeight: 1.8 }}>
        <p style={{ marginBottom: 14 }}>When a customer accepts your electrical quote, the job should appear on your calendar automatically - no manual entry, no risk of forgetting. JobStacker does exactly that. See your week at a glance with colour-coded job entries. Export individual jobs as .ics files for Apple Calendar or Google Calendar. Reschedule easily when plans change. Never double-book or miss an appointment again.</p>
      </div>
      <CTA />
    </section>
  );
}
