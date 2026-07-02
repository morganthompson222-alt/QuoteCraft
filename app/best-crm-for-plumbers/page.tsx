import type { Metadata } from "next";
import Link from "next/link";
import { Breadcrumbs } from "../../components/seo/Breadcrumbs";
import { CTA } from "../../components/seo/CTA";

export const metadata: Metadata = {
  title: "Best CRM for Plumbers | Top Plumbing Software | JobStacker",
  description: "Compare the best CRM software for plumbers. JobStacker provides quoting, job scheduling and customer management for UK plumbers. Free tier available.",
  alternates: { canonical: "https://jobstacker.app/best-crm-for-plumbers" },
};

export default function Page() {
  return (
    <section style={{ maxWidth: 800, margin: "0 auto", padding: "40px 20px" }}>
      <Breadcrumbs items={{{ label: "Home", href: "/" }, {{ label: "Best CRM for Plumbers" }}}} />
      <h1 style={{ fontSize: 34, fontWeight: 800, lineHeight: 1.15, marginBottom: 12 }}>Best CRM for Plumbers</h1>
      <p style={{ fontSize: 18, color: "var(--text-muted)", lineHeight: 1.7, marginBottom: 32 }}>Choosing CRM software for your plumbing business means finding something that handles emergency call-outs, planned installations, and everything in between.</p>
      <div style={{ fontSize: 16, color: "var(--text)", lineHeight: 1.8 }}>
        <p style={{ marginBottom: 14 }}>The best CRM for plumbers needs to be fast enough for emergency work and detailed enough for planned installations. It should let you create quotes on your phone at the job site, store customer boiler details and service history, schedule around other jobs, and track payments easily. JobStacker handles all of this plus AI quote generation - describe the job and get a structured quote. It has a free tier so you can try it properly before committing. Unlike Tradify or ServiceM8, JobStacker includes a finance hub that tracks your revenue, expenses, and recurring costs per job.</p>
      </div>
      <CTA />
    </section>
  );
}
