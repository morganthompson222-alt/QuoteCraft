import type { Metadata } from "next";
import Link from "next/link";
import { Breadcrumbs } from "../../components/seo/Breadcrumbs";
import { CTA } from "../../components/seo/CTA";

export const metadata: Metadata = {
  title: "Joblogic Alternative | UK Trade Service Software | JobStacker",
  description: "Looking for a Joblogic alternative? JobStacker offers trade CRM, quoting and scheduling with AI features and a free tier for UK tradespeople.",
  alternates: { canonical: "https://jobstacker.app/joblogic-alternative" },
};

export default function Page() {
  return (
    <section style={{ maxWidth: 800, margin: "0 auto", padding: "40px 20px" }}>
      <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Joblogic Alternative" }]} />
      <h1 style={{ fontSize: 34, fontWeight: 800, lineHeight: 1.15, marginBottom: 12 }}>Joblogic Alternative</h1>
      <p style={{ fontSize: 18, color: "var(--text-muted)", lineHeight: 1.7, marginBottom: 32 }}>Joblogic serves the UK field service market. JobStacker is a newer, more modern alternative with AI-powered quoting, a finance hub, and a free tier — no long-term contracts required.</p>
      <p style={{ fontSize: 16, color: "var(--text)", lineHeight: 1.8 }}>Joblogic has a solid reputation in the UK trade software market, but its feature set hasn't kept pace with modern SaaS expectations. JobStacker offers AI quote generation, a finance dashboard, recurring expense tracking, a downloadable desktop app, and a genuinely free tier with no time limit.</p>
      <CTA />
    </section>
  );
}
