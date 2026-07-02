import type { Metadata } from "next";
import Link from "next/link";
import { Breadcrumbs } from "../../components/seo/Breadcrumbs";
import { CTA } from "../../components/seo/CTA";

export const metadata: Metadata = {
  title: "UK Builder Software | British Construction App | JobStacker",
  description: "UK builder software with UK measurements, GBP pricing and VAT. Quote, schedule and manage construction projects. Free to start.",
  alternates: { canonical: "https://jobstacker.app/uk-builder-software" },
};

export default function Page() {
  return (
    <section style={{ maxWidth: 800, margin: "0 auto", padding: "40px 20px" }}>
      <Breadcrumbs items={{{ label: "Home", href: "/" }, {{ label: "UK Builder Software" }}}} />
      <h1 style={{ fontSize: 34, fontWeight: 800, lineHeight: 1.15, marginBottom: 12 }}>UK Builder Software</h1>
      <p style={{ fontSize: 18, color: "var(--text-muted)", lineHeight: 1.7, marginBottom: 32 }}>Builder software built for UK construction. GBP, VAT, metric measurements, and proper UK building terminology.</p>
      <div style={{ fontSize: 16, color: "var(--text)", lineHeight: 1.8 }}>
        <p style={{ marginBottom: 14 }}>Construction software from outside the UK rarely handles the terminology, measurements, and regulations that UK builders work with daily. JobStacker uses metric measurements, GBP pricing with VAT, DD/MM dates, and UK construction terminology across the entire app. Whether you're quoting for an extension, a loft conversion, or a new build, the software speaks your language.</p>
      </div>
      <CTA />
    </section>
  );
}
