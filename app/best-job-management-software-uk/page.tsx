import type { Metadata } from "next";
import Link from "next/link";
import { Breadcrumbs } from "../../components/seo/Breadcrumbs";
import { CTA } from "../../components/seo/CTA";

export const metadata: Metadata = {
  title: "Best Job Management Software UK | Top Apps | JobStacker",
  description: "The best job management software for UK tradespeople compared. Track jobs, schedule work and manage customers. Plus a free option.",
  alternates: { canonical: "https://jobstacker.app/best-job-management-software-uk" },
};

export default function Page() {
  return (
    <section style={{ maxWidth: 800, margin: "0 auto", padding: "40px 20px" }}>
      <Breadcrumbs items={{{ label: "Home", href: "/" }, {{ label: "Best Job Management Software UK" }}}} />
      <h1 style={{ fontSize: 34, fontWeight: 800, lineHeight: 1.15, marginBottom: 12 }}>Best Job Management Software UK</h1>
      <p style={{ fontSize: 18, color: "var(--text-muted)", lineHeight: 1.7, marginBottom: 32 }}>Comparing the top job management software for UK tradespeople in 2026. Features, pricing, pros and cons.</p>
      <div style={{ fontSize: 16, color: "var(--text)", lineHeight: 1.8 }}>
        <p style={{ marginBottom: 14 }}>Job management software helps you track every job from enquiry to completion. The UK market leaders are Tradify (simple, paid), ServiceM8 (comprehensive, paid), BigChange (enterprise, expensive), and JobStacker (modern, AI-powered, free tier). For most tradespeople, JobStacker offers the best balance: comprehensive features, UK-specific design, AI tools, and a free tier with no time limit or credit card required.</p>
      </div>
      <CTA />
    </section>
  );
}
