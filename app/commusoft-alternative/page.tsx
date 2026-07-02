import type { Metadata } from "next";
import Link from "next/link";
import { Breadcrumbs } from "../../components/seo/Breadcrumbs";
import { CTA } from "../../components/seo/CTA";

export const metadata: Metadata = {
  title: "Commusoft Alternative | Trade Business Software | JobStacker",
  description: "Commusoft alternative for UK tradespeople. JobStacker offers simpler pricing, AI features, and a free tier without Commusoft's enterprise complexity.",
  alternates: { canonical: "https://jobstacker.app/commusoft-alternative" },
};

export default function Page() {
  return (
    <section style={{ maxWidth: 800, margin: "0 auto", padding: "40px 20px" }}>
      <Breadcrumbs items={{{ label: "Home", href: "/" }, {{ label: "Commusoft Alternative" }}}} />
      <h1 style={{ fontSize: 34, fontWeight: 800, lineHeight: 1.15, marginBottom: 12 }}>Commusoft Alternative</h1>
      <p style={{ fontSize: 18, color: "var(--text-muted)", lineHeight: 1.7, marginBottom: 32 }}>Commusoft serves larger field service businesses. If you're an independent tradesperson or small team, JobStacker gives you the same core features — simpler and free to start.</p>
      <p style={{ fontSize: 16, color: "var(--text)", lineHeight: 1.8 }}>Commusoft is priced for companies with office staff and multiple engineers. For a sole trader, the feature set is overkill. JobStacker gives you the essentials: professional quoting, customer management, calendar-based scheduling, invoice tracking, and AI-powered quote generation — all from a clean, modern interface designed to be used on-site from your phone.</p>
      <CTA />
    </section>
  );
}
