import type { ReactNode } from "react";
import Link from "next/link";
import { Breadcrumbs } from "./Breadcrumbs";
import { CTA } from "./CTA";
import { FAQ } from "./FAQ";

type ComparisonRow = { feature: string; them: string; us: string };

type Props = {
  breadcrumbs: { label: string; href?: string }[];
  title: string;
  subtitle: string;
  children: ReactNode;
  comparison?: {
    title: string;
    themLabel: string;
    rows: ComparisonRow[];
  };
  related?: { label: string; href: string }[];
  faq?: { q: string; a: string }[];
};

export function CommercialPage({ breadcrumbs, title, subtitle, children, comparison, related, faq }: Props) {
  return (
    <section style={{ maxWidth: 800, margin: "0 auto", padding: "40px 20px" }}>
      <Breadcrumbs items={breadcrumbs} />

      <h1 style={{ fontSize: 34, fontWeight: 800, lineHeight: 1.15, marginBottom: 12 }}>{title}</h1>
      <p style={{ fontSize: 18, color: "var(--text-muted)", lineHeight: 1.7, marginBottom: 32 }}>{subtitle}</p>

      {children}

      {comparison ? (
        <div style={{ marginTop: 40 }}>
          <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 16 }}>{comparison.title}</h2>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "var(--surface-muted)" }}>
                <th style={{ padding: 10, textAlign: "left", borderBottom: "1px solid var(--border)", fontSize: 13 }}>Feature</th>
                <th style={{ padding: 10, textAlign: "center", borderBottom: "1px solid var(--border)", fontSize: 13 }}>{comparison.themLabel}</th>
                <th style={{ padding: 10, textAlign: "center", borderBottom: "1px solid var(--border)", fontSize: 13, color: "var(--brand)" }}>JobStacker</th>
              </tr>
            </thead>
            <tbody>
              {comparison.rows.map((r, i) => (
                <tr key={i} style={{ background: i % 2 === 0 ? "var(--surface)" : "var(--surface-muted)" }}>
                  <td style={{ padding: "8px 10px", borderBottom: "1px solid var(--border)", fontSize: 13 }}>{r.feature}</td>
                  <td style={{ padding: "8px 10px", textAlign: "center", borderBottom: "1px solid var(--border)", fontSize: 13 }}>{r.them}</td>
                  <td style={{ padding: "8px 10px", textAlign: "center", borderBottom: "1px solid var(--border)", fontSize: 13, color: "var(--brand)", fontWeight: 600 }}>{r.us}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}

      {related ? (
        <div style={{ marginTop: 40, padding: 20, background: "var(--surface)", borderRadius: 10, border: "1px solid var(--border)" }}>
          <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 12 }}>Explore more</h3>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {related.map((r) => (
              <Link key={r.href} href={r.href} style={{ padding: "6px 14px", background: "var(--surface-muted)", borderRadius: 6, fontSize: 13, color: "var(--text)", textDecoration: "none" }}>{r.label}</Link>
            ))}
          </div>
        </div>
      ) : null}

      {faq ? <FAQ items={faq} /> : null}
      <CTA />
    </section>
  );
}
