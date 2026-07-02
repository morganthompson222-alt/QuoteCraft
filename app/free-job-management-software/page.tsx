import type { Metadata } from "next";
import Link from "next/link";
import { Breadcrumbs } from "../../components/seo/Breadcrumbs";
import { CTA } from "../../components/seo/CTA";

export const metadata: Metadata = {
  title: "Free Job Management Software | JobStacker",
  description: "Free job management software for tradespeople. Track jobs, schedule work and manage customers at no cost. No credit card required.",
  alternates: { canonical: "https://jobstacker.app/free-job-management-software" },
};

export default function Page() {
  return (
    <section style={{ maxWidth: 800, margin: "0 auto", padding: "40px 20px" }}>
      <Breadcrumbs items={{{ label: "Home", href: "/" }, {{ label: "Free Job Management Software" }}}} />
      <h1 style={{ fontSize: 34, fontWeight: 800, lineHeight: 1.15, marginBottom: 12 }}>Free Job Management Software</h1>
      <p style={{ fontSize: 18, color: "var(--text-muted)", lineHeight: 1.7, marginBottom: 32 }}>Job management software doesn't have to cost money. JobStacker's free tier includes job tracking, scheduling, and customer management - with no time limit.</p>
      <div style={{ fontSize: 16, color: "var(--text)", lineHeight: 1.8 }}>
        <p style={{ marginBottom: 14 }}>Job management software helps you track every job from the first customer enquiry to the final invoice. Most options charge a monthly subscription before you can even test whether they work for your business. JobStacker's free tier gives you the full job management experience: track job statuses (scheduled, in progress, completed), view your work on a calendar, link jobs to quotes and customers, mark jobs as paid, and generate receipts. Free means free - no trial, no credit card, no automatic billing.</p>
      </div>
      <CTA />
    </section>
  );
}
