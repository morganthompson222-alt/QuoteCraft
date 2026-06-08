"use client";

import { useCallback, useEffect, useState } from "react";

type Job = {
  id: string;
  quote_id: string | null;
  customer_name: string;
  job_title: string;
  status: string;
  job_date: string;
  start_time: string;
  end_time: string | null;
  location: string | null;
  notes: string | null;
};

type QuoteOption = {
  id: string;
  quoteNumber: string;
  customerName: string;
  description: string;
};

const GREEN = "#1F6B4F";
const BORDER = "#e5e7eb";

export type JobModalInitial = {
  quoteId?: string;
  customerName?: string;
  jobTitle?: string;
  date?: string;
};

export function JobModal({
  job,
  onClose,
  onSaved,
  initial,
}: {
  job?: Job | null;
  onClose: () => void;
  onSaved: () => void;
  initial?: JobModalInitial;
}) {
  const [title, setTitle] = useState(job?.job_title ?? initial?.jobTitle ?? "");
  const [date, setDate] = useState(job?.job_date ?? initial?.date ?? "");
  const [start, setStart] = useState(job?.start_time ?? "09:00");
  const [end, setEnd] = useState(job?.end_time ?? "");
  const [customer, setCustomer] = useState(job?.customer_name ?? initial?.customerName ?? "");
  const [location, setLocation_] = useState(job?.location ?? "");
  const [notes, setNotes] = useState(job?.notes ?? "");
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState("");

  // Quote linking
  const [quotes, setQuotes] = useState<QuoteOption[]>([]);
  const [selectedQuoteId, setSelectedQuoteId] = useState(job?.quote_id ?? initial?.quoteId ?? "");
  const [loadingQuotes, setLoadingQuotes] = useState(false);

  useEffect(() => {
    if (job) return; // don't load quotes when editing
    setLoadingQuotes(true);
    (async () => {
      try {
        const tk = localStorage.getItem("jobstacker_token");
        const r = await fetch("/api/quotes/list?status=accepted&limit=50&sortOrder=desc", {
          headers: tk ? { Authorization: `Bearer ${tk}` } : {},
        });
        if (r.ok) {
          const d = await r.json();
          setQuotes(
            (d.quotes ?? []).map((q: { id: string; quoteNumber: string; customerName: string }) => ({
              id: q.id,
              quoteNumber: q.quoteNumber,
              customerName: q.customerName,
              description: `${q.quoteNumber} — ${q.customerName}`,
            })),
          );
        }
      } catch { /* ok */ } finally {
        setLoadingQuotes(false);
      }
    })();
  }, [job]);

  const handleQuoteChange = (quoteId: string) => {
    setSelectedQuoteId(quoteId);
    if (!quoteId) return;
    const q = quotes.find((x) => x.id === quoteId);
    if (q) {
      if (!customer) setCustomer(q.customerName);
      if (!title) setTitle(`${q.customerName} — Job`);
    }
  };

  const submit = useCallback(async () => {
    setSaving(true);
    setErr("");
    try {
      const tk = localStorage.getItem("jobstacker_token");
      const body: Record<string, string> = {
        job_title: title,
        job_date: date,
        start_time: start,
      };
      if (customer) body.customer_name = customer;
      if (end) body.end_time = end;
      if (notes) body.notes = notes;
      if (location) body.location = location;
      if (selectedQuoteId) body.quote_id = selectedQuoteId;

      const res = await fetch(job ? `/api/jobs/${job.id}/update` : "/api/jobs/create", {
        method: job ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json", ...(tk ? { Authorization: `Bearer ${tk}` } : {}) },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error(j?.error?.message ?? "Failed");
      }
      onSaved();
      onClose();
    } catch (x) {
      setErr(x instanceof Error ? x.message : "Failed");
    } finally {
      setSaving(false);
    }
  }, [title, date, start, end, customer, location, notes, selectedQuoteId, job, onClose, onSaved]);

  const s: Record<string, React.CSSProperties> = {
    backdrop: { position: "fixed", inset: 0, background: "rgba(0,0,0,0.35)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center" },
    card: { background: "#fff", borderRadius: 12, width: "100%", maxWidth: 460, boxShadow: "0 20px 60px rgba(0,0,0,0.15)", maxHeight: "90vh", overflow: "auto" },
    header: { display: "flex", alignItems: "center", justifyContent: "space-between", padding: "20px 24px 0" },
    h2: { fontSize: 18, fontWeight: 700, margin: 0 },
    closeBtn: { background: "none", border: "none", fontSize: 22, cursor: "pointer", color: "#64748b", padding: "0 4px" },
    body: { padding: "16px 24px 24px" },
    field: { marginBottom: 14 },
    label: { display: "block", fontSize: 13, fontWeight: 600, color: "#334155", marginBottom: 4 },
    input: { width: "100%", padding: "8px 12px", border: `1px solid ${BORDER}`, borderRadius: 6, fontSize: 14, outline: "none", boxSizing: "border-box" as const },
    select: { width: "100%", padding: "8px 12px", border: `1px solid ${BORDER}`, borderRadius: 6, fontSize: 14, outline: "none", background: "#fff", boxSizing: "border-box" as const },
    row: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 },
    errEl: { background: "#fef2f2", color: "#991b1b", borderRadius: 6, padding: "8px 12px", fontSize: 13, marginBottom: 14 },
    actions: { display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 8 },
    btn: { padding: "8px 20px", borderRadius: 6, fontSize: 14, fontWeight: 600, cursor: "pointer", border: "none" },
    hint: { fontSize: 12, color: "#94a3b8", marginTop: 2 },
  };

  return (
    <div style={s.backdrop} onClick={onClose}>
      <div style={s.card} onClick={(e) => e.stopPropagation()}>
        <div style={s.header}>
          <h2 style={s.h2}>{job ? "Edit" : "New"} job</h2>
          <button style={s.closeBtn} onClick={onClose}>&times;</button>
        </div>
        <div style={s.body}>
          {/* Quote selector (new jobs only) */}
          {!job && (
            <div style={s.field}>
              <label style={s.label}>Link to quote</label>
              {loadingQuotes ? (
                <span style={{ fontSize: 13, color: "#94a3b8" }}>Loading accepted quotes...</span>
              ) : quotes.length === 0 ? (
                <span style={{ fontSize: 13, color: "#94a3b8" }}>No accepted quotes to link</span>
              ) : (
                <select
                  style={s.select}
                  value={selectedQuoteId}
                  onChange={(e) => handleQuoteChange(e.target.value)}
                >
                  <option value="">— None —</option>
                  {quotes.map((q) => (
                    <option key={q.id} value={q.id}>{q.description}</option>
                  ))}
                </select>
              )}
              {selectedQuoteId ? <div style={s.hint}>Customer & title auto-filled from quote</div> : null}
            </div>
          )}

          <div style={s.field}>
            <label style={s.label}>Job title *</label>
            <input style={s.input} value={title} onChange={(e) => setTitle(e.target.value)} required placeholder="e.g. Fence installation" />
          </div>

          <div style={s.field}>
            <label style={s.label}>Customer *</label>
            <input style={s.input} value={customer} onChange={(e) => setCustomer(e.target.value)} required placeholder="Customer name" />
          </div>

          <div style={s.field}>
            <label style={s.label}>Date *</label>
            <input style={s.input} type="date" value={date} onChange={(e) => setDate(e.target.value)} required />
          </div>

          <div style={s.row}>
            <div style={s.field}>
              <label style={s.label}>Start *</label>
              <input style={s.input} type="time" value={start} onChange={(e) => setStart(e.target.value)} required />
            </div>
            <div style={s.field}>
              <label style={s.label}>End</label>
              <input style={s.input} type="time" value={end} onChange={(e) => setEnd(e.target.value)} />
            </div>
          </div>

          <div style={s.field}>
            <label style={s.label}>Location</label>
            <input style={s.input} value={location} onChange={(e) => setLocation_(e.target.value)} placeholder="Optional" />
          </div>

          <div style={s.field}>
            <label style={s.label}>Notes</label>
            <textarea
              style={{ ...s.input, resize: "vertical" }}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              placeholder="Optional"
            />
          </div>

          {err ? <div style={s.errEl}>{err}</div> : null}

          <div style={s.actions}>
            <button style={{ ...s.btn, background: "#f1f5f9", color: "#334155" }} onClick={onClose}>Cancel</button>
            <button
              style={{ ...s.btn, background: GREEN, color: "#fff" }}
              onClick={submit}
              disabled={saving || !title || !date || !customer}
            >
              {saving ? "Saving..." : job ? "Save" : "Schedule"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
