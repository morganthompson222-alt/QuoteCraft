import type { Metadata } from "next";
import Link from "next/link";
import { Breadcrumbs } from "../../components/seo/Breadcrumbs";
import { FAQ } from "../../components/seo/FAQ";
import { CTA } from "../../components/seo/CTA";

export const metadata: Metadata = {
  title: "Trade Business Administration | Organise Your Back Office | JobStacker",
  description:
    "Stop drowning in paperwork. Learn how tradespeople can manage customers, quotes, invoices, and scheduling without spreadsheets.",
  alternates: { canonical: "https://jobstacker.app/trade-business-administration" },
};

export default function Page() {
  return (
    <section style={{ maxWidth: 800, margin: "0 auto", padding: "40px 20px" }}>
      <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Trade Business Administration" }]} />

      <h1 style={{ fontSize: 36, fontWeight: 800, lineHeight: 1.15, marginBottom: 16 }}>
        Trade Business Administration
      </h1>
      <p style={{ fontSize: 18, color: "var(--text-muted)", lineHeight: 1.7, marginBottom: 32 }}>
        The paperwork is the hardest part of running a trade business. Here's how to get organised and stop losing time to admin.
      </p>

      <h2>Why admin is the hidden tax on trade businesses</h2>
      <p>
        Most tradespeople spend 10-15 hours per week on admin — quoting, scheduling, chasing payments, and filing paperwork. That's 500-750 hours a year that could be spent earning money or resting. The businesses that grow are the ones that get this under control early.
      </p>

      <h2>Customer management without spreadsheets</h2>
      <p>
        Spreadsheets work when you have 10 customers. When you have 50+, they break — hard to search, impossible to access on site, and disconnected from your quoting and scheduling. Use <Link href="/crm-software">trade CRM software</Link> like JobStacker instead: every customer stored with their full history, searchable from any device.
      </p>
      <p>
        <Link href="/blog/how-to-manage-customers-without-spreadsheets">How to manage customers without spreadsheets</Link>
      </p>

      <h2>Quoting and invoicing</h2>
      <p>
        Creating quotes from scratch every time is inefficient. Use a template-based system where your company details, logo, and payment terms are included automatically. JobStacker generates professional PDF quotes and invoices with one click. <Link href="/quote-software">Learn more about quoting software</Link> — <Link href="/invoice-software">invoice software</Link>.
      </p>

      <h2>Scheduling and job tracking</h2>
      <p>
        A calendar that shows every job, its status, and the customer details saves hours of back-and-forth. When a customer accepts a quote, the job should appear on your calendar automatically — no manual entry. <Link href="/scheduling-software">Scheduling software for tradespeople</Link> makes this simple.
      </p>

      <h2>Financial tracking</h2>
      <p>
        Know your numbers: revenue, outstanding payments, upcoming jobs, and profit per job. JobStacker's dashboard gives you this at a glance. Pair it with Xero or FreeAgent for your bookkeeping and VAT returns.
      </p>
      <p>
        <Link href="/blog/best-crm-for-tradespeople">Best CRM for tradespeople</Link> — <Link href="/blog/best-apps-for-tradespeople">Best apps for tradespeople</Link> — <Link href="/blog/how-to-reduce-admin-time">How to reduce admin time</Link>
      </p>

      <h2>How JobStacker replaces your admin stack</h2>
      <p>
        Instead of juggling a spreadsheet for customers, a notebook for quotes, a calendar for jobs, and a separate system for invoices — JobStacker does everything in one place. Customers, quotes, jobs, invoices, scheduling. One login, one dashboard, one source of truth. <Link href="/signup">Start free — no credit card needed.</Link>
      </p>

      <FAQ items={[
        { q: "What's the best way to organise customer records?", a: "Use a CRM designed for tradespeople. Store names, addresses, phone numbers, job history, and notes — all accessible from your phone." },
        { q: "How do I reduce time on quotes?", a: "Use templates. Your company details, logo, and terms should be included automatically. Just add the line items and send." },
        { q: "Do I need accounting software too?", a: "JobStacker handles quotes, invoices and payment tracking. For VAT returns and self-assessment, pair it with Xero or FreeAgent." },
      ]} />
      <CTA />
    </section>
  );
}
