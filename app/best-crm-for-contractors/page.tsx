import type { Metadata } from "next";
import Link from "next/link";
import { Breadcrumbs } from "../../components/seo/Breadcrumbs";
import { CTA } from "../../components/seo/CTA";

export const metadata: Metadata = {
  title: "Best CRM for Contractors | General Contractor Software | JobStacker",
  description: "The best CRM for general contractors. JobStacker provides multi-project management, quoting, scheduling and invoicing. Free tier available.",
  alternates: { canonical: "https://jobstacker.app/best-crm-for-contractors" },
};

export default function Page() {
  return (
    <section style={{ maxWidth: 800, margin: "0 auto", padding: "40px 20px" }}>
      <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Best CRM for Contractors" }]} />
      <h1 style={{ fontSize: 34, fontWeight: 800, lineHeight: 1.15, marginBottom: 12 }}>Best CRM for Contractors</h1>
      <p style={{ fontSize: 18, color: "var(--text-muted)", lineHeight: 1.7, marginBottom: 32 }}>General contractors juggle multiple projects, clients, and subcontractors. The right CRM keeps everything organised without adding hours of admin.</p>
      <div style={{ fontSize: 16, color: "var(--text)", lineHeight: 1.8 }}>
        <p style={{ marginBottom: 14 }}>Contracting requires a CRM that can handle everything from a small domestic job to a multi-site commercial project. You need flexible quoting, job scheduling that handles multiple projects at once, customer records with full history, and clear financial tracking across projects. JobStacker was built for this complexity. It's the only CRM in this category that offers AI-powered quoting - describe the work and get a structured quote with materials and labour. Plus a free tier so you can properly evaluate it before paying anything.</p>
      </div>
      <CTA />
    </section>
  );
}
