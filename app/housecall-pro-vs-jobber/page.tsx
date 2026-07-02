import type { Metadata } from "next";
import Link from "next/link";
import { Breadcrumbs } from "../../components/seo/Breadcrumbs";
import { CTA } from "../../components/seo/CTA";

export const metadata: Metadata = {
  title: "Housecall Pro vs Jobber | Field Service Software | JobStacker",
  description: "Housecall Pro vs Jobber: comparing the two US field service giants. Features, UK suitability, pricing, and a better UK alternative.",
  alternates: { canonical: "https://jobstacker.app/housecall-pro-vs-jobber" },
};

export default function Page() {
  return (
    <section style={{ maxWidth: 800, margin: "0 auto", padding: "40px 20px" }}>
      <Breadcrumbs items={{{ label: "Home", href: "/" }, {{ label: "Housecall Pro vs Jobber" }}}} />
      <h1 style={{ fontSize: 34, fontWeight: 800, lineHeight: 1.15, marginBottom: 12 }}>Housecall Pro vs Jobber</h1>
      <p style={{ fontSize: 18, color: "var(--text-muted)", lineHeight: 1.7, marginBottom: 32 }}>Both are US field service leaders. Here's how they compare for UK tradespeople - and why JobStacker might be the better fit.</p>
      <div style={{ fontSize: 16, color: "var(--text)", lineHeight: 1.8 }}>
        <p style={{ marginBottom: 14 }}>Housecall Pro and Jobber dominate the US field service market. Both are powerful, feature-rich, and expensive. For UK tradespeople, neither handles GBP, VAT, or UK date formats naturally. Both require annual contracts and have no free tier. JobStacker was built in the UK for UK tradespeople. It handles GBP, VAT, and DD/MM dates out of the box. It has AI quoting, a finance hub, a desktop app, and a genuinely free tier. If you're considering importing a US platform, compare it with a UK-built alternative first.</p>
      </div>
      <CTA />
    </section>
  );
}
