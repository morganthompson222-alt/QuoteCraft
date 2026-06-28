import type { Metadata } from "next";
import Link from "next/link";
import { Breadcrumbs } from "../../components/seo/Breadcrumbs";
import { FAQ } from "../../components/seo/FAQ";
import { CTA } from "../../components/seo/CTA";

export const metadata: Metadata = {
  title: "Quoting Guide for Tradespeople | Pricing & Estimates | JobStacker",
  description:
    "Learn how to create professional quotes that win work. Pricing strategies, common mistakes, and quoting software for electricians, plumbers, builders and more.",
  alternates: { canonical: "https://jobstacker.app/quoting-guide-for-tradespeople" },
};

export default function Page() {
  return (
    <section style={{ maxWidth: 800, margin: "0 auto", padding: "40px 20px" }}>
      <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Quoting Guide for Tradespeople" }]} />

      <h1 style={{ fontSize: 36, fontWeight: 800, lineHeight: 1.15, marginBottom: 16 }}>
        Quoting Guide for Tradespeople
      </h1>
      <p style={{ fontSize: 18, color: "var(--text-muted)", lineHeight: 1.7, marginBottom: 32 }}>
        How to write quotes that win work, price jobs profitably, and avoid the mistakes that cost tradespeople money every day.
      </p>

      <h2>Why quoting well matters more than anything</h2>
      <p>
        Your quote is the first professional document most customers see from your business. It's your sales pitch, your contract, and your brand — all in one page. A messy quote loses jobs. A professional quote wins them. It's that simple.
      </p>

      <h2>What every trade quote must include</h2>
      <p>
        A professional quote should have: your company name, address, phone number and logo; the customer's name and address; a unique quote number; detailed breakdown of work; itemised costs for labour and materials; total including VAT; payment terms; valid-until date; and your terms and conditions.
      </p>
      <p>
        Most tradespeople miss at least half of these. Use <Link href="/quote-software">JobStacker's quoting software</Link> to include everything automatically.
      </p>

      <h2>Pricing strategies for tradespeople</h2>
      <p>
        Get your pricing wrong and you either lose the job or lose money on it. The three most common pricing models are: fixed price (best for defined jobs like a boiler service), day rate (best for projects with uncertain scope), and time and materials (best for emergency work where you can't predict what you'll find).
      </p>
      <p>
        <Link href="/blog/how-to-price-electrical-work">Read the full guide to pricing electrical work</Link> — includes example calculations and markups.
      </p>

      <h2>Common quoting mistakes (and how to avoid them)</h2>
      <ul style={{ lineHeight: 2, paddingLeft: 20 }}>
        <li><strong>Under-pricing materials</strong> — always add 20% for wastage and trips to the merchant.</li>
        <li><strong>Forgetting admin time</strong> — quoting, buying materials, and doing paperwork takes time. Bill for it.</li>
        <li><strong>No valid-until date</strong> — prices change. Always include a 14 or 30-day expiry on your quotes.</li>
        <li><strong>Not following up</strong> — 80% of sales need 5+ follow-ups. Send a reminder after 7 days.</li>
        <li><strong>Handwritten quotes</strong> — they look unprofessional and are easy to lose. Use digital quotes instead.</li>
      </ul>

      <h2>How quoting software helps</h2>
      <p>
        JobStacker creates itemised quotes with tax, line items for labour and materials, and automatic totals. Send them as branded PDFs or share links. Customers can accept online, and when they do, the job appears on your calendar automatically. No re-typing, no lost paper, no forgotten follow-ups.
      </p>
      <p>
        <Link href="/quote-software">Try JobStacker's quote software</Link> — <Link href="/crm-for-electricians">for electricians</Link> | <Link href="/crm-for-plumbers">for plumbers</Link> | <Link href="/crm-for-builders">for builders</Link>
      </p>
      <p>
        <Link href="/blog/how-to-write-a-professional-plumbing-quote">How to write a professional plumbing quote</Link>
      </p>

      <FAQ items={[
        { q: "Should I include VAT on my quotes?", a: "Yes. Always show the VAT amount separately on your quotes. It's professional and expected by UK customers." },
        { q: "How long should a quote be valid for?", a: "14-30 days is standard. Material prices change, so don't leave quotes open indefinitely." },
        { q: "How do I follow up on a quote without being pushy?", a: "Send a friendly email after 7 days: 'Just checking you received the quote. Happy to answer any questions.' " },
        { q: "Can I send quotes from my phone?", a: "Yes. JobStacker works on any device. Create and send quotes from the job site." },
      ]} />
      <CTA />
    </section>
  );
}
