import type { Metadata } from "next";
import Link from "next/link";
import { Breadcrumbs } from "../../components/seo/Breadcrumbs";
import { CTA } from "../../components/seo/CTA";

export const metadata: Metadata = {
  title: "UK Plumber Software | British Plumbing App | JobStacker",
  description: "UK plumber software with GBP, VAT and UK date formats. Quote, schedule and invoice - built for British plumbers. Free to start.",
  alternates: { canonical: "https://jobstacker.app/uk-plumber-software" },
};

export default function Page() {
  return (
    <section style={{ maxWidth: 800, margin: "0 auto", padding: "40px 20px" }}>
      <Breadcrumbs items={{{ label: "Home", href: "/" }, {{ label: "UK Plumber Software" }}}} />
      <h1 style={{ fontSize: 34, fontWeight: 800, lineHeight: 1.15, marginBottom: 12 }}>UK Plumber Software</h1>
      <p style={{ fontSize: 18, color: "var(--text-muted)", lineHeight: 1.7, marginBottom: 32 }}>Plumber software built in the UK for British plumbers. GBP pricing, VAT, UK date formats, and plumbing-specific features.</p>
      <div style={{ fontSize: 16, color: "var(--text)", lineHeight: 1.8 }}>
        <p style={{ marginBottom: 14 }}>UK plumbing comes with UK-specific terminology, regulations, and pricing. JobStacker handles all of it: Gas Safe register references, WRAS compliance notes where relevant, boiler make and model tracking, and proper UK parts pricing. No American terms, no dollar signs, no imperial measurements that don't match. Built by UK tradespeople for UK tradespeople.</p>
      </div>
      <CTA />
    </section>
  );
}
