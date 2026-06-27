import type { Metadata } from "next";
import { TradePageLayout } from "../../components/seo/TradePageLayout";
import { FAQ } from "../../components/seo/FAQ";

export const metadata: Metadata = {
  title: "CRM for Landscapers | Landscape Business Software | JobStacker",
  description:
    "JobStacker helps landscapers manage customers, quotes, garden design projects and scheduling. Run your landscape business from your phone.",
  alternates: { canonical: "https://jobstacker.app/crm-for-landscapers" },
};

export default function Page() {
  return (
    <TradePageLayout trade="landscapers">
      <h1 style={{ fontSize: 36, fontWeight: 800, lineHeight: 1.15, marginBottom: 16 }}>
        CRM for Landscapers
      </h1>
      <p style={{ fontSize: 18, color: "var(--text-muted)", lineHeight: 1.7, marginBottom: 32 }}>
        From patio installations to full garden redesigns — JobStacker helps landscapers quote accurately, schedule efficiently, and keep customers informed throughout every project.
      </p>

      <h2>Why landscapers need dedicated software</h2>
      <p>
        Landscaping projects are unique every time. Different materials, different site conditions, different customer expectations. Quoting accurately requires factoring in materials, labour, plant hire, and waste removal. Then you need to schedule the work around weather, supplier lead times, and customer availability.
      </p>
      <p>
        JobStacker gives you a complete view of your business. See upcoming jobs, track which quotes are outstanding, and know exactly how much revenue you have in the pipeline — all from one dashboard.
      </p>

      <h2>Features that matter for landscaping</h2>
      <ul style={{ lineHeight: 2, paddingLeft: 20 }}>
        <li><strong>Detailed quoting</strong> — itemise materials (paving slabs, gravel, plants), labour, plant hire, and waste disposal.</li>
        <li><strong>Schedule by weather</strong> — flexible scheduling so you can move jobs when weather disrupts plans.</li>
        <li><strong>Customer history</strong> — look up past work, previous quotes, and customer preferences instantly.</li>
        <li><strong>Deposit management</strong> — take deposits on material orders and track payments.</li>
        <li><strong>Mobile-ready</strong> — create quotes on-site, show customers the breakdown on your phone, and send instantly.</li>
      </ul>

      <FAQ
        items={[
          {
            q: "Can I add photos to quotes?",
            a: "Not directly in quotes yet, but you can describe the work in detail. Photos can be added to the PDF export via your logo.",
          },
          {
            q: "Can I schedule recurring maintenance?",
            a: "Yes. Create recurring jobs for weekly mowing, monthly maintenance, or seasonal garden care.",
          },
          {
            q: "Does it work for hardscaping and softscaping?",
            a: "Yes. Quote items are fully customisable. Add any material or service with its own price and quantity.",
          },
          {
            q: "Can customers approve quotes online?",
            a: "Yes. Every quote gets a public share link. Customers open it on their phone, see the full breakdown, and accept with one tap.",
          },
        ]}
      />
    </TradePageLayout>
  );
}
