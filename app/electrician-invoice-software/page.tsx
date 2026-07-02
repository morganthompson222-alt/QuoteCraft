import type { Metadata } from "next";
import Link from "next/link";
import { Breadcrumbs } from "../../components/seo/Breadcrumbs";
import { CTA } from "../../components/seo/CTA";

export const metadata: Metadata = {
  title: "Electrician Invoice Software | Send Invoices | JobStacker",
  description: "Electrician invoice software. Generate professional invoices from completed jobs, track payments and send reminders. Free to use.",
  alternates: { canonical: "https://jobstacker.app/electrician-invoice-software" },
};

export default function Page() {
  return (
    <section style={{ maxWidth: 800, margin: "0 auto", padding: "40px 20px" }}>
      <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Electrician Invoice Software" }]} />
      <h1 style={{ fontSize: 34, fontWeight: 800, lineHeight: 1.15, marginBottom: 12 }}>Electrician Invoice Software</h1>
      <p style={{ fontSize: 18, color: "var(--text-muted)", lineHeight: 1.7, marginBottom: 32 }}>Turn completed jobs into professional invoices in one click. Track payments, generate receipts, and know who still owes.</p>
      <div style={{ fontSize: 16, color: "var(--text)", lineHeight: 1.8 }}>
        <p style={{ marginBottom: 14 }}>When a job is done, the last thing you want is more paperwork. JobStacker turns your completed jobs into invoices automatically. Mark the job as complete, mark it as paid, and a receipt is generated. The dashboard shows your outstanding payments at a glance so you know exactly who owes what. No separate invoicing tool needed - everything is linked from the original quote through to the job and final payment.</p>
      </div>
      <CTA />
    </section>
  );
}
