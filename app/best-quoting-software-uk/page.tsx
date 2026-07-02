import type { Metadata } from "next";
import Link from "next/link";
import { Breadcrumbs } from "../../components/seo/Breadcrumbs";
import { CTA } from "../../components/seo/CTA";

export const metadata: Metadata = {
  title: "Best Quoting Software UK | Top 5 Quote Apps | JobStacker",
  description: "The best quoting software for UK tradespeople compared. Professional quotes, PDF export, pricing - plus a free quote app alternative.",
  alternates: { canonical: "https://jobstacker.app/best-quoting-software-uk" },
};

export default function Page() {
  return (
    <section style={{ maxWidth: 800, margin: "0 auto", padding: "40px 20px" }}>
      <Breadcrumbs items={{{ label: "Home", href: "/" }, {{ label: "Best Quoting Software UK" }}}} />
      <h1 style={{ fontSize: 34, fontWeight: 800, lineHeight: 1.15, marginBottom: 12 }}>Best Quoting Software UK</h1>
      <p style={{ fontSize: 18, color: "var(--text-muted)", lineHeight: 1.7, marginBottom: 32 }}>Comparing the best quoting software for UK tradespeople in 2026. Features, pricing, and which app helps you win more work.</p>
      <div style={{ fontSize: 16, color: "var(--text)", lineHeight: 1.8 }}>
        <p style={{ marginBottom: 14 }}>Professional quoting software transforms your win rate. The best options for UK tradespeople are Tradify (simple, monthly fee), Powered Now (certificates included, dated UI), ServiceM8 (comprehensive, complex), and JobStacker (modern, AI-powered, free tier). JobStacker stands out because it offers AI quote generation - describe the job and get a structured quote with materials and labour. And the core quoting engine is completely free with no time limit.</p>
      </div>
      <CTA />
    </section>
  );
}
