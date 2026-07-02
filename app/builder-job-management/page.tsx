import type { Metadata } from "next";
import Link from "next/link";
import { Breadcrumbs } from "../../components/seo/Breadcrumbs";
import { CTA } from "../../components/seo/CTA";

export const metadata: Metadata = {
  title: "Builder Job Management Software | Construction Tracking | JobStacker",
  description: "Builder job management software for tracking construction projects. Multi-day scheduling, subcontractor tracking, and project financials.",
  alternates: { canonical: "https://jobstacker.app/builder-job-management" },
};

export default function Page() {
  return (
    <section style={{ maxWidth: 800, margin: "0 auto", padding: "40px 20px" }}>
      <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Builder Job Management" }]} />
      <h1 style={{ fontSize: 34, fontWeight: 800, lineHeight: 1.15, marginBottom: 12 }}>Builder Job Management</h1>
      <p style={{ fontSize: 18, color: "var(--text-muted)", lineHeight: 1.7, marginBottom: 32 }}>Track construction projects from initial estimate to final completion. Multi-day scheduling, subcontractor management, and project financials.</p>
      <div style={{ fontSize: 16, color: "var(--text)", lineHeight: 1.8 }}>
        <p style={{ marginBottom: 14 }}>Building projects need more than a simple job tracker. You need multi-day scheduling, subcontractor coordination, material tracking, and stage payment management. JobStacker gives you a calendar view of every project, status tracking for each phase, customer communication history, and financial tracking that shows profitability per project. When you win a new contract, the tools to manage it are already there.</p>
      </div>
      <CTA />
    </section>
  );
}
