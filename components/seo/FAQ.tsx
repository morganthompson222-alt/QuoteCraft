type FAQItem = { q: string; a: string };

export function FAQ({ items }: { items: FAQItem[] }) {
  return (
    <section style={{ marginTop: 48, marginBottom: 48 }}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: items.map((item) => ({
              "@type": "Question",
              name: item.q,
              acceptedAnswer: { "@type": "Answer", text: item.a },
            })),
          }),
        }}
      />
      <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: 24, color: "var(--text)" }}>Frequently asked questions</h2>
      <div style={{ display: "grid", gap: 12 }}>
        {items.map((item, i) => (
          <details
            key={i}
            style={{
              border: "1px solid var(--border)",
              borderRadius: 8,
              padding: "16px 20px",
              background: "var(--surface)",
            }}
          >
            <summary style={{ fontWeight: 600, cursor: "pointer", color: "var(--text)", fontSize: 15 }}>
              {item.q}
            </summary>
            <p style={{ marginTop: 12, color: "var(--text-muted)", lineHeight: 1.7, fontSize: 14 }}>
              {item.a}
            </p>
          </details>
        ))}
      </div>
    </section>
  );
}
