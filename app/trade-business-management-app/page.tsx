import type { Metadata } from "next";
import Link from "next/link";
import { Breadcrumbs } from "../../components/seo/Breadcrumbs";
import { CTA } from "../../components/seo/CTA";

export const metadata: Metadata = {
  title: "Trade Business Management App | All-in-One | JobStacker",
  description:
    "JobStacker is the all-in-one business management app for tradespeople. Manage customers, quotes, jobs, invoices and scheduling from one app. Free to start.",
  alternates: { canonical: "https://jobstacker.app/trade-business-management-app" },
};

export default function Page() {
  return (
    <section style={{ maxWidth: 800, margin: "0 auto", padding: "40px 20px" }}>
      <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Trade Business Management App" }]} />
      <h1 style={{ fontSize: 36, fontWeight: 800, lineHeight: 1.15, marginBottom: 16 }}>Trade Business Management App</h1>
      <p style={{ fontSize: 18, color: "var(--text-muted)", lineHeight: 1.7, marginBottom: 32 }}>
        Stop juggling spreadsheets, notebooks, and separate apps. JobStacker is the all-in-one management app that does everything your trade business needs.
      </p>

      <h2>What a trade business management app should do</h2>
      <p>One place for customers, quotes, jobs, invoices, and scheduling. Everything connected — when a customer accepts a quote, the job appears on your calendar. When the job is done, you mark it paid. No re-typing, no lost information.</p>

      <h2>Everything in one app</h2>
      <ul style={{ lineHeight: 2, paddingLeft: 20 }}>
        <li><strong>Customers</strong> — store names, addresses, phone, email, and full job history.</li>
        <li><strong>Quotes</strong> — create professional quotes with PDF export and share links.</li>
        <li><strong>Jobs</strong> — track every job from accepted to completed to paid.</li>
        <li><strong>Invoices</strong> — mark jobs paid, generate receipts, track outstanding amounts.</li>
        <li><strong>Calendar</strong> — see your schedule, reschedule jobs, export to your phone calendar.</li>
        <li><strong>Dashboard</strong> — revenue, open quotes, upcoming jobs — all at a glance.</li>
      </ul>
      <p style={{ marginBottom: 24 }}>
        <Link href="/quote-software">Quote software</Link> | <Link href="/invoice-software">Invoice software</Link> | <Link href="/job-management-software">Job management</Link> | <Link href="/scheduling-software">Scheduling</Link> | <Link href="/crm-software">CRM</Link>
      </p>
      <CTA />
    </section>
  );
}
