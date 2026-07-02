import type { Metadata } from "next";
import Link from "next/link";
import { Breadcrumbs } from "../../components/seo/Breadcrumbs";
import { CTA } from "../../components/seo/CTA";

export const metadata: Metadata = {
  title: "Best CRM for Builders | Construction CRM | JobStacker",
  description: "The best CRM for builders and construction companies. JobStacker offers project quoting, multi-day scheduling and customer management. Free to start.",
  alternates: { canonical: "https://jobstacker.app/best-crm-for-builders" },
};

export default function Page() {
  return (
    <section style={{ maxWidth: 800, margin: "0 auto", padding: "40px 20px" }}>
      <Breadcrumbs items={{{ label: "Home", href: "/" }, {{ label: "Best CRM for Builders" }}}} />
      <h1 style={{ fontSize: 34, fontWeight: 800, lineHeight: 1.15, marginBottom: 12 }}>Best CRM for Builders</h1>
      <p style={{ fontSize: 18, color: "var(--text-muted)", lineHeight: 1.7, marginBottom: 32 }}>Building projects need CRM software that handles complex quotes, multi-day scheduling, material estimates, and subcontractor coordination.</p>
      <div style={{ fontSize: 16, color: "var(--text)", lineHeight: 1.8 }}>
        <p style={{ marginBottom: 14 }}>Builders need more from their CRM than most trades. Projects span weeks or months, involve multiple stages, and require detailed quotes with materials, labour, subcontractors, and contingencies. JobStacker supports project-based quoting with itemised breakdowns, multi-day scheduling with start and end dates, payment tracking for deposits and stage payments, and PDF exports for every estimate. BigChange offers more but at enterprise prices with contracts. Powered Now covers basic quoting but lacks the depth builders need. JobStacker hits the sweet spot - powerful enough for construction projects, simple enough for sole traders, and free to start.</p>
      </div>
      <CTA />
    </section>
  );
}
