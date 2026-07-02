import type { Metadata } from "next";
import Link from "next/link";
import { Breadcrumbs } from "../../components/seo/Breadcrumbs";
import { CTA } from "../../components/seo/CTA";

export const metadata: Metadata = {
  title: "Best CRM for Electricians | Compare & Choose | JobStacker",
  description: "We compared the best CRM software for electricians. JobStacker offers quoting, scheduling and job management built for UK electricians. Free to start.",
  alternates: { canonical: "https://jobstacker.app/best-crm-for-electricians" },
};

export default function Page() {
  return (
    <section style={{ maxWidth: 800, margin: "0 auto", padding: "40px 20px" }}>
      <Breadcrumbs items={{{ label: "Home", href: "/" }, {{ label: "Best CRM for Electricians" }}}} />
      <h1 style={{ fontSize: 34, fontWeight: 800, lineHeight: 1.15, marginBottom: 12 }}>Best CRM for Electricians</h1>
      <p style={{ fontSize: 18, color: "var(--text-muted)", lineHeight: 1.7, marginBottom: 32 }}>Finding the right CRM for your electrical business means weighing features, pricing, and how well it fits your actual workflow. These are the top options in 2026.</p>
      <div style={{ fontSize: 16, color: "var(--text)", lineHeight: 1.8 }}>
        <p style={{ marginBottom: 14 }}>The best CRM for electricians needs to handle quoting with materials and labour breakdowns, customer records with job history, scheduling that works around your site visits, and invoice tracking. Generic CRMs like HubSpot or Salesforce are built for sales teams, not tradespeople - they can't create a professional electrical quote or schedule a consumer unit replacement. JobStacker, Tradify, and ServiceM8 are the three most relevant options. JobStacker stands out because it offers AI-powered quote generation, a genuinely free tier with no time limit, a finance hub that tracks your revenue and expenses, and a downloadable desktop app for Mac and Windows. It's built in the UK so GBP, VAT, and DD/MM/YYYY dates work out of the box.</p>
      </div>
      <CTA />
    </section>
  );
}
