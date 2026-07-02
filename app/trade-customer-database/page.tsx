import type { Metadata } from "next";
import Link from "next/link";
import { Breadcrumbs } from "../../components/seo/Breadcrumbs";
import { CTA } from "../../components/seo/CTA";

export const metadata: Metadata = {
  title: "Trade Customer Database | Organise Your Customers | JobStacker",
  description: "Trade customer database software. Store customer details, job history and communication records. Searchable, accessible from any device.",
  alternates: { canonical: "https://jobstacker.app/trade-customer-database" },
};

export default function Page() {
  return (
    <section style={{ maxWidth: 800, margin: "0 auto", padding: "40px 20px" }}>
      <Breadcrumbs items={{{ label: "Home", href: "/" }, {{ label: "Trade Customer Database" }}}} />
      <h1 style={{ fontSize: 34, fontWeight: 800, lineHeight: 1.15, marginBottom: 12 }}>Trade Customer Database</h1>
      <p style={{ fontSize: 18, color: "var(--text-muted)", lineHeight: 1.7, marginBottom: 32 }}>Stop losing customer details in notebooks and spreadsheets. A proper customer database that's searchable and accessible from your phone.</p>
      <div style={{ fontSize: 16, color: "var(--text)", lineHeight: 1.8 }}>
        <p style={{ marginBottom: 14 }}>A customer database for tradespeople needs to be more than a contact list. It needs to store full addresses, phone numbers, email, and every quote, job, and payment linked to that customer. JobStacker's customer database does all of this. Search by name, company, postcode, or phone number. See the full history of every customer interaction - every quote sent, every job completed, every payment received. All accessible from your phone when you're on site.</p>
      </div>
      <CTA />
    </section>
  );
}
