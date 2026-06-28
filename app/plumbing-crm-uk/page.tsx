import type { Metadata } from "next";
import Link from "next/link";
import { Breadcrumbs } from "../../components/seo/Breadcrumbs";
import { CTA } from "../../components/seo/CTA";

export const metadata: Metadata = {
  title: "Plumbing CRM UK | Customer Management for Plumbers | JobStacker",
  description:
    "UK plumbing CRM software built for plumbers. Manage customers, quotes, jobs and invoices with software that understands GBP, VAT, and UK date formats.",
  alternates: { canonical: "https://jobstacker.app/plumbing-crm-uk" },
};

export default function Page() {
  return (
    <section style={{ maxWidth: 800, margin: "0 auto", padding: "40px 20px" }}>
      <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Plumbing CRM UK" }]} />
      <h1 style={{ fontSize: 36, fontWeight: 800, lineHeight: 1.15, marginBottom: 16 }}>Plumbing CRM UK</h1>
      <p style={{ fontSize: 18, color: "var(--text-muted)", lineHeight: 1.7, marginBottom: 32 }}>
        Most CRMs are built for American sales teams. JobStacker is a CRM built in the UK for UK plumbers — with proper VAT handling, GBP pricing, and DD/MM/YYYY dates.
      </p>

      <h2>Why UK plumbers need a trade-specific CRM</h2>
      <p>Generic CRMs like HubSpot or Salesforce don't understand how plumbers work. They can't create a quote with labour and parts, they don't schedule jobs, and they don't track invoices. JobStacker does all of this, and it formats everything the way UK customers expect.</p>

      <h2>What UK plumbers get with JobStacker</h2>
      <ul style={{ lineHeight: 2, paddingLeft: 20 }}>
        <li><strong>UK date and currency</strong> — DD/MM/YYYY dates, GBP prices, VAT line items.</li>
        <li><strong>Professional quotes</strong> — itemised with labour, parts, call-out fees, and VAT.</li>
        <li><strong>Job scheduling</strong> — calendar view of all upcoming work, with automatic job creation from accepted quotes.</li>
        <li><strong>Invoice tracking</strong> — mark jobs paid, generate receipts, know who owes.</li>
        <li><strong>Customer history</strong> — boiler makes, service dates, and previous work for every customer.</li>
      </ul>
      <p style={{ marginBottom: 24 }}>
        <Link href="/crm-for-plumbers">CRM for plumbers →</Link> &nbsp;|&nbsp;
        <Link href="/blog/how-plumbers-can-stop-losing-customers">How plumbers keep customers →</Link> &nbsp;|&nbsp;
        <Link href="/blog/how-to-write-a-professional-plumbing-quote">How to write a plumbing quote →</Link>
      </p>
      <CTA />
    </section>
  );
}
