import type { Metadata } from "next";
import { TradePageLayout } from "../../components/seo/TradePageLayout";
import { FAQ } from "../../components/seo/FAQ";

export const metadata: Metadata = {
  title: "CRM for Painters & Decorators | Painting Business Software | JobStacker",
  description: "JobStacker helps painters and decorators manage customers, quotes, project scheduling and invoicing. Grow your painting business with less admin.",
  alternates: { canonical: "https://jobstacker.app/crm-for-painters" },
};

export default function Page() {
  return (
    <TradePageLayout trade="painters">
      <h1 style={{ fontSize: 36, fontWeight: 800, lineHeight: 1.15, marginBottom: 16 }}>CRM for Painters & Decorators</h1>
      <p style={{ fontSize: 18, color: "var(--text-muted)", lineHeight: 1.7, marginBottom: 32 }}>Painting and decorating projects range from one-day room refreshes to multi-week house transformations. JobStacker helps you quote, schedule, and invoice every job with ease.</p>
      <h2>Simplify your painting business</h2>
      <p>Painters often work on multiple projects simultaneously — a room here, an exterior there, a commercial project in between. Without a system, it's easy to lose track of quotes sent, deposits owed, and start dates agreed. JobStacker keeps everything organised so you focus on the painting, not the paperwork.</p>
      <h2>Key features</h2>
      <ul style={{ lineHeight: 2, paddingLeft: 20 }}>
        <li><strong>Quick quoting</strong> — estimate paint, materials, and labour per room or per project.</li>
        <li><strong>Project scheduling</strong> — schedule interior and exterior work with appropriate drying time.</li>
        <li><strong>Customer records</strong> — store colour preferences, room measurements, and previous work.</li>
        <li><strong>Payment tracking</strong> — manage deposits, stage payments, and final invoices.</li>
        <li><strong>Mobile-ready</strong> — create estimates on-site and send quotes before you leave.</li>
      </ul>
      <FAQ items={[
        { q: "Can I create quotes by room?", a: "Yes. Itemise each room separately with its own paint, materials, and labour costs." },
        { q: "Can I store customer colour preferences?", a: "Yes. Add notes to any customer record including colours, finishes, and special instructions." },
        { q: "Can I schedule exterior work around weather?", a: "Yes. Flexible scheduling lets you move jobs when weather changes plans." },
      ]} />
    </TradePageLayout>
  );
}
