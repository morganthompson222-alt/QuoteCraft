import type { Metadata } from "next";
import Link from "next/link";
import { Breadcrumbs } from "../../components/seo/Breadcrumbs";
import { CTA } from "../../components/seo/CTA";

export const metadata: Metadata = {
  title: "UK Contractor Software | British Trade App | JobStacker",
  description: "UK contractor software for general builders and tradespeople. GBP, VAT, UK dates. Quote, schedule and manage projects. Free tier.",
  alternates: { canonical: "https://jobstacker.app/uk-contractor-software" },
};

export default function Page() {
  return (
    <section style={{ maxWidth: 800, margin: "0 auto", padding: "40px 20px" }}>
      <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "UK Contractor Software" }]} />
      <h1 style={{ fontSize: 34, fontWeight: 800, lineHeight: 1.15, marginBottom: 12 }}>UK Contractor Software</h1>
      <p style={{ fontSize: 18, color: "var(--text-muted)", lineHeight: 1.7, marginBottom: 32 }}>General contractor software built in the UK. GBP pricing, VAT, metric measurements, and proper UK trade terminology.</p>
      <div style={{ fontSize: 16, color: "var(--text)", lineHeight: 1.8 }}>
        <p style={{ marginBottom: 14 }}>UK general contractors need software that handles the full range of domestic and commercial work, with proper UK pricing, tax handling, and date formats. JobStacker was built in the UK for exactly this. It handles everything from a small domestic job to a multi-site commercial project, all with GBP, VAT, DD/MM dates, and UK terminology throughout.</p>
      </div>
      <CTA />
    </section>
  );
}
