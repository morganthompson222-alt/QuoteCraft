import type { Metadata } from "next";
import Link from "next/link";
import { Breadcrumbs } from "../../components/seo/Breadcrumbs";
import { CTA } from "../../components/seo/CTA";

export const metadata: Metadata = {
  title: "Plumber Invoice Software | Professional Invoices | JobStacker",
  description: "Plumber invoice software for creating professional invoices and tracking payments. Turn completed jobs into invoices automatically.",
  alternates: { canonical: "https://jobstacker.app/plumber-invoice-software" },
};

export default function Page() {
  return (
    <section style={{ maxWidth: 800, margin: "0 auto", padding: "40px 20px" }}>
      <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Plumber Invoice Software" }]} />
      <h1 style={{ fontSize: 34, fontWeight: 800, lineHeight: 1.15, marginBottom: 12 }}>Plumber Invoice Software</h1>
      <p style={{ fontSize: 18, color: "var(--text-muted)", lineHeight: 1.7, marginBottom: 32 }}>Create professional invoices from your plumbing jobs. Track payments, send reminders, and manage outstanding balances from one dashboard.</p>
      <div style={{ fontSize: 16, color: "var(--text)", lineHeight: 1.8 }}>
        <p style={{ marginBottom: 14 }}>Chasing payments wastes time and creates awkward conversations. JobStacker's invoice tracking shows every completed job, whether it's been paid, and how much is outstanding. Create professional invoices with your company branding, payment terms, and clear breakdowns. When a customer pays, mark it and move on. The system handles the paperwork.</p>
      </div>
      <CTA />
    </section>
  );
}
