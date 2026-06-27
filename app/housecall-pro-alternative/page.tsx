import type { Metadata } from "next";
import Link from "next/link";
import { Breadcrumbs } from "../../components/seo/Breadcrumbs";
import { FAQ } from "../../components/seo/FAQ";
import { CTA } from "../../components/seo/CTA";

export const metadata: Metadata = {
  title: "Housecall Pro Alternative | UK Trade Software | JobStacker",
  description:
    "Looking for a Housecall Pro alternative? JobStacker is built for UK tradespeople with quoting, scheduling and payment tracking. Free to start.",
  alternates: { canonical: "https://jobstacker.app/housecall-pro-alternative" },
};

function ComparisonRow({ feature, them, us }: { feature: string; them: string; us: string }) {
  return (
    <tr style={{ background: "var(--surface)" }}>
      <td style={{ padding: "10px 12px", borderBottom: "1px solid var(--border)" }}>{feature}</td>
      <td style={{ padding: "10px 12px", textAlign: "center", borderBottom: "1px solid var(--border)" }}>{them}</td>
      <td style={{ padding: "10px 12px", textAlign: "center", borderBottom: "1px solid var(--border)", color: "var(--brand)", fontWeight: 600 }}>{us}</td>
    </tr>
  );
}

export default function Page() {
  return (
    <section style={{ maxWidth: 800, margin: "0 auto", padding: "40px 20px" }}>
      <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "JobStacker vs Housecall Pro" }]} />
      <h1 style={{ fontSize: 36, fontWeight: 800, lineHeight: 1.15, marginBottom: 16 }}>JobStacker vs Housecall Pro</h1>
      <p style={{ fontSize: 18, color: "var(--text-muted)", lineHeight: 1.7, marginBottom: 32 }}>
        Looking for a Housecall Pro alternative? JobStacker was built for UK tradespeople from the ground up — with the features you need at a price that makes sense.
      </p>
      <p>Housecall Pro is a US-centric platform that doesn't always translate well for UK tradespeople. Currency, date formats, and tax handling can be awkward. JobStacker is built in the UK for UK trades — GBP, DD/MM/YYYY, and proper VAT handling out of the box.</p>
      <h2>Feature comparison</h2>
      <table style={{ width: "100%", borderCollapse: "collapse", marginBottom: 32 }}>
        <thead>
          <tr style={{ background: "var(--surface-muted)" }}>
            <th style={{ padding: 12, textAlign: "left", borderBottom: "1px solid var(--border)" }}>Feature</th>
            <th style={{ padding: 12, textAlign: "center", borderBottom: "1px solid var(--border)" }}>Housecall Pro</th>
            <th style={{ padding: 12, textAlign: "center", borderBottom: "1px solid var(--border)", color: "var(--brand)" }}>JobStacker</th>
          </tr>
        </thead>
        <tbody>
          <ComparisonRow feature="Customer management" them="✓" us="✓" />
          <ComparisonRow feature="Professional quoting" them="✓" us="✓" />
          <ComparisonRow feature="Job scheduling" them="✓" us="✓" />
          <ComparisonRow feature="UK GBP & VAT" them="Limited" us="✓" />
          <ComparisonRow feature="AI quote generation" them="✗" us="✓" />
          <ComparisonRow feature="Free to start" them="✗" us="✓" />
          <ComparisonRow feature="UK date formats" them="✗" us="✓" />
          <ComparisonRow feature="Desktop app" them="✗" us="✓" />
        </tbody>
      </table>
      <FAQ items={[
        { q: "Is JobStacker available in the UK?", a: "Yes. JobStacker is built in the UK for UK tradespeople. GBP pricing, UK date formats, and proper VAT handling." },
        { q: "Can I import customers from Housecall Pro?", a: "Not automatically yet. You can add customers directly in JobStacker." },
        { q: "What does JobStacker cost?", a: "JobStacker is free to start with no credit card. Paid plans unlock advanced features like AI quoting." },
      ]} />
      <CTA />
    </section>
  );
}
