import type { Metadata } from "next";
import Link from "next/link";
import { Breadcrumbs } from "../../components/seo/Breadcrumbs";
import { CTA } from "../../components/seo/CTA";

export const metadata: Metadata = {
  title: "Best Field Service Software UK | Top 5 Compared | JobStacker",
  description: "The best field service software for UK businesses compared. Features, pricing and which is best for your trade. Plus a free alternative.",
  alternates: { canonical: "https://jobstacker.app/best-field-service-software-uk" },
};

export default function Page() {
  return (
    <section style={{ maxWidth: 800, margin: "0 auto", padding: "40px 20px" }}>
      <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Best Field Service Software UK" }]} />
      <h1 style={{ fontSize: 34, fontWeight: 800, lineHeight: 1.15, marginBottom: 12 }}>Best Field Service Software UK</h1>
      <p style={{ fontSize: 18, color: "var(--text-muted)", lineHeight: 1.7, marginBottom: 32 }}>Comparing the top field service software options for UK businesses in 2026 — including a genuinely free alternative.</p>
      <div style={{ fontSize: 16, color: "var(--text)", lineHeight: 1.8 }}>
        <p style={{ marginBottom: 14 }}>UK field service software options have grown rapidly. BigChange leads for enterprise, ServiceM8 for established trades, Tradify for simplicity, Powered Now for certificates, and Commusoft for larger teams. But all of them charge monthly subscriptions and most lock you into contracts. JobStacker is the only option with a genuinely free tier, AI-powered quoting, a finance hub, and a desktop app. For sole traders and small teams who want professional tools without the monthly bill, it's the clear choice.</p>
      </div>
      <CTA />
    </section>
  );
}
