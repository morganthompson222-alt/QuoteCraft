import type { Metadata } from "next";
import { TradePageLayout } from "../../components/seo/TradePageLayout";
import { FAQ } from "../../components/seo/FAQ";

export const metadata: Metadata = {
  title: "CRM for Carpenters & Joiners | Carpentry Business Software | JobStacker",
  description: "JobStacker helps carpenters and joiners manage customers, project quotes, material estimates and job scheduling. Run your carpentry business from one place.",
  alternates: { canonical: "https://jobstacker.app/crm-for-carpenters" },
};

export default function Page() {
  return (
    <TradePageLayout trade="carpenters">
      <h1 style={{ fontSize: 36, fontWeight: 800, lineHeight: 1.15, marginBottom: 16 }}>CRM for Carpenters & Joiners</h1>
      <p style={{ fontSize: 18, color: "var(--text-muted)", lineHeight: 1.7, marginBottom: 32 }}>From kitchen fitting to bespoke joinery — JobStacker helps carpenters quote accurately on materials and labour, schedule work, and keep customers updated.</p>
      <h2>Accuracy matters in carpentry</h2>
      <p>Carpentry quotes depend on accurate material estimates. Under-quote on timber and your profit disappears. Over-quote and you lose the job. JobStacker gives you a clear, itemised quote structure so every cost is accounted for.</p>
      <h2>Key features</h2>
      <ul style={{ lineHeight: 2, paddingLeft: 20 }}>
        <li><strong>Itemised quoting</strong> — separate materials (timber, fixings, finishings) from labour.</li>
        <li><strong>Project scheduling</strong> — schedule kitchen fits, wardrobe installations, and bespoke projects.</li>
        <li><strong>Customer management</strong> — store measurements, material preferences, and project specifications.</li>
        <li><strong>Deposit tracking</strong> — take deposits on material orders before work begins.</li>
        <li><strong>PDF export</strong> — professional quotes that build confidence with homeowners and contractors.</li>
      </ul>
      <FAQ items={[
        { q: "Can I track material costs separately from labour?", a: "Yes. Every quote item has a description, quantity, and unit price — separate materials from labour easily." },
        { q: "Can I store customer measurements?", a: "Yes. Add notes to any customer record including room measurements and specific requirements." },
        { q: "Can customers approve quotes online?", a: "Yes. Send a share link and customers can view and accept the quote on any device." },
      ]} />
    </TradePageLayout>
  );
}
