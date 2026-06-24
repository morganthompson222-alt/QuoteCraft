"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useRegion } from "../../hooks/useRegion";
import { JobModal } from "../jobs/JobModal";

type QuoteItem = {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  amount: number;
};

type QuoteCustomer = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  company: string | null;
};

type QuoteDetail = {
  id: string;
  quoteNumber: string;
  status: string;
  paid: boolean;
  paidAt: string | null;
  customer: QuoteCustomer;
  items: QuoteItem[];
  subtotal: number;
  taxRate: number;
  taxAmount: number;
  total: number;
  notes: string | null;
  validUntil: string | null;
  createdAt: string;
  updatedAt: string;
  jobDate: string | null;
  startTime: string | null;
  endTime: string | null;
  jobId: string | null;
  jobStatus: string | null;
};

type PreviewState =
  | { status: "loading"; data?: undefined }
  | { status: "error"; error: string; data?: undefined }
  | { status: "success"; data: QuoteDetail };

const statusTransitions: Record<string, string[]> = {
  draft: ["sent", "expired"],
  sent: ["accepted", "rejected", "expired"],
  accepted: [],
  rejected: [],
  expired: [],
};

function statusLabel(status: string) {
  switch (status) {
    case "draft": return "Draft";
    case "sent": return "Sent";
    case "accepted": return "Accepted";
    case "rejected": return "Rejected";
    case "expired": return "Expired";
    default: return status;
  }
}

async function readErrorMessage(response: Response) {
  try {
    const json = await response.json();
    const error = json?.error;
    if (typeof error === "string") return error;
    if (error && typeof error.message === "string") return error.message;
    if (typeof json?.message === "string") return json.message;
    return "Operation failed.";
  } catch {
    return "Operation failed.";
  }
}

type QuotePreviewPageProps = {
  quoteId: string;
};

export function QuotePreviewPage({ quoteId }: QuotePreviewPageProps) {
  const { formatCurrency, formatDate } = useRegion();
  const [state, setState] = useState<PreviewState>({ status: "loading" });
  const [refreshKey, setRefreshKey] = useState(0);
  const [statusError, setStatusError] = useState("");
  const [pdfLoading, setPdfLoading] = useState(false);
  const [planTier, setPlanTier] = useState("solo");
  const [reminderLoading, setReminderLoading] = useState(false);
  const [receiptLoading, setReceiptLoading] = useState(false);
  const [completing, setCompleting] = useState(false);
  const [showSendMenu, setShowSendMenu] = useState(false);
  const [showMarkSentAfterPdf, setShowMarkSentAfterPdf] = useState(false);
  const [showJobModal, setShowJobModal] = useState(false);
  const [showAcceptModal, setShowAcceptModal] = useState(false);
  const statusRef = useRef<string | null>(null);

  // Keep a ref of current status so the polling interval can read it without stale closures
  useEffect(() => {
    if (state.status === "success") statusRef.current = state.data.status;
  }, [state]);

  // Poll for customer-side status changes (accept/reject via public page)
  useEffect(() => {
    const interval = setInterval(() => {
      if (statusRef.current === "sent") {
        setRefreshKey((k) => k + 1);
      }
    }, 10000);
    return () => clearInterval(interval);
  }, []);

  const [schedDate, setSchedDate] = useState("");
  const [schedStart, setSchedStart] = useState("09:00");
  const [schedEnd, setSchedEnd] = useState("");

  useEffect(() => {
    let isCurrent = true;

    async function loadQuote() {
      setState({ status: "loading" });

      try {
        const token = window.localStorage.getItem("jobstacker_token");
        const response = await fetch(`/api/quotes/${quoteId}`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });

        if (!response.ok) {
          throw new Error(await readErrorMessage(response));
        }

        const data = (await response.json()) as QuoteDetail;
        if (isCurrent) {
          setState({ status: "success", data });
          if (data.jobDate) {
            setSchedDate(data.jobDate);
            if (data.startTime) setSchedStart(data.startTime);
            if (data.endTime) setSchedEnd(data.endTime);
          }
        }
      } catch (error) {
        if (isCurrent) {
          setState({
            status: "error",
            error: error instanceof Error ? error.message : "Unable to load quote.",
          });
        }
      }
    }

    loadQuote();
    (async () => {
      try {
        const tk = localStorage.getItem("jobstacker_token");
        const r = await fetch("/api/profile", { headers: tk ? { Authorization: `Bearer ${tk}` } : {} });
        if (r.ok) { const d = await r.json(); setPlanTier(d.planTier ?? "solo"); }
      } catch { /* ok */ }
    })();
    return () => { isCurrent = false; };
  }, [quoteId, refreshKey]);

  async function updateStatus(newStatus?: string, newPaid?: boolean) {
    setStatusError("");

    try {
      const token = window.localStorage.getItem("jobstacker_token");
      const body: Record<string, unknown> = {};
      if (newStatus !== undefined) body.status = newStatus;
      if (newPaid !== undefined) body.paid = newPaid;
      if (newStatus === "accepted" && schedDate) {
        body.job_date = schedDate;
        body.start_time = schedStart;
        if (schedEnd) body.end_time = schedEnd;
      }

      const response = await fetch(`/api/quotes/${quoteId}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        const errBody = await response.json();
        const msg = errBody?.error?.message ?? errBody?.message ?? "Failed to update.";
        setStatusError(msg);
        return;
      }

      setRefreshKey((k) => k + 1);
    } catch (error) {
      setStatusError(
        error instanceof Error ? error.message : "Something went wrong.",
      );
    }
  }

  async function downloadPdf() {
    setPdfLoading(true);

    try {
      const token = window.localStorage.getItem("jobstacker_token");
      const response = await fetch(`/api/quotes/${quoteId}/pdf`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });

      if (!response.ok) {
        throw new Error(await readErrorMessage(response));
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `quote-${state.status === "success" ? state.data.quoteNumber : quoteId}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      setStatusError(
        error instanceof Error ? error.message : "Failed to download PDF.",
      );
    } finally {
      setPdfLoading(false);
    }
  }

  async function downloadReminder() {
    setReminderLoading(true);

    try {
      const token = window.localStorage.getItem("jobstacker_token");
      const response = await fetch(`/api/quotes/${quoteId}/reminder`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });

      if (!response.ok) {
        throw new Error(await readErrorMessage(response));
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `reminder-${state.status === "success" ? state.data.quoteNumber : quoteId}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      setStatusError(
        error instanceof Error ? error.message : "Failed to download reminder.",
      );
    } finally {
      setReminderLoading(false);
    }
  }

  async function downloadReceipt() {
    setReceiptLoading(true);

    try {
      const token = window.localStorage.getItem("jobstacker_token");
      const response = await fetch(`/api/quotes/${quoteId}/receipt`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });

      if (!response.ok) {
        throw new Error(await readErrorMessage(response));
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `receipt-${state.status === "success" ? state.data.quoteNumber : quoteId}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      setStatusError(
        error instanceof Error ? error.message : "Failed to download receipt.",
      );
    } finally {
      setReceiptLoading(false);
    }
  }

  async function markJobCompleted() {
    if (!quote?.jobId) return;
    setCompleting(true);
    try {
      const tk = localStorage.getItem("jobstacker_token");
      const r = await fetch(`/api/jobs/${quote.jobId}/update`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", ...(tk ? { Authorization: `Bearer ${tk}` } : {}) },
        body: JSON.stringify({ status: "completed" }),
      });
      if (!r.ok) {
        const j = await r.json().catch(() => ({}));
        throw new Error(j?.error?.message ?? "Failed");
      }
      setRefreshKey((k) => k + 1);
    } catch (x) {
      setStatusError(x instanceof Error ? x.message : "Failed to complete job");
    } finally {
      setCompleting(false);
    }
  }

  async function handleSendLink() {
    setShowSendMenu(false);
    const url = `${window.location.origin}/q/${quoteId}`;
    try {
      await navigator.clipboard.writeText(url);
      setStatusError("Link copied! Marking as sent...");
      setTimeout(() => setStatusError(""), 2000);
    } catch {
      setStatusError("Failed to copy link");
      setTimeout(() => setStatusError(""), 2000);
    }
    await updateStatus("sent");
    setRefreshKey((k) => k + 1);
  }

  async function handleSendPdf() {
    setShowSendMenu(false);
    await downloadPdf();
    if (state.status === "success" && state.data.status === "draft") {
      setShowMarkSentAfterPdf(true);
    }
  }

  async function handleArchive() {
    try {
      const token = window.localStorage.getItem("jobstacker_token");
      await fetch(`/api/quotes/${quoteId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        body: JSON.stringify({ archived: true }),
      });
      setRefreshKey((k) => k + 1);
    } catch { /* ok */ }
  }

  function getShareUrl() { return `${window.location.origin}/q/${quoteId}`; }

  const quote = state.status === "success" ? state.data : null;
  const validTransitions = quote ? statusTransitions[quote.status] ?? [] : [];
  const hasDate = quote?.jobDate != null;
  const isScheduled = hasDate && quote?.status === "accepted";
  const isAccepted = quote?.status === "accepted";

  return (
    <section className="workspace-page">
      <div className="workspace-page__header">
        <div>
          <Link
            href="/quotes"
            style={{ color: "var(--text-muted)", fontSize: 14, fontWeight: 650, marginBottom: 8, display: "inline-block" }}
          >
            &larr; Back to quotes
          </Link>
          <p className="workspace-page__eyebrow">Quote preview</p>
          {quote ? <h1>{quote.quoteNumber}</h1> : <h1>Quote details</h1>}
        </div>
      </div>

      {state.status === "loading" ? (
        <div className="table-card" aria-busy="true">
          <div className="table-skeleton table-skeleton--header" />
          {Array.from({ length: 6 }).map((_, i) => (
            <div className="table-skeleton" key={i} />
          ))}
        </div>
      ) : null}

      {state.status === "error" ? (
        <div className="state-panel state-panel--error" role="alert">
          <h2>Quote could not be loaded</h2>
          <p>{state.error}</p>
          <button className="button button--secondary" type="button" onClick={() => setRefreshKey((k) => k + 1)}>
            Try again
          </button>
        </div>
      ) : null}

      {quote ? (
        <>
          {/* Action toolbar */}
          <div className="qp-actions">
            <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", padding: "14px 0", borderBottom: `1px solid var(--border)`, marginBottom: 14 }}>
              {/* Primary */}
              {quote.status === "draft" ? (
                <div style={{ position: "relative" }}>
                  <button className="button button--primary" type="button" onClick={() => setShowSendMenu((v) => !v)} style={{ minWidth: 100 }}>
                    Send ▾
                  </button>
                  {showSendMenu ? (
                    <>
                      <div style={{ position: "fixed", inset: 0, zIndex: 10 }} onClick={() => setShowSendMenu(false)} />
                      <div style={{ position: "absolute", top: "100%", left: 0, marginTop: 4, background: "#fff", borderRadius: 8, boxShadow: "0 8px 24px rgba(0,0,0,0.12)", zIndex: 20, minWidth: 220, overflow: "hidden" }}>
                        <button type="button" onClick={handleSendLink} style={{ display: "block", width: "100%", padding: "12px 16px", textAlign: "left", border: "none", background: "none", cursor: "pointer", fontSize: 14, fontWeight: 600, color: "#0f172a", borderBottom: "1px solid var(--border)" }}>
                          Share link
                          <span style={{ display: "block", fontSize: 12, fontWeight: 400, color: "#64748b", marginTop: 1 }}>Copy link & mark as sent</span>
                        </button>
                        <button type="button" onClick={handleSendPdf} style={{ display: "block", width: "100%", padding: "12px 16px", textAlign: "left", border: "none", background: "none", cursor: "pointer", fontSize: 14, fontWeight: 600, color: "#0f172a" }}>
                          Download PDF
                          <span style={{ display: "block", fontSize: 12, fontWeight: 400, color: "#64748b", marginTop: 1 }}>Send via email or print</span>
                        </button>
                      </div>
                    </>
                  ) : null}
                </div>
              ) : null}

              {showMarkSentAfterPdf && quote.status === "draft" ? (
                <button className="button button--primary" type="button" onClick={() => updateStatus("sent")}>Mark as sent</button>
              ) : null}

              {validTransitions.includes("sent") && quote.status !== "draft" ? (
                <button className="button button--primary" type="button" onClick={() => updateStatus("sent")}>Mark as sent</button>
              ) : null}

              {validTransitions.includes("accepted") ? (
                <button className="button button--primary" type="button" onClick={() => setShowAcceptModal(true)}>Mark accepted</button>
              ) : null}

              {/* Divider */}
              {(validTransitions.includes("rejected") || validTransitions.includes("expired")) ? (
                <span style={{ width: 1, height: 24, background: "var(--border)", margin: "0 4px" }} />
              ) : null}

              {/* Status */}
              {validTransitions.includes("rejected") ? (
                <button className="button button--secondary" type="button" onClick={() => updateStatus("rejected")} style={{ borderColor: "var(--danger)", color: "var(--danger)" }}>Mark rejected</button>
              ) : null}

              {validTransitions.includes("expired") ? (
                <button className="button button--ghost" type="button" onClick={() => updateStatus("expired")} style={{ color: "#64748b" }}>Mark expired</button>
              ) : null}

              {/* Divider */}
              {quote.status !== "rejected" && quote.status !== "expired" ? (
                <span style={{ width: 1, height: 24, background: "var(--border)", margin: "0 4px" }} />
              ) : null}

              {/* Documents */}
              {quote.status !== "draft" && quote.status !== "rejected" && quote.status !== "expired" ? (
                <button className="button button--secondary" type="button" disabled={pdfLoading} onClick={downloadPdf}>
                  {pdfLoading ? "Preparing..." : "Download PDF"}
                </button>
              ) : null}

              {quote.status !== "draft" && quote.status !== "rejected" && quote.status !== "expired" ? (
                <button className="button button--ghost" type="button" onClick={() => {
                  const url = `${window.location.origin}/q/${quoteId}`;
                  navigator.clipboard.writeText(url);
                  setStatusError("Share link copied!");
                  setTimeout(() => setStatusError(""), 2000);
                }}>Copy link</button>
              ) : null}

              {/* Divider */}
              {quote.status !== "rejected" && quote.status !== "expired" ? (
                <span style={{ width: 1, height: 24, background: "var(--border)", margin: "0 4px" }} />
              ) : null}

              {/* Payment */}
              {quote.status !== "rejected" && quote.status !== "expired" ? (
                <button className={`button ${quote.paid ? "button--secondary" : "button--ghost"}`} type="button"
                  onClick={() => updateStatus(undefined, !quote.paid)}
                  style={quote.paid ? { borderColor: "var(--success, #065f46)", color: "var(--success, #065f46)" } : {}}
                >
                  {quote.paid ? "✓ Paid" : "Mark paid"}
                </button>
              ) : null}

              {/* Spacer */}
              <span style={{ flex: 1 }} />

              {/* Archive */}
              {(quote.status === "rejected" || quote.status === "expired" || quote.status === "accepted") ? (
                <button className="button button--ghost" type="button" onClick={handleArchive} style={{ fontSize: 12, color: "#94a3b8" }}>
                  Archive
                </button>
              ) : null}
            </div>
          </div>

          {statusError ? (
            <div className="auth-form__error" role="alert" style={{ marginBottom: 18 }}>
              {statusError}
            </div>
          ) : null}

          {/* Schedule status */}
          {hasDate && !isScheduled ? (
            <div style={{
              background: "#fef3c7", border: "1px solid #fcd34d", borderRadius: 8,
              padding: "12px 16px", marginBottom: 20, fontSize: 14, color: "#92400e",
            }}>
              <strong>Date set</strong> — job will be added to calendar once this quote is marked accepted.
              &nbsp;{quote?.jobDate} at {quote?.startTime?.slice(0, 5)}{quote?.endTime ? ` – ${quote?.endTime?.slice(0, 5)}` : ""}
            </div>
          ) : null}

          {isScheduled ? (
            <div style={{
              background: "#d1fae5", border: "1px solid #a7f3d0", borderRadius: 8,
              padding: "12px 16px", marginBottom: 20, display: "flex", alignItems: "center", justifyContent: "space-between",
            }}>
              <div style={{ fontSize: 14, color: "#065f46" }}>
                <strong>Scheduled</strong> on calendar &mdash; {quote.jobDate} at {quote.startTime?.slice(0, 5)}
                {quote.endTime ? ` – ${quote.endTime?.slice(0, 5)}` : ""}
              </div>
              <button className="button button--secondary" onClick={() => setShowJobModal(true)}>Open in calendar</button>
            </div>
          ) : null}

          {isAccepted && !isScheduled ? (
            <div style={{
              background: "#f8fafc", border: "1px solid var(--border)", borderRadius: 8,
              padding: "16px 20px", marginBottom: 20, display: "flex", alignItems: "center", justifyContent: "space-between",
            }}>
              <span style={{ fontSize: 14, color: "#64748b" }}>Add this accepted quote to your job calendar.</span>
              <button
                className="button button--primary"
                onClick={() => setShowJobModal(true)}
              >
                Schedule in calendar
              </button>
            </div>
          ) : null}

          {/* Quote preview body */}
          <div className="qp-preview" id="quote-preview">
            <div className="qp-preview__header">
              <div>
                <span className="qp-preview__number">{quote.quoteNumber}</span>
                <span className={`status-badge status-badge--${quote.status}`}>
                  {statusLabel(quote.status)}
                </span>
              </div>
              <div className="qp-preview__dates">
                <span>Created {formatDate(quote.createdAt)}</span>
                {quote.validUntil ? (
                  <span>Valid until {formatDate(quote.validUntil)}</span>
                ) : null}
              </div>
            </div>

            <div className="qp-preview__customer">
              <h2>Customer</h2>
              <p className="qp-preview__customer-name">{quote.customer.name}</p>
              <p className="qp-preview__customer-detail">{quote.customer.email}</p>
              {quote.customer.phone ? (
                <p className="qp-preview__customer-detail">{quote.customer.phone}</p>
              ) : null}
              {quote.customer.company ? (
                <p className="qp-preview__customer-detail">{quote.customer.company}</p>
              ) : null}
            </div>

            <div className="qp-preview__items">
              <div className="qp-preview__items-head">
                <span>Item</span>
                <span>Qty</span>
                <span>Unit price</span>
                <span>Amount</span>
              </div>
              {quote.items.map((item) => (
                <div className="qp-preview__items-row" key={item.id}>
                  <span className="qp-preview__item-desc">{item.description}</span>
                  <span>{item.quantity}</span>
                  <span>{formatCurrency(item.unitPrice)}</span>
                  <span className="qp-preview__item-amount">{formatCurrency(item.amount)}</span>
                </div>
              ))}
            </div>

            <div className="qp-preview__totals">
              <div className="qp-preview__totals-row">
                <span>Subtotal</span>
                <span>{formatCurrency(quote.subtotal)}</span>
              </div>
              {quote.taxRate > 0 ? (
                <div className="qp-preview__totals-row">
                  <span>Tax ({quote.taxRate}%)</span>
                  <span>{formatCurrency(quote.taxAmount)}</span>
                </div>
              ) : null}
              <div className="qp-preview__totals-row qp-preview__totals-row--final">
                <span>Total</span>
                <span>{formatCurrency(quote.total)}</span>
              </div>
            </div>

            {quote.notes ? (
              <div className="qp-preview__notes">
                <h2>Notes</h2>
                <p>{quote.notes}</p>
              </div>
            ) : null}
          </div>

          {/* Job modal for "Open in calendar" */}
          {showJobModal && quote ? (
            <JobModal
              initial={{
                quoteId: quote.id,
                customerName: quote.customer.name,
                jobTitle: `Job — ${quote.customer.name}`,
                date: quote.jobDate ?? "",
              }}
              onClose={() => setShowJobModal(false)}
              onSaved={() => { setShowJobModal(false); setRefreshKey((k) => k + 1); }}
            />
          ) : null}

          {/* Accept + Schedule modal */}
          {showAcceptModal ? (
            <div
              style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.35)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center" }}
              onClick={() => setShowAcceptModal(false)}
            >
              <div
                style={{ background: "#fff", borderRadius: 12, width: "100%", maxWidth: 420, boxShadow: "0 20px 60px rgba(0,0,0,0.15)", maxHeight: "90vh", overflow: "auto" }}
                onClick={(e) => e.stopPropagation()}
              >
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "20px 24px 0" }}>
                  <div>
                    <h2 style={{ fontSize: 18, fontWeight: 700, margin: 0 }}>Accept quote</h2>
                    <p style={{ fontSize: 14, color: "#64748b", margin: "4px 0 0" }}>
                      {quote?.quoteNumber} — {quote?.customer.name}
                    </p>
                  </div>
                  <button style={{ background: "none", border: "none", fontSize: 22, cursor: "pointer", color: "#64748b", padding: "0 4px" }} onClick={() => setShowAcceptModal(false)}>&times;</button>
                </div>

                <div style={{ padding: "16px 24px 24px" }}>
                  <p style={{ fontSize: 14, fontWeight: 600, color: "#0f172a", margin: "0 0 14px" }}>
                    Schedule this job on your calendar
                  </p>

                  <div style={{ marginBottom: 14 }}>
                    <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#334155", marginBottom: 4 }}>Date</label>
                    <input
                      type="date"
                      style={{ width: "100%", padding: "8px 12px", border: "1px solid #e5e7eb", borderRadius: 6, fontSize: 14, outline: "none", boxSizing: "border-box" }}
                      value={schedDate}
                      onChange={(e) => setSchedDate(e.target.value)}
                    />
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 14 }}>
                    <div>
                      <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#334155", marginBottom: 4 }}>Start time</label>
                      <input
                        type="time"
                        style={{ width: "100%", padding: "8px 12px", border: "1px solid #e5e7eb", borderRadius: 6, fontSize: 14, outline: "none", boxSizing: "border-box" }}
                        value={schedStart}
                        onChange={(e) => setSchedStart(e.target.value)}
                      />
                    </div>
                    <div>
                      <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#334155", marginBottom: 4 }}>End time</label>
                      <input
                        type="time"
                        style={{ width: "100%", padding: "8px 12px", border: "1px solid #e5e7eb", borderRadius: 6, fontSize: 14, outline: "none", boxSizing: "border-box" }}
                        value={schedEnd}
                        onChange={(e) => setSchedEnd(e.target.value)}
                      />
                    </div>
                  </div>

                  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    <button
                      style={{
                        padding: "10px 0", borderRadius: 6, fontSize: 14, fontWeight: 600, cursor: "pointer", border: "none",
                        background: "#1F6B4F", color: "#fff",
                      }}
                      onClick={() => { setShowAcceptModal(false); updateStatus("accepted"); }}
                    >
                      Accept & Schedule
                    </button>
                    <button
                      style={{
                        padding: "10px 0", borderRadius: 6, fontSize: 14, fontWeight: 500, cursor: "pointer",
                        border: "none", background: "transparent", color: "#64748b",
                      }}
                      onClick={() => {
                        setSchedDate("");
                        setSchedStart("09:00");
                        setSchedEnd("");
                        setShowAcceptModal(false);
                        updateStatus("accepted");
                      }}
                    >
                      Accept without scheduling
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ) : null}
        </>
      ) : null}
    </section>
  );
}
