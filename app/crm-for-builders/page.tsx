import type { Metadata } from "next";
import { TradePageLayout } from "../../components/seo/TradePageLayout";
import { FAQ } from "../../components/seo/FAQ";

export const metadata: Metadata = {
  title: "CRM for Builders | Construction Job Management | JobStacker",
  description:
    "JobStacker helps builders manage construction projects, customer quotes, site scheduling and invoicing. Replace spreadsheets with one simple platform.",
  alternates: { canonical: "https://jobstacker.app/crm-for-builders" },
};

export default function Page() {
  return (
    <TradePageLayout trade="builders">
      <h1 style={{ fontSize: 36, fontWeight: 800, lineHeight: 1.15, marginBottom: 16 }}>
        CRM for Builders
      </h1>
      <p style={{ fontSize: 18, color: "var(--text-muted)", lineHeight: 1.7, marginBottom: 32 }}>
        Building projects involve multiple customers, suppliers, subcontractors, and moving parts. JobStacker keeps everything connected — from the first quote to the final invoice.
      </p>

      <h2>Construction projects need better organisation</h2>
      <p>
        Building work isn't like other trades. Projects span weeks or months, involve multiple stages, and require coordination with customers, suppliers, and other tradespeople. A simple notebook won't cut it.
      </p>
      <p>
        JobStacker gives builders a structured way to manage every project. Create a quote, get it approved, schedule the work, track progress, and invoice when complete. Every customer interaction is logged and accessible from any device.
      </p>

      <h2>Built for how builders work</h2>
      <ul style={{ lineHeight: 2, paddingLeft: 20 }}>
        <li><strong>Project-based quoting</strong> — break down quotes by phase: groundwork, framing, roofing, finishing.</li>
        <li><strong>Customer portal</strong> — share the public quote link so customers can see and accept estimates online.</li>
        <li><strong>Multi-day scheduling</strong> — schedule jobs that span multiple days with start and end dates.</li>
        <li><strong>Deposit tracking</strong> — mark quotes as paid when deposits are received.</li>
        <li><strong>PDF export</strong> — generate professional branded PDFs for every quote and invoice.</li>
      </ul>

      <FAQ
        items={[
          {
            q: "Can I manage multiple projects at once?",
            a: "Yes. Each project has its own quote, job schedule, and customer record. Switch between them easily from the dashboard.",
          },
          {
            q: "Can I add subcontractor costs?",
            a: "Yes. Add any cost as a line item in the quote. The total reflects all costs including materials, labour, and subcontractors.",
          },
          {
            q: "Can customers see project timelines?",
            a: "When you schedule a job, the dates are visible on the job record. For project visibility, share the completed quote PDF or use the public share link.",
          },
        ]}
      />
    </TradePageLayout>
  );
}
