"use client";

import { useEffect, useState } from "react";

type Customer = { id: string; name: string; email: string };

export function MarketingEmails() {
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState<{ ok: boolean; text: string } | null>(null);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [allSelected, setAllSelected] = useState(true);
  const [showList, setShowList] = useState(false);

  useEffect(() => {
    let current = true;
    (async () => {
      try {
        const token = localStorage.getItem("jobstacker_token");
        const r = await fetch("/api/customers/list?limit=100", {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        if (r.ok) {
          const d = await r.json();
          const withEmail = (d.customers ?? []).filter((c: Customer) => c.email?.trim());
          if (current) {
            setCustomers(withEmail);
            setSelected(new Set(withEmail.map((c: Customer) => c.email)));
          }
        }
      } catch { /* ok */ } finally {
        if (current) setLoading(false);
      }
    })();
    return () => { current = false; };
  }, []);

  function toggleAll(checked: boolean) {
    setAllSelected(checked);
    if (checked) {
      setSelected(new Set(customers.map((c) => c.email)));
    } else {
      setSelected(new Set());
    }
  }

  function toggleEmail(email: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(email)) next.delete(email);
      else next.add(email);
      setAllSelected(next.size === customers.length);
      return next;
    });
  }

  async function handleSend() {
    if (!subject.trim() || !message.trim() || selected.size === 0) return;
    setSending(true);
    setResult(null);
    try {
      const token = localStorage.getItem("jobstacker_token");
      const res = await fetch("/api/email/marketing", {
        method: "POST",
        headers: { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        body: JSON.stringify({ subject: subject.trim(), message: message.trim(), recipientEmails: Array.from(selected) }),
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
          Send an email to your customers at once. Use this for promotions, seasonal offers, or company updates.
        </p>

        {/* Customer list */}
        <div style={{ marginBottom: 16, border: "1px solid var(--border)", borderRadius: 8, overflow: "hidden" }}>
          <button
            type="button"
            onClick={() => setShowList((v) => !v)}
            style={{ display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%", padding: "12px 16px", background: "var(--surface-muted)", border: "none", cursor: "pointer", fontSize: 14, fontWeight: 600, color: "var(--text)" }}
          >
            <span>
              Recipients{" "}
              {loading ? "(loading…)" : `(${selected.size} of ${customers.length} customers)`}
            </span>
            <span>{showList ? "▲" : "▼"}</span>
          </button>
          {showList ? (
            <div style={{ maxHeight: 240, overflow: "auto" }}>
              {loading ? (
                <div style={{ padding: 16, fontSize: 13, color: "var(--text-muted)" }}>Loading customers...</div>
              ) : customers.length === 0 ? (
                <div style={{ padding: 16, fontSize: 13, color: "var(--text-muted)" }}>
                  No customers with email addresses found.{" "}
                  <a href="/customers" style={{ color: "var(--brand)", fontWeight: 600 }}>Add customers first</a>.
                </div>
              ) : (
                <div>
                  <label style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 16px", borderBottom: "1px solid var(--border)", cursor: "pointer", fontSize: 13, fontWeight: 600 }}>
                    <input type="checkbox" checked={allSelected} onChange={(e) => toggleAll(e.target.checked)} />
                    Select all
                  </label>
                  {customers.map((c) => (
                    <label key={c.id} style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 16px", borderBottom: "1px solid var(--border)", cursor: "pointer", fontSize: 13 }}>
                      <input type="checkbox" checked={selected.has(c.email)} onChange={() => toggleEmail(c.email)} />
                      <span style={{ fontWeight: 600 }}>{c.name}</span>
                      <span style={{ color: "var(--text-muted)" }}>{c.email}</span>
                    </label>
                  ))}
                </div>
              )}
            </div>
          ) : null}
        </div>

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
              disabled={sending || !subject.trim() || !message.trim() || selected.size === 0}
              style={{ minWidth: 120 }}
            >
              {sending ? "Sending..." : "Send email"}
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
