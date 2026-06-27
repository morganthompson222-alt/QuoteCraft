import type { Metadata } from "next";
import { TradePageLayout } from "../../components/seo/TradePageLayout";
import { FAQ } from "../../components/seo/FAQ";

export const metadata: Metadata = {
  title: "CRM for Roofers | Roofing Business Software | JobStacker",
  description: "JobStacker helps roofers manage customers, quotes, inspections and job scheduling. Run your roofing business from one platform.",
  alternates: { canonical: "https://jobstacker.app/crm-for-roofers" },
};

export default function Page() {
  return (
    <TradePageLayout trade="roofers">
      <h1 style={{ fontSize: 36, fontWeight: 800, lineHeight: 1.15, marginBottom: 16 }}>CRM for Roofers</h1>
      <p style={{ fontSize: 18, color: "var(--text-muted)", lineHeight: 1.7, marginBottom: 32 }}>From emergency repairs to full roof replacements — JobStacker helps roofers quote accurately, schedule work around the weather, and keep customers informed throughout every project.</p>
      <h2>Why roofers need better organisation</h2>
      <p>Roofing projects involve detailed inspections, material estimates, scaffold coordination, and weather-dependent scheduling. A missed detail in a quote can cost you money. A forgotten follow-up can lose you a customer. JobStacker gives you a system for tracking every estimate, every customer, and every job.</p>
      <h2>Features for roofers</h2>
      <ul style={{ lineHeight: 2, paddingLeft: 20 }}>
        <li><strong>Detailed quoting</strong> — itemise materials, labour, scaffold hire, and waste disposal.</li>
        <li><strong>Job scheduling</strong> — flexible scheduling that adapts when weather disrupts plans.</li>
        <li><strong>Customer management</strong> — store property details, access notes, and full job history.</li>
        <li><strong>Payment tracking</strong> — manage deposits and final payments per project.</li>
        <li><strong>PDF quotes</strong> — professional branded quotes for insurance claims and customer approval.</li>
      </ul>
      <FAQ items={[
        { q: "Can I track material costs separately?", a: "Yes. Add materials, labour, scaffold, and waste as separate line items in every quote." },
        { q: "Can I schedule around weather?", a: "Yes. Reschedule jobs easily when weather changes — the calendar updates instantly." },
        { q: "Can customers approve quotes online?", a: "Yes. Every quote gets a share link. Customers accept on their phone with one tap." },
      ]} />
    </TradePageLayout>
  );
}
