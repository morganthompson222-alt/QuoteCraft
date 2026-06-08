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
  return <span style={{ background: bg, color: fg, fontSize: 11, fontWeight: 700, borderRadius: 999, padding: "3px 10px", textTransform: "capitalize" }}>{status}</span>;
}

const GREEN = "#1F6B4F";
const BORDER = "#e5e7eb";

export default function LandingPage() {
  const { formatCurrency } = useRegion();
  const total = lineItems.reduce((sum, i) => sum + i.amount, 0);

  return (
    <div style={{ background: "#f8fafc" }}>
      {/* ── Hero ── */}
      <section style={{ padding: "80px 24px 60px", maxWidth: 1080, margin: "0 auto", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 48, alignItems: "center" }}>
        <div>
          <p style={{ fontSize: 14, fontWeight: 700, color: GREEN, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 12 }}>
            For Tradespeople & Service Teams
          </p>
          <h1 style={{ fontSize: 48, fontWeight: 800, lineHeight: 1.15, color: "#0f172a", margin: "0 0 16px" }}>
            Stack your jobs, quotes, and clients in one place.
          </h1>
          <p style={{ fontSize: 18, color: "#64748b", lineHeight: 1.6, margin: "0 0 32px" }}>
            JobStacker is the all-in-one workspace for tradespeople. Create quotes, send
            PDFs, schedule jobs, and manage customers — without touching a spreadsheet.
          </p>
          <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
            <Link href="/signup" style={{ padding: "14px 32px", background: GREEN, color: "#fff", borderRadius: 8, fontSize: 16, fontWeight: 700, textDecoration: "none", boxShadow: "0 4px 14px rgba(31,107,79,0.3)" }}>
              Start stacking
            </Link>
            <Link href="/login" style={{ padding: "14px 24px", background: "#fff", color: "#334155", borderRadius: 8, fontSize: 16, fontWeight: 600, textDecoration: "none", border: `1px solid ${BORDER}` }}>
              Log in
            </Link>
          </div>
          <div style={{ display: "flex", gap: 32, marginTop: 40 }}>
            {metrics.map((m) => (
              <div key={m.label}>
                <div style={{ fontSize: 22, fontWeight: 800, color: "#0f172a" }}>{m.value}</div>
                <div style={{ fontSize: 13, color: "#64748b", marginTop: 2 }}>{m.label}</div>
              </div>
            ))}
          </div>
        </div>
        <div style={{ background: "#fff", borderRadius: 12, border: `1px solid ${BORDER}`, boxShadow: "0 8px 30px rgba(0,0,0,0.06)", overflow: "hidden" }}>
          <div style={{ padding: 16, borderBottom: `1px solid ${BORDER}`, display: "flex", alignItems: "center", gap: 10, background: "#fafafa" }}>
            <div style={{ display: "flex", gap: 6 }}>
              <div style={{ width: 10, height: 10, borderRadius: 10, background: "#ef4444" }} />
              <div style={{ width: 10, height: 10, borderRadius: 10, background: "#f59e0b" }} />
              <div style={{ width: 10, height: 10, borderRadius: 10, background: "#22c55e" }} />
            </div>
            <span style={{ fontSize: 12, fontWeight: 600, color: "#64748b" }}>Dashboard — JobStacker</span>
          </div>
          <div style={{ padding: 20 }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 16 }}>
              <div style={{ padding: "12px 14px", borderRadius: 8, background: "#eefaf4", border: `1px solid #a7f3d0` }}>
                <div style={{ fontSize: 22, fontWeight: 800, color: "#065f46" }}>{formatCurrency(42800)}</div>
                <div style={{ fontSize: 12, color: "#065f46", fontWeight: 600 }}>Revenue to date</div>
              </div>
              <div style={{ padding: "12px 14px", borderRadius: 8, background: "#f8fafc", border: `1px solid ${BORDER}` }}>
                <div style={{ fontSize: 22, fontWeight: 800, color: "#0f172a" }}>47</div>
                <div style={{ fontSize: 12, color: "#64748b", fontWeight: 600 }}>Customers</div>
              </div>
              <div style={{ padding: "12px 14px", borderRadius: 8, background: "#f8fafc", border: `1px solid ${BORDER}` }}>
                <div style={{ fontSize: 22, fontWeight: 800, color: "#0f172a" }}>8</div>
                <div style={{ fontSize: 12, color: "#64748b", fontWeight: 600 }}>Open quotes</div>
              </div>
              <div style={{ padding: "12px 14px", borderRadius: 8, background: "#f8fafc", border: `1px solid ${BORDER}` }}>
                <div style={{ fontSize: 22, fontWeight: 800, color: "#0f172a" }}>5</div>
                <div style={{ fontSize: 12, color: "#64748b", fontWeight: 600 }}>Upcoming jobs</div>
              </div>
            </div>
            <div style={{ borderRadius: 8, border: `1px solid ${BORDER}`, overflow: "hidden" }}>
              <div style={{ padding: "10px 14px", borderBottom: `1px solid ${BORDER}`, background: "#fafafa", fontSize: 12, fontWeight: 700, color: "#64748b" }}>Recent quotes</div>
              {mockQuotes.map((q) => (
                <div key={q.number} style={{ padding: "10px 14px", borderBottom: `1px solid ${BORDER}`, display: "flex", alignItems: "center", gap: 10, fontSize: 13 }}>
                  <span style={{ fontWeight: 700, color: "#0f172a" }}>{q.number}</span>
                  <span style={{ flex: 1, color: "#334155" }}>{q.customer}</span>
                  <StatusBadge status={q.status} />
                  <span style={{ fontWeight: 700, color: "#0f172a" }}>{formatCurrency(q.total)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Quotes Section ── */}
      <section style={{ padding: "80px 24px", maxWidth: 1080, margin: "0 auto" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 48, alignItems: "center" }}>
          <div>
            <p style={{ fontSize: 14, fontWeight: 700, color: GREEN, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 8 }}>Quotes</p>
            <h2 style={{ fontSize: 32, fontWeight: 800, color: "#0f172a", margin: "0 0 12px" }}>Send professional quotes in minutes.</h2>
            <p style={{ fontSize: 16, color: "#64748b", lineHeight: 1.7, margin: "0 0 24px" }}>
              Build line-item quotes with tax, notes, and valid-until dates. Send a share link
              or a branded PDF — customers can accept with one tap.
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {["Real-time totals as you add items", "AI-assisted quote generation (paid plans)", "Branded PDFs with your logo and details", "Instant share links for customer approval"].map((f) => (
                <div key={f} style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 14, color: "#334155" }}>
                  <span style={{ color: GREEN, fontWeight: 800 }}>&#10003;</span> {f}
                </div>
              ))}
            </div>
          </div>
          <div style={{ background: "#fff", borderRadius: 12, border: `1px solid ${BORDER}`, boxShadow: "0 4px 16px rgba(0,0,0,0.04)", overflow: "hidden" }}>
            <div style={{ padding: "10px 16px", borderBottom: `1px solid ${BORDER}`, background: "#fafafa", fontSize: 12, fontWeight: 700, color: "#64748b" }}>New quote — Bayside Renovations</div>
            <div style={{ padding: 16 }}>
              {lineItems.map((item, i) => (
                <div key={item.name} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 12px", borderRadius: 6, background: i === 2 ? "#f0fdf4" : "transparent", border: i === 2 ? "1px solid #bbf7d0" : "1px solid transparent", marginBottom: 6 }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 14, fontWeight: 650, color: "#0f172a" }}>{item.name}</div>
                    <div style={{ fontSize: 12, color: "#64748b", marginTop: 2 }}>{item.meta}</div>
                  </div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: "#0f172a" }}>{formatCurrency(item.amount)}</div>
                </div>
              ))}
              <div style={{ borderTop: `1px solid ${BORDER}`, paddingTop: 12, marginTop: 8, display: "flex", justifyContent: "space-between", fontSize: 16 }}>
                <span style={{ fontWeight: 700, color: "#64748b" }}>Total</span>
                <strong style={{ color: "#0f172a", fontSize: 20 }}>{formatCurrency(total)}</strong>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Customers Section ── */}
      <section style={{ padding: "80px 24px", background: "#fff", borderTop: `1px solid ${BORDER}`, borderBottom: `1px solid ${BORDER}` }}>
        <div style={{ maxWidth: 1080, margin: "0 auto", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 48, alignItems: "center", direction: "rtl" }}>
          <div style={{ direction: "ltr" }}>
            <p style={{ fontSize: 14, fontWeight: 700, color: GREEN, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 8 }}>Customers</p>
            <h2 style={{ fontSize: 32, fontWeight: 800, color: "#0f172a", margin: "0 0 12px" }}>Know every customer and every quote.</h2>
            <p style={{ fontSize: 16, color: "#64748b", lineHeight: 1.7, margin: "0 0 24px" }}>
              Store customer contact details, track their full quote history, and see which jobs
              are scheduled — all from one customer profile page.
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {["Full quote history per customer", "Search by name, company, or email", "Quick-create new customer in 2 clicks", "Phone, email, address all in one place"].map((f) => (
                <div key={f} style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 14, color: "#334155" }}>
                  <span style={{ color: GREEN, fontWeight: 800 }}>&#10003;</span> {f}
                </div>
              ))}
            </div>
          </div>
          <div style={{ direction: "ltr", background: "#fff", borderRadius: 12, border: `1px solid ${BORDER}`, boxShadow: "0 4px 16px rgba(0,0,0,0.04)", overflow: "hidden" }}>
            <div style={{ padding: "10px 16px", borderBottom: `1px solid ${BORDER}`, background: "#fafafa", fontSize: 12, fontWeight: 700, color: "#64748b" }}>Customer records — 47 total</div>
            {mockCustomers.map((c, i) => (
              <div key={c.name} style={{ padding: "12px 16px", borderBottom: i < mockCustomers.length - 1 ? `1px solid ${BORDER}` : "none", display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{ width: 36, height: 36, borderRadius: 18, background: i === 0 ? "#dbeafe" : i === 1 ? "#d1fae5" : "#fef3c7", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontWeight: 800, color: i === 0 ? "#1e40af" : i === 1 ? "#065f46" : "#92400e" }}>
                  {c.name[0]}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 14, fontWeight: 650, color: "#0f172a" }}>{c.name}</div>
                  <div style={{ fontSize: 12, color: "#64748b", marginTop: 1 }}>{c.email}</div>
                </div>
                <div style={{ fontSize: 12, fontWeight: 600, color: GREEN, background: "#eefaf4", borderRadius: 8, padding: "4px 10px" }}>
                  {c.quotes} quotes
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Calendar & Jobs Section ── */}
      <section style={{ padding: "80px 24px", maxWidth: 1080, margin: "0 auto" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 48, alignItems: "center" }}>
          <div>
            <p style={{ fontSize: 14, fontWeight: 700, color: GREEN, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 8 }}>Calendar & Jobs</p>
            <h2 style={{ fontSize: 32, fontWeight: 800, color: "#0f172a", margin: "0 0 12px" }}>Schedule jobs the moment a quote is accepted.</h2>
            <p style={{ fontSize: 16, color: "#64748b", lineHeight: 1.7, margin: "0 0 24px" }}>
              Accept a quote and the job lands on your calendar. View upcoming work, mark jobs
              complete, and export to Apple Calendar or Google Calendar with one click.
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {["One-click scheduling from quotes", "Monthly calendar with colour-coded jobs", "Export .ics files for your phone calendar", "Completed jobs auto-archive after 24 hours"].map((f) => (
                <div key={f} style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 14, color: "#334155" }}>
                  <span style={{ color: GREEN, fontWeight: 800 }}>&#10003;</span> {f}
                </div>
              ))}
            </div>
          </div>
          <div style={{ background: "#fff", borderRadius: 12, border: `1px solid ${BORDER}`, boxShadow: "0 4px 16px rgba(0,0,0,0.04)", overflow: "hidden" }}>
            <div style={{ padding: "10px 16px", borderBottom: `1px solid ${BORDER}`, background: "#fafafa", fontSize: 12, fontWeight: 700, color: "#64748b" }}>June 2026 — Schedule</div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", borderBottom: `1px solid ${BORDER}` }}>
              {["Mon","Tue","Wed","Thu","Fri","Sat","Sun"].map((d) => (
                <div key={d} style={{ padding: "8px 0", textAlign: "center", fontSize: 10, fontWeight: 700, color: "#64748b", textTransform: "uppercase" }}>{d}</div>
              ))}
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", padding: 4 }}>
              {Array.from({ length: 35 }, (_, i) => {
                const day = i - 3; // offset so day 1 is Thursday-ish
                const isThisMonth = day >= 1 && day <= 30;
                const jobEntry = mockJobs.find((j) => j.day === (day > 0 ? day : 0));
                return (
                  <div key={i} style={{ minHeight: 52, padding: 3, textAlign: "center", borderRadius: 4, background: day === 12 ? "#eefaf4" : "transparent" }}>
                    <span style={{ fontSize: 11, fontWeight: 700, color: isThisMonth ? (day === 12 ? GREEN : "#334155") : "#cbd5e1" }}>
                      {day > 0 ? day : ""}
                    </span>
                    {jobEntry && day > 0 ? (
                      <div style={{ marginTop: 1 }}>
                        {jobEntry.jobs.map((j) => (
                          <div key={j.title} style={{ fontSize: 8, fontWeight: 600, background: j.color, color: j.fg, borderRadius: 3, padding: "1px 4px", marginTop: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                            {j.time} {j.title.substring(0, 12)}
                          </div>
                        ))}
                      </div>
                    ) : null}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* ── Bottom CTA ── */}
      <section style={{ padding: "80px 24px", background: "#0f172a", textAlign: "center" }}>
        <div style={{ maxWidth: 600, margin: "0 auto" }}>
          <p style={{ fontSize: 14, fontWeight: 700, color: "#86efac", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 12 }}>
            JobStacker
          </p>
          <h2 style={{ fontSize: 36, fontWeight: 800, color: "#fff", margin: "0 0 16px" }}>
            Ready to start stacking?
          </h2>
          <p style={{ fontSize: 18, color: "#94a3b8", lineHeight: 1.7, margin: "0 0 36px" }}>
            Join tradespeople who've moved from spreadsheets to one clean workspace.
            Free to start. No credit card required.
          </p>
          <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
            <Link href="/signup" style={{ padding: "16px 40px", background: GREEN, color: "#fff", borderRadius: 8, fontSize: 18, fontWeight: 700, textDecoration: "none", boxShadow: "0 4px 20px rgba(31,107,79,0.4)" }}>
              Start stacking
            </Link>
            <Link href="/login" style={{ padding: "16px 32px", background: "rgba(255,255,255,0.1)", color: "#fff", borderRadius: 8, fontSize: 18, fontWeight: 600, textDecoration: "none", border: "1px solid rgba(255,255,255,0.15)" }}>
              Log in
            </Link>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer style={{ padding: "32px 24px", textAlign: "center", background: "#f8fafc", borderTop: `1px solid ${BORDER}` }}>
        <Link href="/" style={{ fontSize: 18, fontWeight: 800, color: GREEN, textDecoration: "none" }}>JobStacker</Link>
        <div style={{ marginTop: 12, display: "flex", gap: 16, justifyContent: "center", flexWrap: "wrap" }}>
          <Link href="/terms" style={{ fontSize: 13, color: "#64748b", textDecoration: "none" }}>Terms</Link>
          <Link href="/privacy" style={{ fontSize: 13, color: "#64748b", textDecoration: "none" }}>Privacy</Link>
          <Link href="/login" style={{ fontSize: 13, color: "#64748b", textDecoration: "none" }}>Log in</Link>
        </div>
      </footer>
    </div>
  );
}
