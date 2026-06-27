import type { Metadata } from "next";
import { TradePageLayout } from "../../components/seo/TradePageLayout";
import { FAQ } from "../../components/seo/FAQ";

export const metadata: Metadata = {
  title: "CRM for Window Cleaners | Window Cleaning Software | JobStacker",
  description:
    "JobStacker helps window cleaners manage round schedules, customer payments, and recurring jobs. Run your window cleaning round without the paperwork.",
  alternates: { canonical: "https://jobstacker.app/crm-for-window-cleaners" },
};

export default function Page() {
  return (
    <TradePageLayout trade="window-cleaners">
      <h1 style={{ fontSize: 36, fontWeight: 800, lineHeight: 1.15, marginBottom: 16 }}>CRM for Window Cleaners</h1>
      <p style={{ fontSize: 18, color: "var(--text-muted)", lineHeight: 1.7, marginBottom: 32 }}>
        Running a window cleaning round means managing dozens of regular customers, remembering who's paid, who's overdue, and whose windows are due this week. JobStacker makes it simple.
      </p>
      <h2>Manage your round, not your paperwork</h2>
      <p>Window cleaning is a recurring business. Most customers want the same service every 2, 4, or 8 weeks. Tracking these schedules, remembering who's paid, and managing new enquiries is difficult with paper rounds or memory alone. JobStacker lets you store your full customer round, set recurring schedules, and track payments — all from your phone.</p>
      <h2>Key features</h2>
      <ul style={{ lineHeight: 2, paddingLeft: 20 }}>
        <li><strong>Recurring schedules</strong> — set every 2, 4, or 8 weeks per customer.</li>
        <li><strong>Payment tracking</strong> — mark jobs as paid and see who's overdue at a glance.</li>
        <li><strong>Customer notes</strong> — store access codes, gate codes, dog warnings, and special instructions.</li>
        <li><strong>New customer quotes</strong> — create quick quotes for one-off cleans or new regulars.</li>
        <li><strong>Calendar view</strong> — plan your week and see which jobs are coming up.</li>
      </ul>
      <FAQ items={[
        { q: "Can I import my existing customer list?", a: "You can add customers one by one or quickly enter them on the go. There's no bulk import yet, but adding 30 customers takes about 10 minutes." },
        { q: "Does it work on my phone?", a: "Yes. Add JobStacker to your home screen and it works like a native app. Works on iPhone and Android." },
        { q: "Can customers pay through the app?", a: "You can mark jobs as paid and track payments. Online payment processing is coming soon." },
      ]} />
    </TradePageLayout>
  );
}
