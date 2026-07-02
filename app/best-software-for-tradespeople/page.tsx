import type { Metadata } from "next";
import Link from "next/link";
import { Breadcrumbs } from "../../components/seo/Breadcrumbs";
import { CTA } from "../../components/seo/CTA";

export const metadata: Metadata = {
  title: "Best Software for Tradespeople UK | 2026 Guide | JobStacker",
  description: "The best software for UK tradespeople. Compare quoting, scheduling, invoicing and CRM tools. JobStacker is the free all-in-one option.",
  alternates: { canonical: "https://jobstacker.app/best-software-for-tradespeople" },
};

export default function Page() {
  return (
    <section style={{ maxWidth: 800, margin: "0 auto", padding: "40px 20px" }}>
      <Breadcrumbs items={{{ label: "Home", href: "/" }, {{ label: "Best Software for Tradespeople" }}}} />
      <h1 style={{ fontSize: 34, fontWeight: 800, lineHeight: 1.15, marginBottom: 12 }}>Best Software for Tradespeople</h1>
      <p style={{ fontSize: 18, color: "var(--text-muted)", lineHeight: 1.7, marginBottom: 32 }}>From quote software to full CRM suites - here are the best software options for UK tradespeople in 2026, ranked by what actually matters.</p>
      <div style={{ fontSize: 16, color: "var(--text)", lineHeight: 1.8 }}>
        <p style={{ marginBottom: 14 }}>The trade software market has exploded. There are now dozens of options, from simple quoting apps to full enterprise field service platforms. For most UK tradespeople, the sweet spot is an all-in-one tool that handles customers, quotes, jobs, scheduling, and invoicing without being overcomplicated. JobStacker, Tradify, Powered Now, and ServiceM8 are the most relevant options. JobStacker stands out because it's the only one with AI-powered quoting, a genuinely free tier, a finance hub, and a desktop app - all from a single platform.</p>
      </div>
      <CTA />
    </section>
  );
}
