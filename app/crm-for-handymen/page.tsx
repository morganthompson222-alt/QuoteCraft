import type { Metadata } from "next";
import { TradePageLayout } from "../../components/seo/TradePageLayout";
import { FAQ } from "../../components/seo/FAQ";

export const metadata: Metadata = {
  title: "CRM for Handymen | Handyman Business Software | JobStacker",
  description: "JobStacker helps handymen manage customers, quotes, and jobs from one simple app. Stop juggling notebooks and start growing your handyman business.",
  alternates: { canonical: "https://jobstacker.app/crm-for-handymen" },
};

export default function Page() {
  return (
    <TradePageLayout trade="handymen">
      <h1 style={{ fontSize: 36, fontWeight: 800, lineHeight: 1.15, marginBottom: 16 }}>CRM for Handymen</h1>
      <p style={{ fontSize: 18, color: "var(--text-muted)", lineHeight: 1.7, marginBottom: 32 }}>Handymen do everything — and that means your admin is more varied than any other trade. JobStacker adapts to whatever job comes through the door.</p>
      <h2>Built for variety</h2>
      <p>One day you're fixing a leaky tap, the next you're assembling furniture, and the day after you're putting up shelves. Each job is different, each customer is different, and each quote needs to be different. JobStacker lets you create custom quotes for any job in minutes.</p>
      <h2>Key features</h2>
      <ul style={{ lineHeight: 2, paddingLeft: 20 }}>
        <li><strong>Flexible quoting</strong> — any job, any price, any combination of materials and labour.</li>
        <li><strong>Customer management</strong> — store addresses, phone numbers, and job history.</li>
        <li><strong>Simple scheduling</strong> — book jobs and see your week on one calendar.</li>
        <li><strong>Payment tracking</strong> — mark jobs paid and know who still owes.</li>
        <li><strong>PDF quotes</strong> — professional quotes that build trust with new customers.</li>
      </ul>
      <FAQ items={[
        { q: "Can I create a quote in under a minute?", a: "Yes. Pick the customer, add a few line items, and send. The total calculates automatically." },
        { q: "Is it suitable for a one-man business?", a: "Absolutely. JobStacker is designed for sole traders. Simple, fast, no training needed." },
        { q: "Can customers pay by card?", a: "Not yet. You can mark jobs as paid when the customer pays by cash or bank transfer." },
      ]} />
    </TradePageLayout>
  );
}
