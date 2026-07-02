import type { Metadata } from "next";
import Link from "next/link";
import { Breadcrumbs } from "../../components/seo/Breadcrumbs";
import { CTA } from "../../components/seo/CTA";

export const metadata: Metadata = {
  title: "FieldEdge Alternative | Trade Business CRM | JobStacker",
  description: "FieldEdge alternative for tradespeople. JobStacker offers quoting, scheduling and customer management with a free tier and AI features.",
  alternates: { canonical: "https://jobstacker.app/fieldedge-alternative" },
};

export default function Page() {
  return (
    <section style={{ maxWidth: 800, margin: "0 auto", padding: "40px 20px" }}>
      <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "FieldEdge Alternative" }]} />
      <h1 style={{ fontSize: 34, fontWeight: 800, lineHeight: 1.15, marginBottom: 12 }}>FieldEdge Alternative</h1>
      <p style={{ fontSize: 18, color: "var(--text-muted)", lineHeight: 1.7, marginBottom: 32 }}>FieldEdge is a US-centric field service platform. For UK tradespeople, JobStacker offers a better fit with GBP pricing, UK date formats, and a free tier.</p>
      <p style={{ fontSize: 16, color: "var(--text)", lineHeight: 1.8 }}>FieldEdge is popular in the US but doesn't translate well for UK tradespeople — currency, dates, and tax handling aren't optimised for the UK market. JobStacker is built in the UK for UK trades: GBP, VAT, DD/MM/YYYY dates, and proper UK trade terminology out of the box.</p>
      <CTA />
    </section>
  );
}
