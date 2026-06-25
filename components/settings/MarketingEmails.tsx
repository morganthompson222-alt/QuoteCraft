"use client";

import { useState } from "react";

export function MarketingEmails() {
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState<{ ok: boolean; text: string } | null>(null);

  async function handleSend() {
    if (!subject.trim() || !message.trim()) return;
    setSending(true);
    setResult(null);
    try {
      const token = localStorage.getItem("jobstacker_token");
      const res = await fetch("/api/email/marketing", {
        method: "POST",
        headers: { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        body: JSON.stringify({ subject: subject.trim(), message: message.trim() }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        setResult({ ok: true, text: `Sent to ${data.sent ?? 0} customers` });
        setSubject("");
        setMessage("");
      } else {
        setResult({ ok: false, text: data?.error?.message ?? data?.error ?? "Failed to send" });
      }
    } catch (err) {
      setResult({ ok: false, text: err instanceof Error ? err.message : "Failed to send" });
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="table-card">
      <div className="bp-section__title">
        <h2>Marketing email</h2>
      </div>
      <div className="bp-section__body">
        <p style={{ fontSize: 14, color: "var(--text-muted)", margin: "0 0 16px" }}>
          Send an email to all your customers at once. Use this for promotions, seasonal offers, or company updates.
        </p>
        <div style={{ display: "grid", gap: 12 }}>
          <div>
            <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "var(--text)", marginBottom: 4 }}>Subject</label>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="e.g. Spring special — 20% off patio cleaning"
              style={{ width: "100%", padding: "10px 12px", borderRadius: 8, border: "1px solid var(--border)", background: "var(--surface)", color: "var(--text)", fontSize: 14 }}
            />
          </div>
          <div>
            <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "var(--text)", marginBottom: 4 }}>Message</label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Write your message here..."
              rows={6}
              style={{ width: "100%", padding: "10px 12px", borderRadius: 8, border: "1px solid var(--border)", background: "var(--surface)", color: "var(--text)", fontSize: 14, resize: "vertical" }}
            />
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <button
              className="button button--primary"
              type="button"
              onClick={handleSend}
              disabled={sending || !subject.trim() || !message.trim()}
              style={{ minWidth: 120 }}
            >
              {sending ? "Sending..." : "Send to all customers"}
            </button>
            {result ? (
              <span style={{ fontSize: 13, color: result.ok ? "var(--brand)" : "var(--danger)", fontWeight: 600 }}>
                {result.text}
              </span>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
