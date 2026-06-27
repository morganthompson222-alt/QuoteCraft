import type { Metadata } from "next";
import { TradePageLayout } from "../../components/seo/TradePageLayout";
import { FAQ } from "../../components/seo/FAQ";

export const metadata: Metadata = {
  title: "CRM for Contractors | Contractor Management Software | JobStacker",
  description:
    "JobStacker helps contractors manage multiple projects, subcontractors, quotes and schedules. Run your contracting business from one dashboard.",
  alternates: { canonical: "https://jobstacker.app/crm-for-contractors" },
};

export default function Page() {
  return (
    <TradePageLayout trade="contractors">
      <h1 style={{ fontSize: 36, fontWeight: 800, lineHeight: 1.15, marginBottom: 16 }}>CRM for Contractors</h1>
      <p style={{ fontSize: 18, color: "var(--text-muted)", lineHeight: 1.7, marginBottom: 32 }}>
        General contractors juggle multiple projects, clients, suppliers, and subcontractors. JobStacker gives you one place to track every job from first enquiry to final invoice.
      </p>
      <h2>Built for the way contractors work</h2>
      <p>Contracting is complex. You're managing client expectations, coordinating subcontractors, ordering materials, and keeping projects on schedule. When you're doing all of this across multiple sites, a notebook and spreadsheet combination quickly breaks down. JobStacker provides a structured system for every project — from the initial quote through to completion and invoicing.</p>
      <h2>Key features</h2>
      <ul style={{ lineHeight: 2, paddingLeft: 20 }}>
        <li><strong>Project-based management</strong> — each job has its own quote, schedule, and customer record.</li>
        <li><strong>Multi-day scheduling</strong> — schedule projects that span weeks with start and end dates.</li>
        <li><strong>Customer portal</strong> — share quote links so clients can review and approve estimates online.</li>
        <li><strong>Payment tracking</strong> — manage deposits, stage payments, and final invoices.</li>
        <li><strong>PDF quotes</strong> — professional branded PDFs for every project estimate.</li>
      </ul>
      <FAQ items={[
        { q: "Can I track subcontractor costs?", a: "Yes. Add any cost as a line item in your quotes and track project profitability." },
        { q: "Can I manage multiple sites?", a: "Yes. Each customer and job is independent. Switch between projects from the dashboard." },
        { q: "Is there a free trial?", a: "Yes. JobStacker is free to start with no credit card required. Paid plans unlock AI and advanced features." },
      ]} />
    </TradePageLayout>
  );
}
