import type { Metadata } from "next";
import Link from "next/link";
import { Breadcrumbs } from "../../components/seo/Breadcrumbs";
import { CTA } from "../../components/seo/CTA";

export const metadata: Metadata = {
  title: "Free Quote Software for Tradespeople | JobStacker",
  description: "Free quoting software for tradespeople. Create professional quotes, send PDFs and get customer approval online - all free, no credit card required.",
  alternates: { canonical: "https://jobstacker.app/free-quote-software" },
};

export default function Page() {
  return (
    <section style={{ maxWidth: 800, margin: "0 auto", padding: "40px 20px" }}>
      <Breadcrumbs items={{{ label: "Home", href: "/" }, {{ label: "Free Quote Software" }}}} />
      <h1 style={{ fontSize: 34, fontWeight: 800, lineHeight: 1.15, marginBottom: 12 }}>Free Quote Software</h1>
      <p style={{ fontSize: 18, color: "var(--text-muted)", lineHeight: 1.7, marginBottom: 32 }}>Create professional, itemised quotes in minutes with free quoting software built for tradespeople. No trial, no credit card - just quotes that win work.</p>
      <div style={{ fontSize: 16, color: "var(--text)", lineHeight: 1.8 }}>
        <p style={{ marginBottom: 14 }}>Why pay for quote software when you can get it free? JobStacker's free tier includes full quoting with line items, VAT, materials and labour breakdowns, PDF export with your company branding, and share links that customers can open on their phone and accept with one tap. There's no catch - no time limit, no credit card required. The paid plans add AI quote generation which helps you create quotes faster, but the core quoting engine is completely free. If you're still handwriting quotes or typing them in Word, switch today.</p>
      </div>
      <CTA />
    </section>
  );
}
