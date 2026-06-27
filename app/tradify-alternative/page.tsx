import type { Metadata } from "next";
import Link from "next/link";
import { Breadcrumbs } from "../../components/seo/Breadcrumbs";
import { FAQ } from "../../components/seo/FAQ";
import { CTA } from "../../components/seo/CTA";

export const metadata: Metadata = {
  title: "Tradify Alternative | UK Trade Management Software | JobStacker",
  description:
    "Looking for a Tradify alternative? JobStacker provides quoting, job management and invoicing for UK tradespeople. Simpler setup, no long contracts.",
  alternates: { canonical: "https://jobstacker.app/tradify-alternative" },
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
      <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "JobStacker vs Tradify" }]} />
      <h1 style={{ fontSize: 36, fontWeight: 800, lineHeight: 1.15, marginBottom: 16 }}>JobStacker vs Tradify</h1>
      <p style={{ fontSize: 18, color: "var(--text-muted)", lineHeight: 1.7, marginBottom: 32 }}>
        Looking for a Tradify alternative? JobStacker offers the quoting, scheduling, and invoicing features you need — with AI-powered quoting and a free plan to start.
      </p>
      <p>Tradify is popular among UK tradespeople, but many find the pricing steep for what you get. JobStacker covers the same core features — customer management, quoting, job scheduling, invoicing — plus AI-powered quote generation, all with a simpler pricing model.</p>
      <h2>Feature comparison</h2>
      <table style={{ width: "100%", borderCollapse: "collapse", marginBottom: 32 }}>
        <thead>
          <tr style={{ background: "var(--surface-muted)" }}>
            <th style={{ padding: 12, textAlign: "left", borderBottom: "1px solid var(--border)" }}>Feature</th>
            <th style={{ padding: 12, textAlign: "center", borderBottom: "1px solid var(--border)" }}>Tradify</th>
            <th style={{ padding: 12, textAlign: "center", borderBottom: "1px solid var(--border)", color: "var(--brand)" }}>JobStacker</th>
          </tr>
        </thead>
        <tbody>
          <ComparisonRow feature="Customer management" them="✓" us="✓" />
          <ComparisonRow feature="Professional quoting" them="✓" us="✓" />
          <ComparisonRow feature="Job scheduling" them="✓" us="✓" />
          <ComparisonRow feature="Invoicing" them="✓" us="✓" />
          <ComparisonRow feature="AI quote generation" them="✗" us="✓" />
          <ComparisonRow feature="Free plan available" them="✗" us="✓" />
          <ComparisonRow feature="PDF export" them="✓" us="✓" />
          <ComparisonRow feature="Calendar export" them="✓" us="✓" />
        </tbody>
      </table>
      <FAQ items={[
        { q: "How does pricing compare?", a: "JobStacker is free to start with no credit card. Paid plans are competitively priced for UK sole traders and small teams." },
        { q: "Can I transfer my customer data from Tradify?", a: "Not automatically yet. You can add customers individually in JobStacker." },
        { q: "Is there a mobile app?", a: "JobStacker works as a PWA on iPhone and Android, plus there's a desktop version for Mac and Windows." },
      ]} />
      <CTA />
    </section>
  );
}
