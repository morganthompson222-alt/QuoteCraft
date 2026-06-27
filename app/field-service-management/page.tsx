import type { Metadata } from "next";
import Link from "next/link";
import { Breadcrumbs } from "../../components/seo/Breadcrumbs";
import { CTA } from "../../components/seo/CTA";

export const metadata: Metadata = {
  title: "Field Service Management Software | JobStacker",
  description: "JobStacker field service management software helps tradespeople manage on-site jobs, customer visits, scheduling and invoicing from the field.",
  alternates: { canonical: "https://jobstacker.app/field-service-management" },
};

export default function Page() {
  return (
    <section style={{ maxWidth: 800, margin: "0 auto", padding: "40px 20px" }}>
      <Breadcrumbs items={{ label: "Home", href: "/" }, {{ label: "Field Service Management Software" }}} />
      <h1 style={{ fontSize: 36, fontWeight: 800, lineHeight: 1.15, marginBottom: 16 }}>Field Service Management Software</h1>
      <p style={{ fontSize: 18, color: "var(--text-muted)", lineHeight: 1.7, marginBottom: 32 }}>
        JobStacker field service management software helps tradespeople manage on-site jobs, customer visits, scheduling and invoicing from the field.
      </p>
      <h2>Why it matters</h2>
      <p>
        Tradespeople run their businesses on relationships. Every customer, every job, every quote is a thread in that relationship. Without a system to track these threads, things slip through the cracks — forgotten follow-ups, lost customer details, missed appointments.
      </p>
      <p>
        JobStacker gives you one trusted place for every customer interaction. From the first phone call to the final invoice, everything is connected and accessible from any device.
      </p>
      <h2>Key features</h2>
      <ul style={{ lineHeight: 2, paddingLeft: 20 }}>
        <li><strong>Customer management</strong> — names, addresses, phone, email, and full history.</li>
        <li><strong>Quoting</strong> — itemised quotes with tax, PDF export, and share links.</li>
        <li><strong>Job scheduling</strong> — calendar-based scheduling with automatic job creation.</li>
        <li><strong>Payment tracking</strong> — know who has paid and who hasn't, at a glance.</li>
        <li><strong>Dashboard</strong> — see your revenue, open quotes, and upcoming jobs.</li>
      </ul>
      <div style={{ marginTop: 32 }}>
        Related: <Link href="/quote-software">Quote software</Link> | <Link href="/invoice-software">Invoice software</Link> | <Link href="/crm-software">CRM</Link>
      </div>
      <CTA />
    </section>
  );
}
