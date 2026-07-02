import type { Metadata } from "next";
import Link from "next/link";
import { Breadcrumbs } from "../../components/seo/Breadcrumbs";
import { CTA } from "../../components/seo/CTA";

export const metadata: Metadata = {
  title: "BigChange Alternative | Cheaper Trade CRM | JobStacker",
  description: "BigChange alternative for smaller trade businesses. JobStacker offers quoting, scheduling and CRM without BigChange's enterprise pricing or contracts.",
  alternates: { canonical: "https://jobstacker.app/bigchange-alternative" },
};

export default function Page() {
  return (
    <section style={{ maxWidth: 800, margin: "0 auto", padding: "40px 20px" }}>
      <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "BigChange Alternative" }]} />
      <h1 style={{ fontSize: 34, fontWeight: 800, lineHeight: 1.15, marginBottom: 12 }}>BigChange Alternative</h1>
      <p style={{ fontSize: 18, color: "var(--text-muted)", lineHeight: 1.7, marginBottom: 32 }}>BigChange is powerful but built for large field service companies. If you're a sole trader or small team, JobStacker gives you what you need without the enterprise complexity.</p>
      <p style={{ fontSize: 16, color: "var(--text)", lineHeight: 1.8 }}>BigChange is a comprehensive platform used by major UK companies, but it comes with enterprise-level pricing, long contracts, and overwhelming features. JobStacker was built for independent tradespeople and small teams. You get professional quoting, job scheduling, customer management, invoicing, and an AI quote generator — all from one dashboard, with no contract and a free tier to start.</p>
      <CTA />
    </section>
  );
}
