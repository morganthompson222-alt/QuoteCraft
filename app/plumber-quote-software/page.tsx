import type { Metadata } from "next";
import Link from "next/link";
import { Breadcrumbs } from "../../components/seo/Breadcrumbs";
import { CTA } from "../../components/seo/CTA";

export const metadata: Metadata = {
  title: "Plumber Quote Software | Professional Quotes | JobStacker",
  description: "Plumber quote software for creating professional quotes with parts, labour and VAT. Send branded PDFs in minutes. Free to use.",
  alternates: { canonical: "https://jobstacker.app/plumber-quote-software" },
};

export default function Page() {
  return (
    <section style={{ maxWidth: 800, margin: "0 auto", padding: "40px 20px" }}>
      <Breadcrumbs items={{{ label: "Home", href: "/" }, {{ label: "Plumber Quote Software" }}}} />
      <h1 style={{ fontSize: 34, fontWeight: 800, lineHeight: 1.15, marginBottom: 12 }}>Plumber Quote Software</h1>
      <p style={{ fontSize: 18, color: "var(--text-muted)", lineHeight: 1.7, marginBottom: 32 }}>Create plumbing quotes with itemised parts, labour, call-out fees and VAT. Professional PDFs with your branding. Free to start.</p>
      <div style={{ fontSize: 16, color: "var(--text)", lineHeight: 1.8 }}>
        <p style={{ marginBottom: 14 }}>Plumbing quotes need to separate parts from labour clearly. A customer wants to see what they're paying for brass fittings vs your time. JobStacker lets you itemise every part, add quantities and unit prices, separate labour costs, apply VAT, and include call-out fees. The quote looks professional with your company logo, phone number, and payment terms. Send a share link and the customer can accept on their phone. Once accepted, the job is automatically scheduled on your calendar.</p>
      </div>
      <CTA />
    </section>
  );
}
