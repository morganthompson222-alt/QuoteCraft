import type { Metadata } from "next";
import Link from "next/link";
import { Breadcrumbs } from "../../components/seo/Breadcrumbs";
import { FAQ } from "../../components/seo/FAQ";
import { CTA } from "../../components/seo/CTA";

export const metadata: Metadata = {
  title: "Jobber Alternative | Cheaper & Simpler Trade CRM | JobStacker",
  description:
    "Looking for a Jobber alternative? JobStacker offers quoting, scheduling and invoicing for UK tradespeople at a fraction of the price. Free to start.",
  alternates: { canonical: "https://jobstacker.app/jobber-alternative" },
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
      <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "JobStacker vs Jobber" }]} />
      <h1 style={{ fontSize: 36, fontWeight: 800, lineHeight: 1.15, marginBottom: 16 }}>JobStacker vs Jobber</h1>
      <p style={{ fontSize: 18, color: "var(--text-muted)", lineHeight: 1.7, marginBottom: 32 }}>
        Looking for a Jobber alternative? JobStacker offers similar quoting, scheduling and invoicing features — simpler, more affordable, and built for UK tradespeople.
      </p>
      <h2>Why UK tradespeople choose JobStacker over Jobber</h2>
      <p>Jobber is a solid platform, but many UK tradespeople find it expensive and overcomplicated. JobStacker was built specifically for UK trades — with GBP pricing, UK date formats, and no long-term contracts.</p>
      <h2>Feature comparison</h2>
      <table style={{ width: "100%", borderCollapse: "collapse", marginBottom: 32 }}>
        <thead>
          <tr style={{ background: "var(--surface-muted)" }}>
            <th style={{ padding: 12, textAlign: "left", borderBottom: "1px solid var(--border)" }}>Feature</th>
            <th style={{ padding: 12, textAlign: "center", borderBottom: "1px solid var(--border)" }}>Jobber</th>
            <th style={{ padding: 12, textAlign: "center", borderBottom: "1px solid var(--border)", color: "var(--brand)" }}>JobStacker</th>
          </tr>
        </thead>
        <tbody>
          <ComparisonRow feature="Quoting with PDFs" them="✓" us="✓" />
          <ComparisonRow feature="Job scheduling" them="✓" us="✓" />
          <ComparisonRow feature="Customer management" them="✓" us="✓" />
          <ComparisonRow feature="Invoice tracking" them="✓" us="✓" />
          <ComparisonRow feature="AI-powered quoting" them="✗" us="✓" />
          <ComparisonRow feature="Free to start" them="✗" us="✓" />
          <ComparisonRow feature="UK date & currency" them="Limited" us="✓" />
          <ComparisonRow feature="No long-term contract" them="✗" us="✓" />
        </tbody>
      </table>
      <div style={{ marginTop: 32 }}>
        Related: <Link href="/crm-software">CRM software</Link> | <Link href="/quote-software">Quote software</Link> | <Link href="/job-management-software">Job management</Link>
      </div>
      <FAQ items={[
        { q: "Can I import my data from Jobber?", a: "Not automatically yet. You can add customers and create quotes directly in JobStacker. Bulk import is coming soon." },
        { q: "Is JobStacker cheaper than Jobber?", a: "Yes. JobStacker is free to start with no credit card. Paid plans are priced for UK tradespeople." },
        { q: "Can I try JobStacker before switching?", a: "Absolutely. Create a free account and try it for as long as you like." },
      ]} />
      <CTA />
    </section>
  );
}
