import type { Metadata } from "next";
import Link from "next/link";
import { Breadcrumbs } from "../../components/seo/Breadcrumbs";
import { CTA } from "../../components/seo/CTA";

export const metadata: Metadata = {
  title: "Jobber vs Tradify | Honest Comparison 2026 | JobStacker",
  description: "Jobber vs Tradify: which is better for UK tradespeople? We compare features, pricing and usability. Plus a free alternative to both.",
  alternates: { canonical: "https://jobstacker.app/jobber-vs-tradify" },
};

export default function Page() {
  return (
    <section style={{ maxWidth: 800, margin: "0 auto", padding: "40px 20px" }}>
      <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Jobber vs Tradify" }]} />
      <h1 style={{ fontSize: 34, fontWeight: 800, lineHeight: 1.15, marginBottom: 12 }}>Jobber vs Tradify</h1>
      <p style={{ fontSize: 18, color: "var(--text-muted)", lineHeight: 1.7, marginBottom: 32 }}>The honest comparison between Jobber and Tradify for UK tradespeople — features, pricing, pros, cons, and a free alternative.</p>
      <div style={{ fontSize: 16, color: "var(--text)", lineHeight: 1.8 }}>
        <p style={{ marginBottom: 14 }}>Jobber and Tradify are two of the biggest names in trade software. Jobber is US-based with a broad feature set and strong brand. Tradify is UK-based with a simpler interface and trade-specific focus. Both are solid products, but both have drawbacks: Jobber is expensive for UK users and doesn't always handle GBP/VAT smoothly. Tradify lacks AI features and doesn't have a genuinely free tier - just a limited trial. JobStacker combines the best of both: UK-built like Tradify, feature-rich like Jobber, plus AI quoting, a finance hub, and a genuinely free tier with no time limit. If you're choosing between them, consider the free alternative first.</p>
      </div>
      <CTA />
    </section>
  );
}
