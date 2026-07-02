import type { Metadata } from "next";
import Link from "next/link";
import { Breadcrumbs } from "../../components/seo/Breadcrumbs";
import { CTA } from "../../components/seo/CTA";

export const metadata: Metadata = {
  title: "Best CRM for Roofers | Roofing Business Software | JobStacker",
  description: "Compare the best CRM software for roofers. JobStacker offers quoting, weather-flexible scheduling and customer management. Free to start.",
  alternates: { canonical: "https://jobstacker.app/best-crm-for-roofers" },
};

export default function Page() {
  return (
    <section style={{ maxWidth: 800, margin: "0 auto", padding: "40px 20px" }}>
      <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Best CRM for Roofers" }]} />
      <h1 style={{ fontSize: 34, fontWeight: 800, lineHeight: 1.15, marginBottom: 12 }}>Best CRM for Roofers</h1>
      <p style={{ fontSize: 18, color: "var(--text-muted)", lineHeight: 1.7, marginBottom: 32 }}>Roofing CRM software needs to handle detailed material estimates, scaffold coordination, and weather-dependent scheduling.</p>
      <div style={{ fontSize: 16, color: "var(--text)", lineHeight: 1.8 }}>
        <p style={{ marginBottom: 14 }}>Roofers need CRM software that can itemise materials (tiles, felt, battens, fixings), labour, scaffold hire, and waste disposal in every quote. Weather delays are a fact of roofing life, so scheduling must be flexible. Customer records should store property details, access notes, and full job history. JobStacker handles all this with a modern interface designed for on-site use from your phone. The AI quote generator can produce a full roofing estimate from a simple description - saving you time on every quote.</p>
      </div>
      <CTA />
    </section>
  );
}
