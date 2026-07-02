import type { Metadata } from "next";
import Link from "next/link";
import { Breadcrumbs } from "../../components/seo/Breadcrumbs";
import { CTA } from "../../components/seo/CTA";

export const metadata: Metadata = {
  title: "Trade Follow Up Software | Never Miss a Lead | JobStacker",
  description: "Trade follow up software that reminds you to follow up on quotes and enquiries. Convert more leads into paying customers. Free to start.",
  alternates: { canonical: "https://jobstacker.app/trade-follow-up-software" },
};

export default function Page() {
  return (
    <section style={{ maxWidth: 800, margin: "0 auto", padding: "40px 20px" }}>
      <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Trade Follow Up Software" }]} />
      <h1 style={{ fontSize: 34, fontWeight: 800, lineHeight: 1.15, marginBottom: 12 }}>Trade Follow Up Software</h1>
      <p style={{ fontSize: 18, color: "var(--text-muted)", lineHeight: 1.7, marginBottom: 32 }}>Research shows 80% of sales require at least five follow-ups. Don't let your leads go cold - use software that reminds you.</p>
      <div style={{ fontSize: 16, color: "var(--text)", lineHeight: 1.8 }}>
        <p style={{ marginBottom: 14 }}>Following up on quotes is the single highest-impact thing you can do to win more work. But most tradespeople send one quote and forget about it. JobStacker keeps every outstanding quote visible on your dashboard. You can see which quotes haven't been accepted, how long they've been outstanding, and which customers need a follow-up message. Some customers just need a gentle reminder - and a reminder is worth a lost job every time.</p>
      </div>
      <CTA />
    </section>
  );
}
