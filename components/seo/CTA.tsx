import Link from "next/link";

export function CTA() {
  return (
    <section
      style={{
        marginTop: 48,
        padding: "48px 32px",
        background: "#0f172a",
        borderRadius: 16,
        textAlign: "center",
      }}
    >
      <h2 style={{ fontSize: 28, fontWeight: 800, color: "#fff", margin: "0 0 12px" }}>
        Ready to simplify your business?
      </h2>
      <p style={{ fontSize: 16, color: "#94a3b8", margin: "0 0 28px", maxWidth: 500, marginLeft: "auto", marginRight: "auto" }}>
        Join tradespeople who use JobStacker to manage customers, quotes, jobs, and invoicing — all from one platform.
      </p>
      <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
        <Link
          href="/signup"
          style={{
            padding: "14px 32px",
            background: "#047857",
            color: "#fff",
            borderRadius: 8,
            fontSize: 15,
            fontWeight: 700,
            textDecoration: "none",
          }}
        >
          Start free
        </Link>
        <Link
          href="/login"
          style={{
            padding: "14px 28px",
            border: "1px solid rgba(255,255,255,0.2)",
            color: "#fff",
            borderRadius: 8,
            fontSize: 15,
            fontWeight: 600,
            textDecoration: "none",
          }}
        >
          Log in
        </Link>
      </div>
    </section>
  );
}
