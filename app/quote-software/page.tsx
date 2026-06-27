import type { Metadata } from "next";
import Link from "next/link";
import { Breadcrumbs } from "../../components/seo/Breadcrumbs";
import { FAQ } from "../../components/seo/FAQ";
import { CTA } from "../../components/seo/CTA";

export const metadata: Metadata = {
  title: "Quote Software for Tradespeople | Create Quotes Fast | JobStacker",
  description:
    "JobStacker quote software helps tradespeople create professional quotes in minutes. Send PDFs, share links, and get customer approval online. Free to start.",
  alternates: { canonical: "https://jobstacker.app/quote-software" },
};

export default function Page() {
  return (
    <section style={{ maxWidth: 800, margin: "0 auto", padding: "40px 20px" }}>
      <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Quote Software" }]} />
      <h1 style={{ fontSize: 36, fontWeight: 800, lineHeight: 1.15, marginBottom: 16 }}>Quote Software for Tradespeople</h1>
      <p style={{ fontSize: 18, color: "var(--text-muted)", lineHeight: 1.7, marginBottom: 32 }}>
        Stop writing quotes by hand. JobStacker lets you create professional, itemised quotes in minutes — send them as PDFs or share links, and get approved faster.
      </p>
      <h2>Why switch to quoting software?</h2>
      <p>Handwritten quotes are slow, hard to read, and easy to lose. If you're still writing quotes by hand or typing them into Word documents, you're wasting hours every week. Quoting software does the maths for you, stores every quote permanently, and lets customers approve with one click.</p>
      <h2>Key features</h2>
      <ul style={{ lineHeight: 2, paddingLeft: 20 }}>
        <li><strong>Line-item quotes</strong> — add items with descriptions, quantities, and unit prices. Total updates automatically.</li>
        <li><strong>Tax and discounts</strong> — set your default tax rate and apply discounts per quote.</li>
        <li><strong>PDF export</strong> — download branded PDFs with your logo, company details, and payment terms.</li>
        <li><strong>Share links</strong> — customers open the quote on any device and accept with one tap.</li>
        <li><strong>AI-assisted quoting</strong> — describe the job and let AI generate a full quote with pricing.</li>
        <li><strong>Quote history</strong> — every quote you've ever sent is stored and searchable.</li>
      </ul>
      <h2>How it works</h2>
      <p>Select a customer, add line items for your work, set the tax rate, and add any notes. The total updates as you type. Send a PDF or share link with one click. When the customer accepts, the job appears on your calendar automatically.</p>
      <div style={{ marginTop: 32 }}>Explore how different trades use it: <Link href="/crm-for-electricians">Electricians</Link> | <Link href="/crm-for-plumbers">Plumbers</Link> | <Link href="/crm-for-builders">Builders</Link> | <Link href="/crm-for-landscapers">Landscapers</Link></div>
      <FAQ items={[
        { q: "Can I customise the quote template?", a: "Yes. Your company name, logo, phone number, and address appear on every quote PDF automatically." },
        { q: "Can customers accept quotes online?", a: "Yes. Every quote has a share link. Customers open it on any device and accept or decline with one tap." },
        { q: "Is there a limit on how many quotes I can create?", a: "No limits on free or paid plans. Create as many quotes as you need." },
      ]} />
      <CTA />
    </section>
  );
}
