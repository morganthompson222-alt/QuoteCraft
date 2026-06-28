"use client";

import { useState } from "react";

export default function MarketingPage() {
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState<{ ok: boolean; msg: string } | null>(null);

  async function handleSend() {
    if (!subject.trim() || !message.trim()) return;
    setSending(true);
    setResult(null);
    try {
      const tk = localStorage.getItem("jobstacker_token");
      const r = await fetch("/api/email/marketing", {
        method: "POST",
        headers: { "Content-Type": "application/json", ...(tk ? { Authorization: `Bearer ${tk}` } : {}) },
        body: JSON.stringify({ subject: subject.trim(), message: message.trim() }),
      });
      const d = await r.json();
      if (r.ok) setResult({ ok: true, msg: `Email sent to ${d.sent} customers.` });
      else setResult({ ok: false, msg: d?.error?.message ?? "Failed to send." });
    } catch {
      setResult({ ok: false, msg: "Network error." });
    } finally {
      setSending(false);
    }
  }

  const BORDER = "#e5e7eb";
  const GREEN = "#1F6B4F";

  return (
    <section style={{ padding: "32px 24px", maxWidth: 600, margin: "0 auto" }}>
      <div style={{ marginBottom: 24 }}>
        <p style={{ fontSize: 12, fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 4 }}>Marketing</p>
        <h1 style={{ fontSize: 26, fontWeight: 800, margin: 0, color: "#0f172a" }}>Email campaign</h1>
        <p style={{ fontSize: 14, color: "#64748b", marginTop: 6 }}>
          Send an email to all your customers at once. Use this for promotions, seasonal offers, or company updates.
        </p>
      </div>

      <div style={{ background: "#fff", border: `1px solid ${BORDER}`, borderRadius: 8, padding: "20px 20px" }}>
        <div style={{ marginBottom: 16 }}>
          <label htmlFor="em-subject" style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#334155", marginBottom: 4 }}>Subject</label>
          <input
            id="em-subject"
            type="text"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder="e.g. Spring offer — 20% off patio cleaning"
            style={{ width: "100%", padding: "10px 12px", border: `1px solid ${BORDER}`, borderRadius: 6, fontSize: 14, outline: "none", boxSizing: "border-box" }}
          />
        </div>

        <div style={{ marginBottom: 16 }}>
          <label htmlFor="em-msg" style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#334155", marginBottom: 4 }}>Message</label>
          <textarea
            id="em-msg"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Hi {{name}},\n\nWe're offering 20% off all patio cleaning services this spring..."
            rows={8}
            style={{ width: "100%", padding: "10px 12px", border: `1px solid ${BORDER}`, borderRadius: 6, fontSize: 14, outline: "none", resize: "vertical", fontFamily: "inherit", boxSizing: "border-box" }}
          />
          <p style={{ fontSize: 12, color: "#94a3b8", margin: "4px 0 0" }}>Use {`{{name}}`} to personalise with each customer's name.</p>
        </div>

        <button
          onClick={handleSend}
          disabled={sending || !subject.trim() || !message.trim()}
          style={{
            width: "100%", padding: "12px 24px", borderRadius: 8, fontSize: 15, fontWeight: 700, border: "none",
            cursor: "pointer", background: GREEN, color: "#fff", opacity: sending || !subject.trim() || !message.trim() ? 0.5 : 1,
          }}
        >
          {sending ? "Sending..." : "Send to all customers"}
        </button>

        {result ? (
          <div style={{
            marginTop: 16, padding: "12px 16px", borderRadius: 8, fontSize: 14,
            background: result.ok ? "#d1fae5" : "#fef2f2", color: result.ok ? "#065f46" : "#991b1b",
          }}>
            {result.msg}
          </div>
        ) : null}
      </div>
    </section>
  );
}
