import type { Metadata } from "next";
import Link from "next/link";
import { Breadcrumbs } from "../../components/seo/Breadcrumbs";
import { CTA } from "../../components/seo/CTA";

export const metadata: Metadata = {
  title: "Builder Quote Software | Construction Estimates | JobStacker",
  description: "Builder quote software for construction estimates with materials, labour and subcontractors. Create professional quotes and win more contracts.",
  alternates: { canonical: "https://jobstacker.app/builder-quote-software" },
};

export default function Page() {
  return (
    <section style={{ maxWidth: 800, margin: "0 auto", padding: "40px 20px" }}>
      <Breadcrumbs items={{{ label: "Home", href: "/" }, {{ label: "Builder Quote Software" }}}} />
      <h1 style={{ fontSize: 34, fontWeight: 800, lineHeight: 1.15, marginBottom: 12 }}>Builder Quote Software</h1>
      <p style={{ fontSize: 18, color: "var(--text-muted)", lineHeight: 1.7, marginBottom: 32 }}>Create detailed construction quotes with materials, labour costs, subcontractors and contingencies. Professional PDFs that win contracts.</p>
      <div style={{ fontSize: 16, color: "var(--text)", lineHeight: 1.8 }}>
        <p style={{ marginBottom: 14 }}>Building quotes are complex. You need to account for materials (timber, blocks, cement, fixings), labour across multiple trades, subcontractor costs, plant hire, waste disposal, and a contingency for unexpected issues. JobStacker handles multi-line quotes with real-time totals, tax calculations, and PDF export with your company branding. You can break down quotes by project phase - foundations, structure, roofing, finishing - so the customer understands every cost. Send the quote as a share link and track when the customer opens it.</p>
      </div>
      <CTA />
    </section>
  );
}
