import type { Metadata } from "next";
import Link from "next/link";
import { Breadcrumbs } from "../../components/seo/Breadcrumbs";
import { CTA } from "../../components/seo/CTA";

export const metadata: Metadata = {
  title: "Electrician Quote Software | Create Quotes Fast | JobStacker",
  description: "Electrician quote software that creates professional quotes with materials, labour and VAT. Send PDFs or share links. Free to use.",
  alternates: { canonical: "https://jobstacker.app/electrician-quote-software" },
};

export default function Page() {
  return (
    <section style={{ maxWidth: 800, margin: "0 auto", padding: "40px 20px" }}>
      <Breadcrumbs items={{{ label: "Home", href: "/" }, {{ label: "Electrician Quote Software" }}}} />
      <h1 style={{ fontSize: 34, fontWeight: 800, lineHeight: 1.15, marginBottom: 12 }}>Electrician Quote Software</h1>
      <p style={{ fontSize: 18, color: "var(--text-muted)", lineHeight: 1.7, marginBottom: 32 }}>Create professional electrical quotes with line items for materials, labour, call-out fees and VAT. Send as PDFs or share links that customers can accept online.</p>
      <div style={{ fontSize: 16, color: "var(--text)", lineHeight: 1.8 }}>
        <p style={{ marginBottom: 14 }}>Electricians need quote software that understands how electrical work is priced. You need to itemise materials (cable, sockets, consumer units), labour (hourly rate or fixed), call-out fees, and any additional costs like certification or testing. JobStacker handles all of this with real-time totals that update as you add items. The customer receives a professional PDF with your logo, company details, and a clear breakdown. They can accept online with one tap, and when they do, the job appears on your calendar automatically.</p>
      </div>
      <CTA />
    </section>
  );
}
