import type { Metadata } from "next";
import Link from "next/link";
import { Breadcrumbs } from "../../components/seo/Breadcrumbs";
import { CTA } from "../../components/seo/CTA";

export const metadata: Metadata = {
  title: "Best CRM for Small Trade Business | UK 2026 | JobStacker",
  description: "The best CRM for small trade businesses. Compare affordable CRM options for sole traders and small teams. Free tier available.",
  alternates: { canonical: "https://jobstacker.app/best-crm-for-small-trade-business" },
};

export default function Page() {
  return (
    <section style={{ maxWidth: 800, margin: "0 auto", padding: "40px 20px" }}>
      <Breadcrumbs items={{{ label: "Home", href: "/" }, {{ label: "Best CRM for Small Trade Business" }}}} />
      <h1 style={{ fontSize: 34, fontWeight: 800, lineHeight: 1.15, marginBottom: 12 }}>Best CRM for Small Trade Business</h1>
      <p style={{ fontSize: 18, color: "var(--text-muted)", lineHeight: 1.7, marginBottom: 32 }}>Small trade businesses need a CRM that doesn't cost more than it saves. Here are the best affordable options in 2026.</p>
      <div style={{ fontSize: 16, color: "var(--text)", lineHeight: 1.8 }}>
        <p style={{ marginBottom: 14 }}>Small trade businesses - sole traders and teams of 2-5 people - need CRM software that's affordable, easy to learn, and actually saves time. Most enterprise CRMs are overkill. JobStacker was built specifically for small trade businesses. The free tier includes everything a sole trader needs, and the upgrade pricing is designed for small teams, not enterprises. Compare features, try it free, and see if it fits before spending anything.</p>
      </div>
      <CTA />
    </section>
  );
}
