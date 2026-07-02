import type { Metadata } from "next";
import Link from "next/link";
import { Breadcrumbs } from "../../components/seo/Breadcrumbs";
import { CTA } from "../../components/seo/CTA";

export const metadata: Metadata = {
  title: "UK Electrician Software | Made for British Electricians | JobStacker",
  description: "UK electrician software with GBP pricing, VAT, UK date formats. Quoting, scheduling and job management built for British electricians.",
  alternates: { canonical: "https://jobstacker.app/uk-electrician-software" },
};

export default function Page() {
  return (
    <section style={{ maxWidth: 800, margin: "0 auto", padding: "40px 20px" }}>
      <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "UK Electrician Software" }]} />
      <h1 style={{ fontSize: 34, fontWeight: 800, lineHeight: 1.15, marginBottom: 12 }}>UK Electrician Software</h1>
      <p style={{ fontSize: 18, color: "var(--text-muted)", lineHeight: 1.7, marginBottom: 32 }}>Electrician software built in the UK for British electricians. GBP, VAT, DD/MM dates, and UK-specific electrical terminology.</p>
      <div style={{ fontSize: 16, color: "var(--text)", lineHeight: 1.8 }}>
        <p style={{ marginBottom: 14 }}>American electrician software uses dollars, MM/DD dates, and terminology that doesn't match UK practice. JobStacker was built in the UK for UK electricians. It handles single-phase and three-phase terminology, EICR references, Part P mentions where relevant, and quotes with proper UK materials and labour breakdowns. The currency is GBP. The dates are DD/MM/YYYY. The tax is VAT. No Americanisms to work around.</p>
      </div>
      <CTA />
    </section>
  );
}
