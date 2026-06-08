"use client";

import Link from "next/link";
import { useRegion } from "../hooks/useRegion";

const metrics = [
  { value: "3 min", label: "to send a quote" },
  { value: "1 click", label: "to schedule a job" },
  { value: "PDF", label: "in your client's inbox" },
];

const lineItems = [
  { name: "Site visit & assessment", meta: "Fixed service", amount: 180 },
  { name: "Materials & preparation", meta: "Estimated", amount: 940 },
  { name: "Installation — 2 specialists", meta: "8 hours", amount: 1280 },
];

const mockCustomers = [
  { name: "Alice Johnson", email: "alice@buildco.com", quotes: 5 },
  { name: "Bob's Renovations", email: "bob@renovate.uk", quotes: 12 },
  { name: "Sutton Properties", email: "info@sutton.co.uk", quotes: 3 },
];

const mockQuotes = [
  { number: "Q-1048", customer: "Bayside Ltd", status: "draft", total: 2400 },
  { number: "Q-1047", customer: "Johnson Plumbing", status: "sent", total: 1850 },
  { number: "Q-1046", customer: "Riverside Ltd", status: "accepted", total: 4500 },
];

const mockJobs = [
  { day: 12, jobs: [{ time: "08:00", title: "Fence install — Bayside", color: "#d1fae5", fg: "#065f46" }] },
  { day: 15, jobs: [{ time: "09:00", title: "Deck rebuild — Sutton", color: "#dbeafe", fg: "#1e40af" }] },
  { day: 18, jobs: [{ time: "14:00", title: "Plumbing — Johnson", color: "#fef3c7", fg: "#92400e" }] },
];

function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    draft: "#f1f5f9 #334155",
    sent: "#dbeafe #1e40af",
    accepted: "#d1fae5 #065f46",
  };
  const [bg, fg] = (colors[status] ?? "#f1f5f9 #334155").split(" ");
  return <span style={{ background: bg, color: fg, fontSize: 12, fontWeight: 700, borderRadius: 999, padding: "4px 12px", textTransform: "capitalize" }}>{status}</span>;
}

const GREEN = "#1F6B4F";
const GREEN_LIGHT = "#eefaf4";
const BORDER = "#e5e7eb";
const DARK = "#0f172a";
const MUTED = "#64748b";

function SectionBadge({ text }: { text: string }) {
  return <p style={{ fontSize: 14, fontWeight: 700, color: GREEN, letterSpacing: "0.1em", textTransform: "uppercase", margin: "0 0 16px" }}>{text}</p>;
}

function SectionHeading({ children }: { children: React.ReactNode }) {
  return <h2 style={{ fontSize: "clamp(32px, 5vw, 52px)", fontWeight: 800, lineHeight: 1.15, color: DARK, margin: "0 0 20px" }}>{children}</h2>;
}

function SectionBody({ children }: { children: React.ReactNode }) {
  return <p style={{ fontSize: "clamp(16px, 2.5vw, 20px)", color: MUTED, lineHeight: 1.75, margin: "0 0 32px", maxWidth: 520 }}>{children}</p>;
}

function FeatureList({ items }: { items: string[] }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      {items.map((f) => (
        <div key={f} style={{ display: "flex", alignItems: "flex-start", gap: 12, fontSize: 16, color: "#334155", lineHeight: 1.5 }}>
          <span style={{ color: GREEN, fontWeight: 800, fontSize: 18, flexShrink: 0, marginTop: 1 }}>&#10003;</span>
          {f}
        </div>
      ))}
    </div>
  );
}

const CTA = (
  <Link href="/signup" style={{
    padding: "18px 44px", background: GREEN, color: "#fff", borderRadius: 10, fontSize: 20, fontWeight: 700,
    textDecoration: "none", boxShadow: "0 6px 24px rgba(31,107,79,0.35)", display: "inline-flex", alignItems: "center", gap: 8,
    transition: "transform 0.15s",
  }}>
    Start stacking
    <span style={{ fontSize: 22 }}>&rarr;</span>
  </Link>
);

/* ── mock card chrome: title bar ── */
function CardFrame({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ background: "#fff", borderRadius: 16, border: `1px solid ${BORDER}`, boxShadow: "0 12px 40px rgba(0,0,0,0.08)", overflow: "hidden", width: "100%" }}>
      <div style={{ padding: "14px 20px", borderBottom: `1px solid ${BORDER}`, display: "flex", alignItems: "center", gap: 10, background: "#fafafa" }}>
        <div style={{ display: "flex", gap: 6 }}>
          <div style={{ width: 12, height: 12, borderRadius: 12, background: "#ef4444" }} />
          <div style={{ width: 12, height: 12, borderRadius: 12, background: "#f59e0b" }} />
          <div style={{ width: 12, height: 12, borderRadius: 12, background: "#22c55e" }} />
        </div>
        <span style={{ fontSize: 13, fontWeight: 600, color: MUTED }}>{title}</span>
      </div>
      <div style={{ padding: 28 }}>
        {children}
      </div>
    </div>
  );
}

export default function LandingPage() {
  const { formatCurrency } = useRegion();
  const total = lineItems.reduce((sum, i) => sum + i.amount, 0);

  return (
    <div style={{ background: "#fff" }}>
      {/* ═══════════════════ HERO ═══════════════════ */}
      <section style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "80px 32px", background: "linear-gradient(180deg, #f8fafc 0%, #fff 100%)", position: "relative" }}>
        <div style={{ maxWidth: 1200, width: "100%", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 64, alignItems: "center" }}>
          <div>
            <p style={{ fontSize: 16, fontWeight: 700, color: GREEN, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 16 }}>
              For Tradespeople & Service Teams
            </p>
            <h1 style={{ fontSize: "clamp(40px, 7vw, 68px)", fontWeight: 800, lineHeight: 1.08, color: DARK, margin: "0 0 20px" }}>
              Stack your jobs, quotes, and&nbsp;clients in one&nbsp;place.
            </h1>
            <p style={{ fontSize: "clamp(16px, 2.5vw, 22px)", color: MUTED, lineHeight: 1.7, margin: "0 0 36px", maxWidth: 480 }}>
              The all-in-one workspace for tradespeople. Create quotes, send PDFs, schedule jobs, and manage customers — without touching a spreadsheet.
            </p>
            <div style={{ display: "flex", gap: 16, alignItems: "center", flexWrap: "wrap" }}>
              {CTA}
              <Link href="/login" style={{ padding: "14px 28px", color: "#334155", borderRadius: 10, fontSize: 16, fontWeight: 600, textDecoration: "none", border: `1.5px solid ${BORDER}`, background: "#fff" }}>
                Log in
              </Link>
            </div>
            <div style={{ display: "flex", gap: 40, marginTop: 48 }}>
              {metrics.map((m) => (
                <div key={m.label}>
                  <div style={{ fontSize: 26, fontWeight: 800, color: DARK }}>{m.value}</div>
                  <div style={{ fontSize: 14, color: MUTED, marginTop: 4 }}>{m.label}</div>
                </div>
              ))}
            </div>
          </div>

          <CardFrame title="Dashboard — JobStacker">
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 20 }}>
              <div style={{ padding: "16px 18px", borderRadius: 10, background: GREEN_LIGHT, border: "1px solid #a7f3d0" }}>
                <div style={{ fontSize: 24, fontWeight: 800, color: "#065f46" }}>{formatCurrency(42800)}</div>
                <div style={{ fontSize: 13, color: "#065f46", fontWeight: 600, marginTop: 4 }}>Revenue to date</div>
              </div>
              <div style={{ padding: "16px 18px", borderRadius: 10, background: "#f8fafc", border: `1px solid ${BORDER}` }}>
                <div style={{ fontSize: 24, fontWeight: 800, color: DARK }}>47</div>
                <div style={{ fontSize: 13, color: MUTED, fontWeight: 600, marginTop: 4 }}>Customers</div>
              </div>
              <div style={{ padding: "16px 18px", borderRadius: 10, background: "#f8fafc", border: `1px solid ${BORDER}` }}>
                <div style={{ fontSize: 24, fontWeight: 800, color: DARK }}>8</div>
                <div style={{ fontSize: 13, color: MUTED, fontWeight: 600, marginTop: 4 }}>Open quotes</div>
              </div>
              <div style={{ padding: "16px 18px", borderRadius: 10, background: "#f8fafc", border: `1px solid ${BORDER}` }}>
                <div style={{ fontSize: 24, fontWeight: 800, color: DARK }}>5</div>
                <div style={{ fontSize: 13, color: MUTED, fontWeight: 600, marginTop: 4 }}>Upcoming jobs</div>
              </div>
            </div>
            <div style={{ borderRadius: 10, border: `1px solid ${BORDER}`, overflow: "hidden" }}>
              <div style={{ padding: "12px 18px", borderBottom: `1px solid ${BORDER}`, background: "#fafafa", fontSize: 13, fontWeight: 700, color: MUTED }}>Recent quotes</div>
              {mockQuotes.map((q) => (
                <div key={q.number} style={{ padding: "12px 18px", borderBottom: `1px solid ${BORDER}`, display: "flex", alignItems: "center", gap: 14, fontSize: 14 }}>
                  <span style={{ fontWeight: 700, color: DARK }}>{q.number}</span>
                  <span style={{ flex: 1, color: "#334155" }}>{q.customer}</span>
                  <StatusBadge status={q.status} />
                  <span style={{ fontWeight: 700, color: DARK }}>{formatCurrency(q.total)}</span>
                </div>
              ))}
            </div>
          </CardFrame>
        </div>

        {/* Scroll arrow */}
        <div style={{ position: "absolute", bottom: 36, left: "50%", transform: "translateX(-50%)", animation: "scrollArrow 2s ease-in-out infinite" }}>
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke={MUTED} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 5v14M5 12l7 7 7-7" />
          </svg>
        </div>
      </section>

      {/* ═══════════════════ QUOTES ═══════════════════ */}
      <section style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "80px 32px", background: "#fff", borderTop: `1px solid ${BORDER}` }}>
        <div style={{ maxWidth: 1200, width: "100%", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 80, alignItems: "center" }}>
          <div>
            <SectionBadge text="Quotes" />
            <SectionHeading>Send professional quotes in minutes.</SectionHeading>
            <SectionBody>
              Build line-item quotes with tax, notes, and valid-until dates. Send a share link or a branded PDF — customers can accept with one tap.
            </SectionBody>
            <FeatureList items={[
              "Real-time totals as you add items",
              "AI-assisted quote generation on paid plans",
              "Branded PDFs with your logo and details",
              "Instant share links for customer approval",
            ]} />
            <div style={{ marginTop: 32 }}>
              {CTA}
            </div>
          </div>
          <CardFrame title="New quote — Bayside Renovations">
            {lineItems.map((item, i) => (
              <div key={item.name} style={{ display: "flex", alignItems: "center", gap: 16, padding: "14px 16px", borderRadius: 8, background: i === 2 ? GREEN_LIGHT : "#f8fafc", border: i === 2 ? "1px solid #bbf7d0" : `1px solid ${BORDER}`, marginBottom: 8 }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 15, fontWeight: 650, color: DARK }}>{item.name}</div>
                  <div style={{ fontSize: 13, color: MUTED, marginTop: 3 }}>{item.meta}</div>
                </div>
                <div style={{ fontSize: 16, fontWeight: 700, color: DARK }}>{formatCurrency(item.amount)}</div>
              </div>
            ))}
            <div style={{ borderTop: `2px solid ${BORDER}`, paddingTop: 18, marginTop: 12, display: "flex", justifyContent: "space-between", fontSize: 18 }}>
              <span style={{ fontWeight: 700, color: MUTED }}>Total</span>
              <strong style={{ color: DARK, fontSize: 26 }}>{formatCurrency(total)}</strong>
            </div>
          </CardFrame>
        </div>
      </section>

      {/* ═══════════════════ CUSTOMERS ═══════════════════ */}
      <section style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "80px 32px", background: "#f8fafc", borderTop: `1px solid ${BORDER}` }}>
        <div style={{ maxWidth: 1200, width: "100%", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 80, alignItems: "center" }}>
          <div style={{ order: 2 }}>
            <SectionBadge text="Customers" />
            <SectionHeading>Know every customer and every quote.</SectionHeading>
            <SectionBody>
              Store customer contact details, track their full quote history, and see which jobs are scheduled — all from one customer profile page.
            </SectionBody>
            <FeatureList items={[
              "Full quote history per customer",
              "Search by name, company, or email",
              "Quick-create new customer in 2 clicks",
              "Phone, email, address all in one place",
            ]} />
            <div style={{ marginTop: 32 }}>{CTA}</div>
          </div>
          <div style={{ order: 1 }}>
            <SectionBadge text="Customers" />
            <SectionHeading>Know every customer and every quote.</SectionHeading>
            <SectionBody>
              Store customer contact details, track their full quote history, and see which jobs are scheduled — all from one customer profile page.
            </SectionBody>
            <FeatureList items={[
              "Full quote history per customer",
              "Search by name, company, or email",
              "Quick-create new customer in 2 clicks",
              "Phone, email, address all in one place",
            ]} />
            <div style={{ marginTop: 32 }}>
              {CTA}
            </div>
          </div>
          <div style={{ direction: "ltr" }}>
            <CardFrame title="Customer records — 47 total">
              {mockCustomers.map((c, i) => (
                <div key={c.name} style={{ padding: "16px 0", borderBottom: i < mockCustomers.length - 1 ? `1px solid ${BORDER}` : "none", display: "flex", alignItems: "center", gap: 16 }}>
                  <div style={{ width: 44, height: 44, borderRadius: 22, background: i === 0 ? "#dbeafe" : i === 1 ? GREEN_LIGHT : "#fef3c7", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, fontWeight: 800, color: i === 0 ? "#1e40af" : i === 1 ? "#065f46" : "#92400e" }}>
                    {c.name[0]}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 16, fontWeight: 700, color: DARK }}>{c.name}</div>
                    <div style={{ fontSize: 13, color: MUTED, marginTop: 3 }}>{c.email}</div>
                  </div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: GREEN, background: GREEN_LIGHT, borderRadius: 10, padding: "6px 14px" }}>
                    {c.quotes} quotes
                  </div>
                </div>
              ))}
            </CardFrame>
          </div>
        </div>
      </section>

      {/* ═══════════════════ CALENDAR ═══════════════════ */}
      <section style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "80px 32px", background: "#fff", borderTop: `1px solid ${BORDER}` }}>
        <div style={{ maxWidth: 1200, width: "100%", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 80, alignItems: "center" }}>
          <div>
            <SectionBadge text="Calendar & Jobs" />
            <SectionHeading>Schedule jobs the moment a quote is accepted.</SectionHeading>
            <SectionBody>
              Accept a quote and the job lands on your calendar. View upcoming work, mark jobs complete, and export to Apple Calendar or Google Calendar with one click.
            </SectionBody>
            <FeatureList items={[
              "One-click scheduling from quotes",
              "Monthly calendar with colour-coded jobs",
              "Export .ics files for your phone calendar",
              "Completed jobs auto-archive after 24 hours",
            ]} />
            <div style={{ marginTop: 32 }}>
              {CTA}
            </div>
          </div>
          <CardFrame title="June 2026 — Schedule">
            <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", borderBottom: `1px solid ${BORDER}`, marginBottom: 4 }}>
              {["Mon","Tue","Wed","Thu","Fri","Sat","Sun"].map((d) => (
                <div key={d} style={{ padding: "10px 0", textAlign: "center", fontSize: 11, fontWeight: 700, color: MUTED, textTransform: "uppercase" }}>{d}</div>
              ))}
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 2 }}>
              {Array.from({ length: 35 }, (_, i) => {
                const day = i - 3;
                const isThisMonth = day >= 1 && day <= 30;
                const jobEntry = mockJobs.find((j) => j.day === (day > 0 ? day : 0));
                return (
                  <div key={i} style={{ minHeight: 56, padding: 4, textAlign: "center", borderRadius: 5, background: jobEntry ? GREEN_LIGHT : "transparent" }}>
                    <span style={{ fontSize: 12, fontWeight: 700, color: isThisMonth ? (day === 12 ? GREEN : DARK) : "#d1d5db" }}>
                      {day > 0 ? day : ""}
                    </span>
                    {jobEntry && day > 0 ? (
                      <div style={{ marginTop: 2 }}>
                        {jobEntry.jobs.map((j) => (
                          <div key={j.title} style={{ fontSize: 9, fontWeight: 600, background: j.color, color: j.fg, borderRadius: 4, padding: "2px 5px", marginTop: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", textAlign: "left" }}>
                            {j.time} {j.title.substring(0, 14)}
                          </div>
                        ))}
                      </div>
                    ) : null}
                  </div>
                );
              })}
            </div>
          </CardFrame>
        </div>
      </section>

      {/* ═══════════════════ BOTTOM CTA ═══════════════════ */}
      <section style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "80px 32px", background: DARK, position: "relative" }}>
        <div style={{ textAlign: "center", maxWidth: 640 }}>
          <p style={{ fontSize: 16, fontWeight: 700, color: "#86efac", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 16 }}>
            JobStacker
          </p>
          <h2 style={{ fontSize: "clamp(36px, 6vw, 56px)", fontWeight: 800, color: "#fff", lineHeight: 1.1, margin: "0 0 20px" }}>
            Ready to start stacking?
          </h2>
          <p style={{ fontSize: "clamp(16px, 2.5vw, 20px)", color: "#94a3b8", lineHeight: 1.75, margin: "0 0 48px" }}>
            Join tradespeople who've moved from spreadsheets to one clean workspace.
            Free to start. No credit card required.
          </p>
          <div style={{ display: "flex", gap: 16, justifyContent: "center", flexWrap: "wrap" }}>
            {CTA}
            <Link href="/login" style={{ padding: "18px 36px", background: "rgba(255,255,255,0.08)", color: "#fff", borderRadius: 10, fontSize: 18, fontWeight: 600, textDecoration: "none", border: "1.5px solid rgba(255,255,255,0.15)" }}>
              Log in
            </Link>
          </div>
        </div>

        <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 4, background: `linear-gradient(90deg, ${GREEN}, #86efac, #fef3c7, GREEN)` }} />
      </section>

      {/* ═══════════════════ FOOTER ═══════════════════ */}
      <footer style={{ padding: "40px 32px", textAlign: "center", background: DARK, borderTop: "1px solid rgba(255,255,255,0.08)" }}>
        <Link href="/" style={{ fontSize: 20, fontWeight: 800, color: "#86efac", textDecoration: "none" }}>JobStacker</Link>
        <div style={{ marginTop: 20, display: "flex", gap: 24, justifyContent: "center", flexWrap: "wrap" }}>
          <Link href="/terms" style={{ fontSize: 14, color: "#94a3b8", textDecoration: "none" }}>Terms</Link>
          <Link href="/privacy" style={{ fontSize: 14, color: "#94a3b8", textDecoration: "none" }}>Privacy</Link>
          <Link href="/install" style={{ fontSize: 14, color: "#94a3b8", textDecoration: "none" }}>Install App</Link>
          <Link href="/login" style={{ fontSize: 14, color: "#94a3b8", textDecoration: "none" }}>Log in</Link>
        </div>
      </footer>
    </div>
  );
}
