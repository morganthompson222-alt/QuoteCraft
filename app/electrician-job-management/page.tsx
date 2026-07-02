import type { Metadata } from "next";
import Link from "next/link";
import { Breadcrumbs } from "../../components/seo/Breadcrumbs";
import { CTA } from "../../components/seo/CTA";

export const metadata: Metadata = {
  title: "Electrician Job Management | Job Tracker | JobStacker",
  description: "Electrician job management software. Track every job from quote to completion. Calendar scheduling, status tracking, and customer history.",
  alternates: { canonical: "https://jobstacker.app/electrician-job-management" },
};

export default function Page() {
  return (
    <section style={{ maxWidth: 800, margin: "0 auto", padding: "40px 20px" }}>
      <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Electrician Job Management" }]} />
      <h1 style={{ fontSize: 34, fontWeight: 800, lineHeight: 1.15, marginBottom: 12 }}>Electrician Job Management</h1>
      <p style={{ fontSize: 18, color: "var(--text-muted)", lineHeight: 1.7, marginBottom: 32 }}>Track every electrical job through every stage — from initial quote to final payment. Calendar view, status tracking, and full customer history.</p>
      <div style={{ fontSize: 16, color: "var(--text)", lineHeight: 1.8 }}>
        <p style={{ marginBottom: 14 }}>Managing multiple electrical jobs across different sites is the hardest part of running an electrical business. JobStacker gives you one view of every job — its status, its schedule, the customer details, and the financials. Accept a quote and the job lands on your calendar. Complete it and mark it paid. Every step is tracked and connected.</p>
      </div>
      <CTA />
    </section>
  );
}
