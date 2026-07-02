import type { Metadata } from "next";
import Link from "next/link";
import { Breadcrumbs } from "../../components/seo/Breadcrumbs";
import { CTA } from "../../components/seo/CTA";

export const metadata: Metadata = {
  title: "Trade Quote Tracker | Track Every Quote | JobStacker",
  description: "Trade quote tracker software. See every outstanding quote, know who's accepted and who hasn't responded. Never lose track of a quote again.",
  alternates: { canonical: "https://jobstacker.app/trade-quote-tracker" },
};

export default function Page() {
  return (
    <section style={{ maxWidth: 800, margin: "0 auto", padding: "40px 20px" }}>
      <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Trade Quote Tracker" }]} />
      <h1 style={{ fontSize: 34, fontWeight: 800, lineHeight: 1.15, marginBottom: 12 }}>Trade Quote Tracker</h1>
      <p style={{ fontSize: 18, color: "var(--text-muted)", lineHeight: 1.7, marginBottom: 32 }}>Know exactly which quotes are outstanding, which are accepted, and which need following up. Never let a quote slip through the cracks.</p>
      <div style={{ fontSize: 16, color: "var(--text)", lineHeight: 1.8 }}>
        <p style={{ marginBottom: 14 }}>Most tradespeople have no idea how many quotes they've sent or which ones haven't been accepted. That's lost revenue. JobStacker's quote tracker shows every quote by status: draft, sent, accepted, rejected, expired. You can see at a glance which need following up and which have converted. The dashboard shows your total pipeline value - how much work you have quoted and outstanding. That's visibility most tradespeople never have.</p>
      </div>
      <CTA />
    </section>
  );
}
