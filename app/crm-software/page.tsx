import type { Metadata } from "next";
import Link from "next/link";
import { Breadcrumbs } from "../../components/seo/Breadcrumbs";
import { FAQ } from "../../components/seo/FAQ";
import { CTA } from "../../components/seo/CTA";

export const metadata: Metadata = {
  title: "CRM Software for Tradespeople | Business Management | JobStacker",
  description:
    "JobStacker CRM helps tradespeople manage customers, quotes, jobs and invoices from one platform. The all-in-one business management solution for UK trades. Free to start.",
  alternates: { canonical: "https://jobstacker.app/crm-software" },
};

export default function Page() {
  return (
    <section style={{ maxWidth: 800, margin: "0 auto", padding: "40px 20px" }}>
      <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "CRM Software" }]} />
      <h1 style={{ fontSize: 36, fontWeight: 800, lineHeight: 1.15, marginBottom: 16 }}>CRM Software for Tradespeople</h1>
      <p style={{ fontSize: 18, color: "var(--text-muted)", lineHeight: 1.7, marginBottom: 32 }}>
        JobStacker is customer relationship management built specifically for tradespeople. Not a generic CRM — a complete business management platform that handles customers, quoting, jobs, and invoicing.
      </p>
      <h2>What makes a trade CRM different</h2>
      <p>Generic CRMs like Salesforce or HubSpot are designed for sales teams, not tradespeople. They're overcomplicated and don't understand quoting, job scheduling, or invoice tracking. JobStacker is built from the ground up for service businesses — electricians, plumbers, builders, landscapers, and every other trade.</p>
      <h2>Everything a trade business needs</h2>
      <ul style={{ lineHeight: 2, paddingLeft: 20 }}>
        <li><strong>Customer management</strong> — store names, addresses, phone, email, and full job history.</li>
        <li><strong>Quoting</strong> — create itemised quotes with tax, send PDFs or share links.</li>
        <li><strong>Job scheduling</strong> — accepted quotes become jobs on your calendar automatically.</li>
        <li><strong>Invoicing</strong> — mark jobs paid, generate receipts, track outstanding payments.</li>
        <li><strong>Revenue tracking</strong> — dashboard shows your earnings, open quotes, and upcoming jobs.</li>
      </ul>
      <div style={{ marginTop: 32 }}>Explore by trade: <Link href="/crm-for-electricians">Electricians</Link> | <Link href="/crm-for-plumbers">Plumbers</Link> | <Link href="/crm-for-builders">Builders</Link> | <Link href="/crm-for-landscapers">Landscapers</Link> | <Link href="/crm-for-contractors">Contractors</Link></div>
      <FAQ items={[
        { q: "Is this a good alternative to HubSpot?", a: "If you're a tradesperson, yes. JobStacker does what HubSpot does for customers but adds quoting, job tracking, and invoicing — things HubSpot can't do." },
        { q: "Can I import my existing customer data?", a: "You can add customers individually through the app. Bulk import is coming soon." },
        { q: "Is it suitable for a one-person business?", a: "Absolutely. JobStacker is designed for sole traders and small teams. Simple to use, no training required." },
      ]} />
      <CTA />
    </section>
  );
}
