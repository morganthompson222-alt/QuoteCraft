import type { Metadata } from "next";
import { TradePageLayout } from "../../components/seo/TradePageLayout";
import { FAQ } from "../../components/seo/FAQ";

export const metadata: Metadata = {
  title: "CRM for Plumbers | Quotes, Invoices & Scheduling | JobStacker",
  description:
    "JobStacker helps plumbers manage customers, send quotes, schedule jobs and track invoices. Stop losing paperwork — run your business from one place.",
  alternates: { canonical: "https://jobstacker.app/crm-for-plumbers" },
};

export default function Page() {
  return (
    <TradePageLayout trade="plumbers">
      <h1 style={{ fontSize: 36, fontWeight: 800, lineHeight: 1.15, marginBottom: 16 }}>
        CRM for Plumbers
      </h1>
      <p style={{ fontSize: 18, color: "var(--text-muted)", lineHeight: 1.7, marginBottom: 32 }}>
        From emergency call-outs to bathroom installations — JobStacker keeps your customers, quotes, jobs, and invoices organised so you can focus on the pipes, not the paperwork.
      </p>

      <h2>The problem with paper</h2>
      <p>
        Plumbing businesses generate a lot of paper. Quotes written on scrap paper, invoices buried in email inboxes, customer details scribbled in notebooks. When you're juggling multiple jobs across different sites, this quickly becomes unmanageable. You lose quotes, forget to follow up, and waste hours every week on admin.
      </p>
      <p>
        JobStacker solves this by giving you one digital workspace for your entire business. Every customer, every quote, every job — all in one place, accessible from your phone or laptop.
      </p>

      <h2>Key features for plumbers</h2>
      <ul style={{ lineHeight: 2, paddingLeft: 20 }}>
        <li><strong>Customer management</strong> — store addresses, phone numbers, email, and job history for every customer.</li>
        <li><strong>Professional quoting</strong> — create itemised quotes with labour, parts, and call-out fees. Send by email or share link.</li>
        <li><strong>Job scheduling</strong> — when a customer accepts a quote, the job appears on your calendar. No double-booking.</li>
        <li><strong>Invoice tracking</strong> — mark jobs as paid, generate receipts, and see which customers still owe payment.</li>
        <li><strong>AI quote generation</strong> — describe the job and JobStacker AI drafts a complete quote with pricing.</li>
      </ul>

      <h2>Perfect for emergency and planned work</h2>
      <p>
        Whether you're doing emergency call-outs or planned bathroom installations, JobStacker adapts to your workflow. For emergency work, create a quick quote on your phone and send the link before you leave the job. For planned work, schedule the job, set the date, and track it through to completion.
      </p>

      <FAQ
        items={[
          {
            q: "Can I create quotes on my phone?",
            a: "Yes. JobStacker works in any browser and as a PWA on your phone. Create and send quotes from the job site.",
          },
          {
            q: "Can I track parts and materials?",
            a: "Yes. Add line items for parts, materials, labour, and call-out fees. The quote total updates in real time.",
          },
          {
            q: "Does it work with UK VAT?",
            a: "Yes. You can set your default tax rate in settings, and it will be applied to every new quote automatically.",
          },
          {
            q: "Can customers accept quotes online?",
            a: "Yes. Send a share link and customers can view and accept the quote on any device — no account needed.",
          },
        ]}
      />
    </TradePageLayout>
  );
}
