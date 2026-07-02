import type { Metadata } from "next";
import Link from "next/link";
import { Breadcrumbs } from "../../components/seo/Breadcrumbs";
import { CTA } from "../../components/seo/CTA";

export const metadata: Metadata = {
  title: "Workiz Alternative | Trade Management Software | JobStacker",
  description: "Workiz alternative for UK tradespeople. JobStacker offers quoting, scheduling and CRM with UK-specific features and a free tier.",
  alternates: { canonical: "https://jobstacker.app/workiz-alternative" },
};

export default function Page() {
  return (
    <section style={{ maxWidth: 800, margin: "0 auto", padding: "40px 20px" }}>
      <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Workiz Alternative" }]} />
      <h1 style={{ fontSize: 34, fontWeight: 800, lineHeight: 1.15, marginBottom: 12 }}>Workiz Alternative</h1>
      <p style={{ fontSize: 18, color: "var(--text-muted)", lineHeight: 1.7, marginBottom: 32 }}>Workiz is a capable US-based platform. JobStacker provides the same core features — quoting, scheduling, customer management — but built specifically for UK tradespeople with GBP and UK date formats.</p>
      <p style={{ fontSize: 16, color: "var(--text)", lineHeight: 1.8 }}>Workiz covers the basics well but isn't optimised for UK tradespeople. JobStacker includes UK-specific features: GBP pricing with VAT, DD/MM/YYYY dates, and trade terminology that matches how UK electricians, plumbers, and builders actually work. Plus a free tier to start.</p>
      <CTA />
    </section>
  );
}
