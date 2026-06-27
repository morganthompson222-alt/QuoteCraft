import type { Metadata } from "next";
import { TradePageLayout } from "../../components/seo/TradePageLayout";
import { FAQ } from "../../components/seo/FAQ";

export const metadata: Metadata = {
  title: "CRM for Gardeners | Gardening Business Software | JobStacker",
  description:
    "JobStacker helps gardeners manage customers, quotes, recurring maintenance and scheduling. Run your gardening business from your phone — no spreadsheets needed.",
  alternates: { canonical: "https://jobstacker.app/crm-for-gardeners" },
};

export default function Page() {
  return (
    <TradePageLayout trade="gardeners">
      <h1 style={{ fontSize: 36, fontWeight: 800, lineHeight: 1.15, marginBottom: 16 }}>
        CRM for Gardeners
      </h1>
      <p style={{ fontSize: 18, color: "var(--text-muted)", lineHeight: 1.7, marginBottom: 32 }}>
        Whether you do weekly mowing, one-off clearances, or full garden transformations — JobStacker keeps your customers, quotes, and schedules organised so you spend less time on admin.
      </p>
      <h2>Stop losing customers to bad organisation</h2>
      <p>
        Gardening businesses often grow through word of mouth, and before you know it you've got 30+ regular clients, each with different needs, frequencies, and preferences. Remembering who wanted what and when becomes impossible without a system.
      </p>
      <p>
        JobStacker lets you store every customer's details, see their job history, and schedule recurring visits. No more flicking through a diary or trying to remember what Mrs Jones asked you to do last month.
      </p>
      <h2>Key features</h2>
      <ul style={{ lineHeight: 2, paddingLeft: 20 }}>
        <li><strong>Recurring jobs</strong> — set up weekly, fortnightly, or monthly maintenance schedules.</li>
        <li><strong>Quick quoting</strong> — create quotes for one-off clearance, hedge trimming, or planting projects.</li>
        <li><strong>Customer notes</strong> — store preferences, access instructions, and special requirements.</li>
        <li><strong>Calendar view</strong> — see your week at a glance. Move jobs around when weather changes plans.</li>
        <li><strong>Invoice tracking</strong> — mark jobs paid and keep a clean record of your income.</li>
      </ul>
      <FAQ items={[
        { q: "Can I set up recurring quotes?", a: "Yes. Create a quote for regular maintenance and mark it as a recurring job. The schedule repeats automatically." },
        { q: "Can customers book online?", a: "Not directly, but you can send them a quote link and they can accept — which automatically schedules the job." },
        { q: "Is it suitable for sole traders?", a: "Absolutely. JobStacker is designed for sole traders and small teams. Simple to set up, no training needed." },
      ]} />
    </TradePageLayout>
  );
}
