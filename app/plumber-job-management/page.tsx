import type { Metadata } from "next";
import Link from "next/link";
import { Breadcrumbs } from "../../components/seo/Breadcrumbs";
import { CTA } from "../../components/seo/CTA";

export const metadata: Metadata = {
  title: "Plumber Job Management Software | Job Tracker | JobStacker",
  description: "Plumber job management software for tracking jobs from quote to payment. Calendar scheduling, customer history, and invoice tracking.",
  alternates: { canonical: "https://jobstacker.app/plumber-job-management" },
};

export default function Page() {
  return (
    <section style={{ maxWidth: 800, margin: "0 auto", padding: "40px 20px" }}>
      <Breadcrumbs items={{{ label: "Home", href: "/" }, {{ label: "Plumber Job Management" }}}} />
      <h1 style={{ fontSize: 34, fontWeight: 800, lineHeight: 1.15, marginBottom: 12 }}>Plumber Job Management</h1>
      <p style={{ fontSize: 18, color: "var(--text-muted)", lineHeight: 1.7, marginBottom: 32 }}>Track every plumbing job — emergency call-outs, boiler services, bathroom installations — from first enquiry to final payment.</p>
      <div style={{ fontSize: 16, color: "var(--text)", lineHeight: 1.8 }}>
        <p style={{ marginBottom: 14 }}>Plumbing jobs range from 30-minute emergencies to two-week bathroom installations. JobStacker handles both. For emergencies, create a quick quote and schedule the job in seconds. For installations, track the project across multiple days with detailed notes and customer communication. Every job links back to the customer record with full history.</p>
      </div>
      <CTA />
    </section>
  );
}
