import type { Metadata } from "next";
import { TradePageLayout } from "../../components/seo/TradePageLayout";
import { FAQ } from "../../components/seo/FAQ";

export const metadata: Metadata = {
  title: "CRM for Fencing Contractors | Fence Install Software | JobStacker",
  description: "JobStacker helps fencing contractors manage customers, project quotes and installation scheduling. Run your fencing business from one platform.",
  alternates: { canonical: "https://jobstacker.app/crm-for-fencing-contractors" },
};

export default function Page() {
  return (
    <TradePageLayout trade="fencing-contractors">
      <h1 style={{ fontSize: 36, fontWeight: 800, lineHeight: 1.15, marginBottom: 16 }}>CRM for Fencing Contractors</h1>
      <p style={{ fontSize: 18, color: "var(--text-muted)", lineHeight: 1.7, marginBottom: 32 }}>
        JobStacker helps fencing contractors manage customers, project quotes and installation scheduling. Run your fencing business from one platform.
      </p>
      <h2>Why fencing contractors need a proper CRM</h2>
      <p>
        Running a fencing contractors business means managing customer enquiries, sending quotes, scheduling work, and chasing payments. Most tradespeople try to manage this with notebooks and spreadsheets — but as you grow, that stops working.
      </p>
      <p>
        JobStacker gives you one place to manage every customer, every quote, and every job. From your first customer enquiry to the final invoice, everything is tracked and accessible from any device.
      </p>
      <h2>Key features for fencing contractors</h2>
      <ul style={{ lineHeight: 2, paddingLeft: 20 }}>
        <li><strong>Customer management</strong> — store names, addresses, phone numbers, and job history.</li>
        <li><strong>Professional quoting</strong> — create itemised quotes with tax, labour, and materials.</li>
        <li><strong>Job scheduling</strong> — accepted quotes become jobs on your calendar automatically.</li>
        <li><strong>Invoice tracking</strong> — mark jobs as paid, generate receipts, track outstanding payments.</li>
        <li><strong>PDF export</strong> — branded PDFs with your logo and company details.</li>
      </ul>
      <FAQ items={[
        { q: "Can I create quotes on my phone?", a: "Yes. JobStacker works on any device. Create and send quotes from the job site." },
        { q: "Can customers accept quotes online?", a: "Yes. Every quote has a share link. Customers open, review, and accept on any device." },
        { q: "Is there a free trial?", a: "Yes. JobStacker is free to start with no credit card required." },
      ]} />
    </TradePageLayout>
  );
}
