import type { Metadata } from "next";
import Link from "next/link";
import { Breadcrumbs } from "../../components/seo/Breadcrumbs";
import { CTA } from "../../components/seo/CTA";

export const metadata: Metadata = {
  title: "Free CRM for Electricians | No Cost, No Catch | JobStacker",
  description: "Looking for a genuinely free CRM for electricians? JobStacker has a free tier with quoting, scheduling and customer management - no credit card required.",
  alternates: { canonical: "https://jobstacker.app/free-crm-for-electricians" },
};

export default function Page() {
  return (
    <section style={{ maxWidth: 800, margin: "0 auto", padding: "40px 20px" }}>
      <Breadcrumbs items={{{ label: "Home", href: "/" }, {{ label: "Free CRM for Electricians" }}}} />
      <h1 style={{ fontSize: 34, fontWeight: 800, lineHeight: 1.15, marginBottom: 12 }}>Free CRM for Electricians</h1>
      <p style={{ fontSize: 18, color: "var(--text-muted)", lineHeight: 1.7, marginBottom: 32 }}>Most CRMs promise a 'free trial' that expires after 14 days. JobStacker's free tier has no time limit - create quotes, manage customers, and schedule jobs without ever paying.</p>
      <div style={{ fontSize: 16, color: "var(--text)", lineHeight: 1.8 }}>
        <p style={{ marginBottom: 14 }}>When you search for a free CRM for electricians, most results lead to limited-time trials - 14 days, 30 days, then the paywall hits. JobStacker's free tier is genuinely free with no time limit. You get the core features: customer management, professional quoting with PDF export, job scheduling with a calendar view, and invoice tracking. You can create unlimited quotes, add up to 30 customers, and schedule all your jobs. The only features reserved for paid plans are AI quoting and the finance hub. If you're an electrician who wants to get organised without spending money upfront, this is the real deal.</p>
      </div>
      <CTA />
    </section>
  );
}
