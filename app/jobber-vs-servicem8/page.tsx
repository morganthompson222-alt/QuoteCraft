import type { Metadata } from "next";
import Link from "next/link";
import { Breadcrumbs } from "../../components/seo/Breadcrumbs";
import { CTA } from "../../components/seo/CTA";

export const metadata: Metadata = {
  title: "Jobber vs ServiceM8 | Trade Software Comparison | JobStacker",
  description: "Jobber vs ServiceM8 comparison for tradespeople. US power vs UK practicality - plus JobStacker as the free UK-built alternative.",
  alternates: { canonical: "https://jobstacker.app/jobber-vs-servicem8" },
};

export default function Page() {
  return (
    <section style={{ maxWidth: 800, margin: "0 auto", padding: "40px 20px" }}>
      <Breadcrumbs items={{{ label: "Home", href: "/" }, {{ label: "Jobber vs ServiceM8" }}}} />
      <h1 style={{ fontSize: 34, fontWeight: 800, lineHeight: 1.15, marginBottom: 12 }}>Jobber vs ServiceM8</h1>
      <p style={{ fontSize: 18, color: "var(--text-muted)", lineHeight: 1.7, marginBottom: 32 }}>Jobber brings US software power. ServiceM8 brings UK practicality. JobStacker brings both - with AI and a free tier.</p>
      <div style={{ fontSize: 16, color: "var(--text)", lineHeight: 1.8 }}>
        <p style={{ marginBottom: 14 }}>Jobber is the most feature-rich trade platform from the US. ServiceM8 is the most established in the UK. Both charge monthly fees. JobStacker combines comprehensive features with UK-specific design — GBP, VAT, UK dates, proper trade terminology — plus AI quoting, a finance hub, and a free tier. Before paying for either, try the free UK-built option.</p>
      </div>
      <CTA />
    </section>
  );
}
