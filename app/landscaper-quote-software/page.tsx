import type { Metadata } from "next";
import Link from "next/link";
import { Breadcrumbs } from "../../components/seo/Breadcrumbs";
import { CTA } from "../../components/seo/CTA";

export const metadata: Metadata = {
  title: "Landscaper Quote Software | Garden Project Quotes | JobStacker",
  description: "Landscaper quote software for garden projects. Itemise materials, plants, labour and hire costs. Professional PDFs that win garden design work.",
  alternates: { canonical: "https://jobstacker.app/landscaper-quote-software" },
};

export default function Page() {
  return (
    <section style={{ maxWidth: 800, margin: "0 auto", padding: "40px 20px" }}>
      <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Landscaper Quote Software" }]} />
      <h1 style={{ fontSize: 34, fontWeight: 800, lineHeight: 1.15, marginBottom: 12 }}>Landscaper Quote Software</h1>
      <p style={{ fontSize: 18, color: "var(--text-muted)", lineHeight: 1.7, marginBottom: 32 }}>Create detailed landscape quotes with materials, plants, labour, plant hire and waste removal. Win more garden projects with professional quotes.</p>
      <div style={{ fontSize: 16, color: "var(--text)", lineHeight: 1.8 }}>
        <p style={{ marginBottom: 14 }}>Landscaping quotes are unique every time. Different materials, different plants, different site conditions, different seasons. JobStacker lets you itemise everything: paving slabs, gravel, topsoil, plants, turf, labour, plant hire, waste disposal. The quote total updates in real time as you add items. Send a professional PDF or share link, and when the customer accepts, the project lands on your calendar. No spreadsheets, no re-typing.</p>
      </div>
      <CTA />
    </section>
  );
}
