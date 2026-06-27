import type { Metadata } from "next";
import Link from "next/link";
import { Breadcrumbs } from "../../components/seo/Breadcrumbs";
import { FAQ } from "../../components/seo/FAQ";
import { CTA } from "../../components/seo/CTA";

export const metadata: Metadata = {
  title: "Invoice Software for Tradespeople | Send Invoices Fast | JobStacker",
  description:
    "JobStacker invoice software helps tradespeople create and send professional invoices. Track payments, send reminders, and get paid faster. Free to start.",
  alternates: { canonical: "https://jobstacker.app/invoice-software" },
};

export default function Page() {
  return (
    <section style={{ maxWidth: 800, margin: "0 auto", padding: "40px 20px" }}>
      <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Invoice Software" }]} />
      <h1 style={{ fontSize: 36, fontWeight: 800, lineHeight: 1.15, marginBottom: 16 }}>Invoice Software for Tradespeople</h1>
      <p style={{ fontSize: 18, color: "var(--text-muted)", lineHeight: 1.7, marginBottom: 32 }}>
        Send professional invoices, track payments, and know exactly who owes what. JobStacker keeps your invoicing organised so you get paid faster.
      </p>
      <h2>Get paid without the hassle</h2>
      <p>Chasing payments is one of the biggest frustrations for tradespeople. With JobStacker, every quote can be marked as paid, receipts are generated automatically, and you always know which customers still owe money.</p>
      <h2>Key features</h2>
      <ul style={{ lineHeight: 2, paddingLeft: 20 }}>
        <li><strong>Invoice from quotes</strong> — when a quote is accepted, it's ready to invoice. No re-typing.</li>
        <li><strong>Payment tracking</strong> — mark jobs as paid and see your outstanding balances at a glance.</li>
        <li><strong>Receipt generation</strong> — download a PDF receipt for every paid invoice.</li>
        <li><strong>Payment reminders</strong> — download reminder PDFs for overdue payments.</li>
        <li><strong>Revenue dashboard</strong> — see your total revenue, outstanding payments, and monthly trends.</li>
      </ul>
      <div style={{ marginTop: 32 }}>Related: <Link href="/quote-software">Quote software</Link> | <Link href="/job-management-software">Job management</Link> | <Link href="/scheduling-software">Scheduling</Link></div>
      <FAQ items={[
        { q: "Can I mark invoices as paid?", a: "Yes. One click marks any quote or job as paid. A receipt PDF is generated automatically." },
        { q: "Can I see who hasn't paid?", a: "Yes. The dashboard shows your total revenue and outstanding payments at a glance." },
        { q: "Can I send invoice reminders?", a: "Yes. Download a payment reminder PDF and send it to customers who haven't paid." },
      ]} />
      <CTA />
    </section>
  );
}
