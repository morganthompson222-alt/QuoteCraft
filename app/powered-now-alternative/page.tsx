import type { Metadata } from "next";
import Link from "next/link";
import { Breadcrumbs } from "../../components/seo/Breadcrumbs";
import { CTA } from "../../components/seo/CTA";

export const metadata: Metadata = {
  title: "Powered Now Alternative | Simple Trade CRM | JobStacker",
  description: "Powered Now alternative for UK tradespeople. JobStacker offers quoting, job management and AI features with a free tier and modern interface.",
  alternates: { canonical: "https://jobstacker.app/powered-now-alternative" },
};

export default function Page() {
  return (
    <section style={{ maxWidth: 800, margin: "0 auto", padding: "40px 20px" }}>
      <Breadcrumbs items={{{ label: "Home", href: "/" }, {{ label: "Powered Now Alternative" }}}} />
      <h1 style={{ fontSize: 34, fontWeight: 800, lineHeight: 1.15, marginBottom: 12 }}>Powered Now Alternative</h1>
      <p style={{ fontSize: 18, color: "var(--text-muted)", lineHeight: 1.7, marginBottom: 32 }}>Powered Now is a solid UK trade app, but many users want more modern features. JobStacker adds AI quoting, a finance hub, and a desktop app — with a free tier.</p>
      <p style={{ fontSize: 16, color: "var(--text)", lineHeight: 1.8 }}>Powered Now handles quoting and basic job tracking, but users report a dated interface and limited mobile experience. JobStacker provides a cleaner, faster experience with all the core features — quotes, customers, jobs, scheduling, invoicing — plus AI-powered quoting, a finance hub, recurring cost management, and a downloadable desktop app. Free to start with no credit card.</p>
      <CTA />
    </section>
  );
}
