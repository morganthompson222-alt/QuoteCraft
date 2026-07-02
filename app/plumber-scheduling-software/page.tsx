import type { Metadata } from "next";
import Link from "next/link";
import { Breadcrumbs } from "../../components/seo/Breadcrumbs";
import { CTA } from "../../components/seo/CTA";

export const metadata: Metadata = {
  title: "Plumber Scheduling Software | Calendar for Plumbers | JobStacker",
  description: "Plumber scheduling software with calendar view and automatic job creation from accepted quotes. Export to your phone calendar.",
  alternates: { canonical: "https://jobstacker.app/plumber-scheduling-software" },
};

export default function Page() {
  return (
    <section style={{ maxWidth: 800, margin: "0 auto", padding: "40px 20px" }}>
      <Breadcrumbs items={{{ label: "Home", href: "/" }, {{ label: "Plumber Scheduling Software" }}}} />
      <h1 style={{ fontSize: 34, fontWeight: 800, lineHeight: 1.15, marginBottom: 12 }}>Plumber Scheduling Software</h1>
      <p style={{ fontSize: 18, color: "var(--text-muted)", lineHeight: 1.7, marginBottom: 32 }}>Schedule plumbing jobs without the paper diary. Auto-scheduling from accepted quotes, calendar export, and flexible rescheduling.</p>
      <div style={{ fontSize: 16, color: "var(--text)", lineHeight: 1.8 }}>
        <p style={{ marginBottom: 14 }}>Plumbers deal with emergency call-outs, planned work, and everything in between. A paper diary doesn't cut it when you're on site and need to check tomorrow's schedule. JobStacker gives you a digital calendar with every job, its status, the customer details, and the job time. Accepted quotes become calendar entries automatically. Export to your phone calendar so you always know where you're meant to be.</p>
      </div>
      <CTA />
    </section>
  );
}
