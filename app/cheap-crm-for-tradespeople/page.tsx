import type { Metadata } from "next";
import Link from "next/link";
import { Breadcrumbs } from "../../components/seo/Breadcrumbs";
import { CTA } from "../../components/seo/CTA";

export const metadata: Metadata = {
  title: "Cheap CRM for Tradespeople | Affordable Trade Software | JobStacker",
  description: "Looking for affordable CRM software? JobStacker is cheap CRM for tradespeople with a free tier and low-cost paid plans. No hidden fees.",
  alternates: { canonical: "https://jobstacker.app/cheap-crm-for-tradespeople" },
};

export default function Page() {
  return (
    <section style={{ maxWidth: 800, margin: "0 auto", padding: "40px 20px" }}>
      <Breadcrumbs items={{{ label: "Home", href: "/" }, {{ label: "Cheap CRM for Tradespeople" }}}} />
      <h1 style={{ fontSize: 34, fontWeight: 800, lineHeight: 1.15, marginBottom: 12 }}>Cheap CRM for Tradespeople</h1>
      <p style={{ fontSize: 18, color: "var(--text-muted)", lineHeight: 1.7, marginBottom: 32 }}>CRM software doesn't have to cost hundreds per month. JobStacker offers genuinely affordable pricing for tradespeople - including a free tier with no catch.</p>
      <div style={{ fontSize: 16, color: "var(--text)", lineHeight: 1.8 }}>
        <p style={{ marginBottom: 14 }}>Trade CRM pricing typically ranges from £20 to £100+ per month. JobStacker's free tier costs nothing and includes the essentials: customer management, quoting, job scheduling, and invoicing. When you're ready for AI-powered features, the upgrade is priced for tradespeople, not enterprises. Unlike competitors that lock you into annual contracts or hide fees in the small print, JobStacker's pricing is transparent and there's no long-term commitment. If you're currently paying for Tradify, ServiceM8, or Powered Now and wondering if there's a cheaper option that still does the job - there is.</p>
      </div>
      <CTA />
    </section>
  );
}
