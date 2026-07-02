import type { Metadata } from "next";
import Link from "next/link";
import { Breadcrumbs } from "../../components/seo/Breadcrumbs";
import { CTA } from "../../components/seo/CTA";

export const metadata: Metadata = {
  title: "Trade Business App | All-in-One | JobStacker",
  description: "Trade business app for managing customers, quotes, jobs and invoices. The all-in-one app for tradespeople. Free to start.",
  alternates: { canonical: "https://jobstacker.app/trade-business-app" },
};

export default function Page() {
  return (
    <section style={{ maxWidth: 800, margin: "0 auto", padding: "40px 20px" }}>
      <Breadcrumbs items={{{ label: "Home", href: "/" }, {{ label: "Trade Business App" }}}} />
      <h1 style={{ fontSize: 34, fontWeight: 800, lineHeight: 1.15, marginBottom: 12 }}>Trade Business App</h1>
      <p style={{ fontSize: 18, color: "var(--text-muted)", lineHeight: 1.7, marginBottom: 32 }}>One app for your entire trade business. Customers, quotes, jobs, invoices, scheduling - all in one place. Free to start. Works on any device.</p>
      <div style={{ fontSize: 16, color: "var(--text)", lineHeight: 1.8 }}>
        <p style={{ marginBottom: 14 }}>Instead of juggling a notebook for customers, Word for quotes, a paper diary for scheduling, and a separate system for invoices - JobStacker is the all-in-one trade business app that does everything. Store customer records. Create professional quotes with PDF export. Schedule jobs on a calendar. Track invoices and payments. All from one app that works on your phone, tablet, or computer. Free to start with no credit card.</p>
      </div>
      <CTA />
    </section>
  );
}
