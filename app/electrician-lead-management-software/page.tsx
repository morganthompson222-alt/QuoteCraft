import type { Metadata } from "next";
import Link from "next/link";
import { Breadcrumbs } from "../../components/seo/Breadcrumbs";
import { CTA } from "../../components/seo/CTA";

export const metadata: Metadata = {
  title: "Electrician Lead Management Software | JobStacker",
  description:
    "Electrician lead management software that helps you track enquiries, send quotes, and convert more customers. Stop losing leads to slow follow-ups.",
  alternates: { canonical: "https://jobstacker.app/electrician-lead-management-software" },
};

export default function Page() {
  return (
    <section style={{ maxWidth: 800, margin: "0 auto", padding: "40px 20px" }}>
      <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Electrician Lead Management Software" }]} />
      <h1 style={{ fontSize: 36, fontWeight: 800, lineHeight: 1.15, marginBottom: 16 }}>Electrician Lead Management Software</h1>
      <p style={{ fontSize: 18, color: "var(--text-muted)", lineHeight: 1.7, marginBottom: 32 }}>
        Every lead you lose is money left on the table. JobStacker helps electricians track, follow up, and convert more enquiries into paid jobs.
      </p>

      <h2>Why electricians lose leads</h2>
      <p>Slow response times, forgotten follow-ups, and unprofessional quotes cost electricians thousands every year. Most electrical businesses don't have a system — they rely on memory and WhatsApp messages. When you're busy on a job, leads go unanswered.</p>

      <h2>How JobStacker helps</h2>
      <ul style={{ lineHeight: 2, paddingLeft: 20 }}>
        <li><strong>Instant quoting</strong> — create a quote in under 2 minutes and send a share link before the customer hangs up.</li>
        <li><strong>Follow-up reminders</strong> — see every outstanding quote and who hasn't responded.</li>
        <li><strong>Customer history</strong> — see every previous job, quote, and note for returning customers.</li>
        <li><strong>Mobile-ready</strong> — manage leads from your phone while you're on the job.</li>
      </ul>
      <div style={{ marginTop: 24, marginBottom: 24 }}>
        <Link href="/crm-for-electricians">CRM for electricians →</Link> &nbsp;|&nbsp;
        <Link href="/leads-for-tradespeople">Lead generation guide →</Link> &nbsp;|&nbsp;
        <Link href="/blog/how-electricians-can-get-more-leads">How electricians get more leads →</Link>
      </div>
      <CTA />
    </section>
  );
}
