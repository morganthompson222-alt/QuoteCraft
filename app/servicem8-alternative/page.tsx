import type { Metadata } from "next";
import Link from "next/link";
import { Breadcrumbs } from "../../components/seo/Breadcrumbs";
import { CTA } from "../../components/seo/CTA";

export const metadata: Metadata = {
  title: "ServiceM8 Alternative | Better Trade CRM | JobStacker",
  description: "Looking for a ServiceM8 alternative? JobStacker offers quoting, scheduling and job management for UK tradespeople with AI features and a free tier.",
  alternates: { canonical: "https://jobstacker.app/servicem8-alternative" },
};

export default function Page() {
  return (
    <section style={{ maxWidth: 800, margin: "0 auto", padding: "40px 20px" }}>
      <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "ServiceM8 Alternative" }]} />
      <h1 style={{ fontSize: 34, fontWeight: 800, lineHeight: 1.15, marginBottom: 12 }}>ServiceM8 Alternative</h1>
      <p style={{ fontSize: 18, color: "var(--text-muted)", lineHeight: 1.7, marginBottom: 32 }}>Looking for a ServiceM8 alternative? JobStacker combines quoting, job scheduling, customer management and AI quoting — with a free tier that ServiceM8 doesn't offer.</p>
      <p style={{ fontSize: 16, color: "var(--text)", lineHeight: 1.8 }}>ServiceM8 is well-established but many tradespeople find it expensive for what you get. It lacks AI features, doesn't have a genuine free tier, and the interface feels dated. JobStacker covers everything ServiceM8 does — customers, quotes, scheduling, invoicing — plus AI-powered quote generation, a finance hub, a desktop app, and a free tier you can use indefinitely without a credit card.</p>
      <CTA />
    </section>
  );
}
