import type { Metadata } from "next";
import Link from "next/link";
import { Breadcrumbs } from "../../components/seo/Breadcrumbs";
import { CTA } from "../../components/seo/CTA";

export const metadata: Metadata = {
  title: "UK Trade CRM | Built for British Tradespeople | JobStacker",
  description: "UK trade CRM software built for British tradespeople. GBP pricing, VAT handling, UK date formats. Free to start, no contracts.",
  alternates: { canonical: "https://jobstacker.app/uk-trade-crm" },
};

export default function Page() {
  return (
    <section style={{ maxWidth: 800, margin: "0 auto", padding: "40px 20px" }}>
      <Breadcrumbs items={{{ label: "Home", href: "/" }, {{ label: "UK Trade CRM" }}}} />
      <h1 style={{ fontSize: 34, fontWeight: 800, lineHeight: 1.15, marginBottom: 12 }}>UK Trade CRM</h1>
      <p style={{ fontSize: 18, color: "var(--text-muted)", lineHeight: 1.7, marginBottom: 32 }}>A CRM built in the UK for UK tradespeople — GBP, VAT, DD/MM/YYYY dates, and proper UK trade terminology out of the box.</p>
      <div style={{ fontSize: 16, color: "var(--text)", lineHeight: 1.8 }}>
        <p style={{ marginBottom: 14 }}>Most CRM software is built in America for American businesses. That means dollars, MM/DD dates, and terminology that doesn't match how UK tradespeople work. JobStacker is a UK trade CRM built from the ground up for British electricians, plumbers, builders, roofers, and every other trade. It handles GBP pricing, VAT automatically, DD/MM/YYYY dates, and uses UK trade terminology across the entire app. No configuration required - it just works the way you expect.</p>
      </div>
      <CTA />
    </section>
  );
}
