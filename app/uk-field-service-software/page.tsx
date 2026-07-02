import type { Metadata } from "next";
import Link from "next/link";
import { Breadcrumbs } from "../../components/seo/Breadcrumbs";
import { CTA } from "../../components/seo/CTA";

export const metadata: Metadata = {
  title: "UK Field Service Software | British Service App | JobStacker",
  description: "UK field service software for tradespeople. GBP, VAT, UK dates. Quote, schedule, track jobs and invoice - all from one UK-built app.",
  alternates: { canonical: "https://jobstacker.app/uk-field-service-software" },
};

export default function Page() {
  return (
    <section style={{ maxWidth: 800, margin: "0 auto", padding: "40px 20px" }}>
      <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "UK Field Service Software" }]} />
      <h1 style={{ fontSize: 34, fontWeight: 800, lineHeight: 1.15, marginBottom: 12 }}>UK Field Service Software</h1>
      <p style={{ fontSize: 18, color: "var(--text-muted)", lineHeight: 1.7, marginBottom: 32 }}>Field service management software built in the UK. GBP, VAT, UK dates, and proper British trade terminology.</p>
      <div style={{ fontSize: 16, color: "var(--text)", lineHeight: 1.8 }}>
        <p style={{ marginBottom: 14 }}>Field service software from US companies doesn't understand UK pricing, tax, or the way British service businesses operate. JobStacker is UK field service software built for the way British tradespeople work: GBP pricing with proper VAT handling, DD/MM/YYYY dates, UK postcodes for customer addresses, and trade terminology that matches UK standards. Free to start with no contract.</p>
      </div>
      <CTA />
    </section>
  );
}
