import type { Metadata } from "next";
import Link from "next/link";
import { Breadcrumbs } from "../../components/seo/Breadcrumbs";
import { CTA } from "../../components/seo/CTA";

export const metadata: Metadata = {
  title: "Simpro Alternative | UK Trade Job Management | JobStacker",
  description: "Looking for a Simpro alternative? JobStacker offers simpler quoting, scheduling and CRM for UK tradespeople with AI features and a free tier.",
  alternates: { canonical: "https://jobstacker.app/simpro-alternative" },
};

export default function Page() {
  return (
    <section style={{ maxWidth: 800, margin: "0 auto", padding: "40px 20px" }}>
      <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Simpro Alternative" }]} />
      <h1 style={{ fontSize: 34, fontWeight: 800, lineHeight: 1.15, marginBottom: 12 }}>Simpro Alternative</h1>
      <p style={{ fontSize: 18, color: "var(--text-muted)", lineHeight: 1.7, marginBottom: 32 }}>Simpro is popular with larger service businesses but the pricing and complexity don't suit smaller trades. JobStacker offers the same core functionality with a simpler setup and free tier.</p>
      <p style={{ fontSize: 16, color: "var(--text)", lineHeight: 1.8 }}>Simpro is well-regarded for field service management, but its pricing model and feature depth are designed for companies with multiple technicians and office staff. For independent tradespeople who want to quote, schedule, and invoice without the overhead, JobStacker provides a streamlined alternative with AI features and a free tier.</p>
      <CTA />
    </section>
  );
}
