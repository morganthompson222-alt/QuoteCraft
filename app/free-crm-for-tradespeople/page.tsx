import type { Metadata } from "next";
import Link from "next/link";
import { Breadcrumbs } from "../../components/seo/Breadcrumbs";
import { CTA } from "../../components/seo/CTA";

export const metadata: Metadata = {
  title: "Free CRM for Tradespeople | Genuinely Free | JobStacker",
  description: "A genuinely free CRM for tradespeople. No trial, no credit card. JobStacker includes quoting, scheduling, customer management and invoicing at no cost.",
  alternates: { canonical: "https://jobstacker.app/free-crm-for-tradespeople" },
};

export default function Page() {
  return (
    <section style={{ maxWidth: 800, margin: "0 auto", padding: "40px 20px" }}>
      <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Free CRM for Tradespeople" }]} />
      <h1 style={{ fontSize: 34, fontWeight: 800, lineHeight: 1.15, marginBottom: 12 }}>Free CRM for Tradespeople</h1>
      <p style={{ fontSize: 18, color: "var(--text-muted)", lineHeight: 1.7, marginBottom: 32 }}>Tired of free trials that aren't actually free? JobStacker's free tier has no time limit, no credit card required, and includes the core features you need to run your trade business.</p>
      <div style={{ fontSize: 16, color: "var(--text)", lineHeight: 1.8 }}>
        <p style={{ marginBottom: 14 }}>Most trade CRMs offer a free trial, not a free tier. The difference matters - a trial runs out. A free tier keeps working. JobStacker's free tier includes customer management (up to 30 customers), professional quoting with PDF export, job scheduling with a calendar view, invoice and payment tracking, and a dashboard showing your upcoming work. You can use it forever without paying. The upgrade to a paid plan unlocks AI quote generation and the finance hub, but the core product is genuinely free. No credit card needed to start, no automatic billing after a trial period.</p>
      </div>
      <CTA />
    </section>
  );
}
