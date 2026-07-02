import type { Metadata } from "next";
import Link from "next/link";
import { Breadcrumbs } from "../../components/seo/Breadcrumbs";
import { CTA } from "../../components/seo/CTA";

export const metadata: Metadata = {
  title: "Best CRM for Landscapers | Landscape Software | JobStacker",
  description: "The best CRM for landscaping businesses. JobStacker helps landscapers manage quotes, projects and customer schedules. Free tier available.",
  alternates: { canonical: "https://jobstacker.app/best-crm-for-landscapers" },
};

export default function Page() {
  return (
    <section style={{ maxWidth: 800, margin: "0 auto", padding: "40px 20px" }}>
      <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Best CRM for Landscapers" }]} />
      <h1 style={{ fontSize: 34, fontWeight: 800, lineHeight: 1.15, marginBottom: 12 }}>Best CRM for Landscapers</h1>
      <p style={{ fontSize: 18, color: "var(--text-muted)", lineHeight: 1.7, marginBottom: 32 }}>Landscaping projects need software that handles detailed quotes with materials, labour, and plant hire, plus weather-dependent scheduling.</p>
      <div style={{ fontSize: 16, color: "var(--text)", lineHeight: 1.8 }}>
        <p style={{ marginBottom: 14 }}>Landscaping CRM needs are unique - every project is different, material costs vary by season, and weather disrupts schedules. JobStacker provides detailed quoting with line items for materials, labour, plant hire, waste removal, and any other cost. The scheduling is flexible so you can move jobs when it rains. Customer records store preferences, garden details, and past work. And the free tier means you can try the full product before deciding whether to upgrade for AI features.</p>
      </div>
      <CTA />
    </section>
  );
}
