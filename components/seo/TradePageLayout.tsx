import type { ReactNode } from "react";
import Link from "next/link";
import { Breadcrumbs } from "./Breadcrumbs";
import { CTA } from "./CTA";

type Props = {
  trade: string;
  children: ReactNode;
  faq?: ReactNode;
};

export function TradePageLayout({ trade, children, faq }: Props) {
  const slug = trade.toLowerCase().replace(/\s+/g, "-");
  const relatedTrades: Record<string, string[]> = {
    electricians: ["plumbers", "builders", "contractors"],
    plumbers: ["electricians", "builders", "roofers"],
    builders: ["electricians", "plumbers", "carpenters"],
    landscapers: ["gardeners", "tree-surgeons", "pressure-washing"],
    gardeners: ["landscapers", "tree-surgeons", "pressure-washing"],
    "window-cleaners": ["pressure-washing", "cleaners"],
    roofers: ["builders", "painters", "electricians"],
    painters: ["handymen", "builders", "carpenters"],
    "tree-surgeons": ["gardeners", "landscapers", "pressure-washing"],
    "pressure-washing": ["window-cleaners", "landscapers"],
    contractors: ["electricians", "plumbers", "builders"],
    handymen: ["electricians", "plumbers", "painters"],
    carpenters: ["builders", "painters", "electricians"],
    cleaners: ["window-cleaners", "handymen", "property-maintenance"],
    "driveway-cleaners": ["pressure-washing", "window-cleaners"],
    "fencing-contractors": ["landscapers", "gardeners", "builders"],
    "property-maintenance": ["handymen", "painters", "builders"],
    decorators: ["painters", "handymen", "carpenters"],
    hvac: ["electricians", "plumbers", "builders"],
    "pest-control": ["cleaners", "handymen", "property-maintenance"],
    "pool-maintenance": ["landscapers", "gardeners"],
  };

  const related = relatedTrades[slug] ?? [];
  const featureLinks = [
    { href: "/quote-software", label: "Quote software" },
    { href: "/invoice-software", label: "Invoice software" },
    { href: "/job-management-software", label: "Job management" },
    { href: "/scheduling-software", label: "Scheduling" },
  ];

  return (
    <section className="workspace-page" style={{ maxWidth: 800, margin: "0 auto", padding: "40px 20px" }}>
      <Breadcrumbs
        items={[
          { label: "Home", href: "/" },
          { label: `CRM for ${trade.charAt(0).toUpperCase() + trade.slice(1).replace(/-/g, " ")}` },
        ]}
      />

      {children}
      {faq}

      <div
        style={{
          marginTop: 40,
          padding: 24,
          background: "var(--surface)",
          borderRadius: 12,
          border: "1px solid var(--border)",
        }}
      >
        <h3 style={{ fontWeight: 700, marginBottom: 12 }}>Explore related trades</h3>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
          {related.map((r) => (
            <Link
              key={r}
              href={`/crm-for-${r}`}
              style={{
                padding: "6px 14px",
                background: "var(--surface-muted)",
                borderRadius: 6,
                fontSize: 13,
                color: "var(--text)",
                textDecoration: "none",
              }}
            >
              {r.charAt(0).toUpperCase() + r.slice(1).replace(/-/g, " ")}
            </Link>
          ))}
        </div>
      </div>

      <div
        style={{
          marginTop: 16,
          padding: 24,
          background: "var(--surface)",
          borderRadius: 12,
          border: "1px solid var(--border)",
        }}
      >
        <h3 style={{ fontWeight: 700, marginBottom: 12 }}>JobStacker features</h3>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
          {featureLinks.map((f) => (
            <Link
              key={f.href}
              href={f.href}
              style={{
                padding: "6px 14px",
                background: "var(--surface-muted)",
                borderRadius: 6,
                fontSize: 13,
                color: "var(--text)",
                textDecoration: "none",
              }}
            >
              {f.label}
            </Link>
          ))}
        </div>
      </div>

      <CTA />
    </section>
  );
}
