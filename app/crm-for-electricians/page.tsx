import type { Metadata } from "next";
import { TradePageLayout } from "../../components/seo/TradePageLayout";
import { FAQ } from "../../components/seo/FAQ";

export const metadata: Metadata = {
  title: "CRM for Electricians | Win More Jobs | JobStacker",
  description:
    "JobStacker helps electricians manage customers, quotes, invoices and jobs in one place. Win more work with less paperwork. Free to start.",
  alternates: { canonical: "https://jobstacker.app/crm-for-electricians" },
};

export default function Page() {
  return (
    <TradePageLayout trade="electricians">
      <h1 style={{ fontSize: 36, fontWeight: 800, lineHeight: 1.15, marginBottom: 16 }}>
        CRM for Electricians
      </h1>
      <p style={{ fontSize: 18, color: "var(--text-muted)", lineHeight: 1.7, marginBottom: 32 }}>
        Stop juggling spreadsheets, paper notebooks, and sticky notes. JobStacker is the business management platform built for electricians who want to spend less time on admin and more time on the tools.
      </p>

      <h2>Why electricians need a proper CRM</h2>
      <p>
        Running an electrical business means managing customers, sending quotes, scheduling work, ordering materials, chasing payments, and keeping track of certifications. Most electricians try to manage this with a mix of WhatsApp messages, paper notebooks, and spreadsheets — and it works, until you have more than a handful of jobs on the go.
      </p>
      <p>
        A CRM designed for tradespeople changes everything. Instead of hunting through messages for a customer address or re-typing the same details into every quote, you have one place where every customer, every job, and every pound is tracked.
      </p>

      <h2>What JobStacker does for electricians</h2>
      <ul style={{ lineHeight: 2, paddingLeft: 20 }}>
        <li><strong>Create quotes in minutes</strong> — line-item quotes with tax, materials, and labour. Send a PDF or a share link.</li>
        <li><strong>Track every customer</strong> — names, addresses, phone numbers, email, and full history of every quote and job.</li>
        <li><strong>Schedule work</strong> — accept a quote and the job lands on your calendar automatically.</li>
        <li><strong>Send invoices</strong> — mark jobs as paid and generate receipts.</li>
        <li><strong>Manage customers</strong> — search by name, company, or postcode. See everything for that customer in one screen.</li>
        <li><strong>AI-powered quoting</strong> — describe the job and let AI generate a full quote with pricing.</li>
      </ul>

      <h2>How it works for a typical electrical job</h2>
      <p>
        A customer calls about a fault. You open JobStacker, find them in seconds (or add them in two taps), and create a quote. You add line items for the call-out fee, materials, and labour. The total updates in real time. You send the quote as a link — they tap it, see the breakdown, and accept. The job is now on your calendar.
      </p>
      <p>
        No re-typing. No lost paper. No chasing for payment terms.
      </p>

      <h2>Built for UK electricians</h2>
      <p>
        JobStacker uses GBP, works with UK VAT rates, and formats dates the way UK tradespeople expect (DD/MM/YYYY). Your quotes look professional because they include your company logo, phone number, and full details.
      </p>

      <FAQ
        items={[
          {
            q: "Can I send quotes as PDFs?",
            a: "Yes. Every quote can be downloaded as a branded PDF with your company logo, address, and payment terms. You can also send a share link that customers can open on their phone.",
          },
          {
            q: "Is there a mobile app?",
            a: "JobStacker works as a Progressive Web App — add it to your home screen on iPhone or Android and it works like a native app. There is also a desktop version for Mac and Windows.",
          },
          {
            q: "Can I track materials and labour separately?",
            a: "Yes. Each quote item can have a description, quantity, unit price, and you can separate materials from labour costs. The total updates automatically.",
          },
          {
            q: "Is my data safe?",
            a: "Yes. All data is encrypted in transit and at rest. Your customer information, quotes, and financial data are stored securely on UK-based servers via Supabase.",
          },
          {
            q: "How much does it cost?",
            a: "JobStacker is free to start with no credit card required. Paid plans unlock additional features like AI quote generation and advanced reporting.",
          },
        ]}
      />
    </TradePageLayout>
  );
}
