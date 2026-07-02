import type { Metadata } from "next";
import Link from "next/link";
import { Breadcrumbs } from "../../components/seo/Breadcrumbs";
import { CTA } from "../../components/seo/CTA";

export const metadata: Metadata = {
  title: "Tradify vs ServiceM8 | UK Trade App Comparison | JobStacker",
  description: "Tradify vs ServiceM8: comparing the two biggest UK trade apps. Features, pricing and which is better for your trade. Plus a free alternative.",
  alternates: { canonical: "https://jobstacker.app/tradify-vs-servicem8" },
};

export default function Page() {
  return (
    <section style={{ maxWidth: 800, margin: "0 auto", padding: "40px 20px" }}>
      <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Tradify vs ServiceM8" }]} />
      <h1 style={{ fontSize: 34, fontWeight: 800, lineHeight: 1.15, marginBottom: 12 }}>Tradify vs ServiceM8</h1>
      <p style={{ fontSize: 18, color: "var(--text-muted)", lineHeight: 1.7, marginBottom: 32 }}>The head-to-head comparison between Tradify and ServiceM8 for UK tradespeople - plus JobStacker as the free alternative.</p>
      <div style={{ fontSize: 16, color: "var(--text)", lineHeight: 1.8 }}>
        <p style={{ marginBottom: 14 }}>Tradify and ServiceM8 are the two biggest players in UK trade software. Tradify is simpler, cleaner, and easier to learn. ServiceM8 has more features but feels dated and complex. Both charge monthly subscriptions with no permanent free tier. JobStacker offers the same core features — quoting, scheduling, customer management, invoicing — with a modern interface, AI quote generation, a finance hub, and a genuinely free tier. Before committing to either Tradify or ServiceM8, try JobStacker free and see if it does what you need without the monthly cost.</p>
      </div>
      <CTA />
    </section>
  );
}
