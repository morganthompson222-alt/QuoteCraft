import type { Metadata } from "next";
import Link from "next/link";
import { Breadcrumbs } from "../../components/seo/Breadcrumbs";
import { CTA } from "../../components/seo/CTA";

export const metadata: Metadata = {
  title: "Trade Lead Tracking | Never Lose a Customer | JobStacker",
  description: "Trade lead tracking software. Track every enquiry, follow up automatically and convert more leads into paying customers. Free to start.",
  alternates: { canonical: "https://jobstacker.app/trade-lead-tracking" },
};

export default function Page() {
  return (
    <section style={{ maxWidth: 800, margin: "0 auto", padding: "40px 20px" }}>
      <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Trade Lead Tracking" }]} />
      <h1 style={{ fontSize: 34, fontWeight: 800, lineHeight: 1.15, marginBottom: 12 }}>Trade Lead Tracking</h1>
      <p style={{ fontSize: 18, color: "var(--text-muted)", lineHeight: 1.7, marginBottom: 32 }}>Stop losing potential customers. Track every enquiry, follow up on every quote, and convert more leads into paid work.</p>
      <div style={{ fontSize: 16, color: "var(--text)", lineHeight: 1.8 }}>
        <p style={{ marginBottom: 14 }}>The average tradesperson loses 60% of enquiries because they're too slow to respond or forget to follow up. JobStacker's lead tracking shows every outstanding quote, every customer who hasn't responded, and every follow-up that's due. You can see at a glance which leads need attention and which are ready to convert. Combined with the quoting tool, you can send a professional quote within minutes of a customer calling - before they call your competitor.</p>
      </div>
      <CTA />
    </section>
  );
}
