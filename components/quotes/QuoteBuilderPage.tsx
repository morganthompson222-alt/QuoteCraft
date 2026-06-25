"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, useEffect, useRef, useState } from "react";
import { useRegion } from "../../hooks/useRegion";

type Customer = {
  id: string;
  name: string;
  email: string;
};

type LineItem = {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
};

type AiMaterial = {
  name: string;
  quantity: number;
  unitPrice: number;
};

type AiResult = {
  description: string;
  materials: AiMaterial[];
  labourCost: number;
  total: number;
};

type FormErrors = {
  customerId?: string;
  items?: string;
  [key: `item_${string}_description`]: string | undefined;
  [key: `item_${string}_quantity`]: string | undefined;
  [key: `item_${string}_unitPrice`]: string | undefined;
};

type AiState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "error"; error: string }
  | { status: "success"; data: AiResult };

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

function generateId() {
  return Math.random().toString(36).substring(2, 9);
}

export function QuoteBuilderPage() {
  const { formatCurrency, formatDate, taxLabel } = useRegion();
  const [mode, setMode] = useState<"builder" | "view">("builder");
  const [createdQuoteId, setCreatedQuoteId] = useState<string | null>(null);

  // View mode state
  const [viewState, setViewState] = useState<{
    status: "loading" | "error" | "success";
    data?: QuoteDetail;
    error?: string;
  }>({ status: "loading" });
  const [statusError, setStatusError] = useState("");
  const [pdfLoading, setPdfLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showSendMenu, setShowSendMenu] = useState(false);
  const [showAcceptModal, setShowAcceptModal] = useState(false);
  const [schedDate, setSchedDate] = useState("");
  const [schedStart, setSchedStart] = useState("09:00");
  const [schedEnd, setSchedEnd] = useState("");

  // Builder mode state
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [customersLoading, setCustomersLoading] = useState(true);
  const [customerId, setCustomerId] = useState("");
  const [items, setItems] = useState<LineItem[]>([
    { id: generateId(), description: "", quantity: 1, unitPrice: 0 },
  ]);
  const [taxRate, setTaxRate] = useState(0);
  const [notes, setNotes] = useState("");
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [imageLoading, setImageLoading] = useState(false);
  const imageRef = useRef<HTMLInputElement>(null);
  const [validUntil, setValidUntil] = useState("");
  const [errors, setErrors] = useState<FormErrors>({});
  const [apiError, setApiError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [aiInput, setAiInput] = useState("");
  const [aiState, setAiState] = useState<AiState>({ status: "idle" });

  // View mode — load quote data when switched
  useEffect(() => {
    if (mode !== "view" || !createdQuoteId) return;
    let isCurrent = true;

    async function loadQuote() {
      setViewState({ status: "loading" });
      try {
        const token = window.localStorage.getItem("jobstacker_token");
        const response = await fetch(`/api/quotes/${createdQuoteId}`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        if (!response.ok) throw new Error(await readErrorMessage(response));
        const data = (await response.json()) as QuoteDetail;
        if (isCurrent) {
          setViewState({ status: "success", data });
          if (data.jobDate) {
            setSchedDate(data.jobDate);
            if (data.startTime) setSchedStart(data.startTime);
            if (data.endTime) setSchedEnd(data.endTime);
          }
        }
      } catch (error) {
        if (isCurrent) {
          setViewState({ status: "error", error: error instanceof Error ? error.message : "Failed to load" });
        }
      }
    }

    loadQuote();
    return () => { isCurrent = false; };
  }, [mode, createdQuoteId]);

  // Builder — load customers & pre-fill from URL
  const searchParams = useSearchParams();
  useEffect(() => {
    let isCurrent = true;
    async function loadCustomers() {
      setCustomersLoading(true);
      try {
        const token = window.localStorage.getItem("jobstacker_token");
        const response = await fetch("/api/customers/list?page=1&limit=100", {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        if (response.ok) {
          const data = (await response.json()) as { customers: Customer[] };
          if (isCurrent) {
            setCustomers(data.customers);
            // Pre-fill customerId from URL if present
            const urlCustomerId = searchParams.get("customerId");
            if (urlCustomerId && data.customers.some(c => c.id === urlCustomerId)) {
              setCustomerId(urlCustomerId);
            }
          }
        }
      } catch {
      } finally {
        if (isCurrent) setCustomersLoading(false);
      }
    }
    loadCustomers();
    return () => { isCurrent = false; };
  }, []);

  function addItem() {
    setItems((prev) => [
      ...prev,
      { id: generateId(), description: "", quantity: 1, unitPrice: 0 },
    ]);
  }

  function removeItem(id: string) {
    if (items.length <= 1) return;
    setItems((prev) => prev.filter((item) => item.id !== id));
  }

  function updateItem(id: string, field: keyof LineItem, value: string | number) {
    setItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, [field]: field === "description" ? (value as string) : Number(value) || 0 } : item,
      ),
    );
  }

  const subtotal = items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
  const taxAmount = subtotal * (taxRate / 100);
  const totalAmt = subtotal + taxAmount;

  function validate(): boolean {
    const nextErrors: FormErrors = {};
    if (!customerId) nextErrors.customerId = "Select a customer.";
    const hasItem = items.some((item) => item.description.trim().length > 0);
    if (!hasItem) nextErrors.items = "Add at least one line item with a description.";
    for (const item of items) {
      if (item.description.trim() && (item.quantity <= 0 || item.unitPrice <= 0)) {
        if (item.quantity <= 0) (nextErrors as Record<string, string>)[`item_${item.id}_quantity`] = "Must be > 0";
        if (item.unitPrice <= 0) (nextErrors as Record<string, string>)[`item_${item.id}_unitPrice`] = "Must be > 0";
      }
    }
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  async function handleImage(f: File) {
    if (f.size > 3.5 * 1024 * 1024) { setApiError("Image must be under 3.5 MB."); return; }
    setApiError("");
    setImageLoading(true);
    try {
      const b64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = () => reject(new Error("Failed"));
        reader.readAsDataURL(f);
      });
      setImageUrl(b64);
    } catch { setApiError("Failed to read image."); }
    finally { setImageLoading(false); }
  }

  async function handleCreate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setApiError("");
    if (!validate()) return;
    setIsSubmitting(true);
    try {
      const token = window.localStorage.getItem("jobstacker_token");
      const body = {
        customerId,
        items: items.filter((item) => item.description.trim()).map((item) => ({
          description: item.description.trim(),
          quantity: item.quantity,
          unitPrice: item.unitPrice,
        })),
        taxRate: taxRate || undefined,
        notes: notes.trim() || undefined,
        validUntil: validUntil || undefined,
        imageUrl: imageUrl || undefined,
      };
      const response = await fetch("/api/quotes/create", {
        method: "POST",
        headers: { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        body: JSON.stringify(body),
      });
      if (!response.ok) throw new Error(await readErrorMessage(response));
      const result = (await response.json()) as { id: string };
      setCreatedQuoteId(result.id);
      setMode("view");
    } catch (error) {
      setApiError(error instanceof Error ? error.message : "Unable to create quote.");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleAiGenerate() {
    if (!aiInput.trim()) return;
    setAiState({ status: "loading" });
    try {
      const token = window.localStorage.getItem("jobstacker_token");
      const response = await fetch("/api/ai/generate-quote", {
        method: "POST",
        headers: { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        body: JSON.stringify({ input: aiInput.trim() }),
      });
      if (response.status === 429) {
        const retryAfter = response.headers.get("Retry-After");
        const msg = retryAfter
          ? `Rate limit reached. Try again in ${retryAfter} second${retryAfter === "1" ? "" : "s"}.`
          : "Rate limit reached. Please wait before generating another quote.";
        setAiState({ status: "error", error: msg });
        return;
      }
      if (!response.ok) throw new Error(await readErrorMessage(response));
      const data = (await response.json()) as AiResult;
      setAiState({ status: "success", data });
    } catch (error) {
      setAiState({ status: "error", error: error instanceof Error ? error.message : "AI generation failed." });
    }
  }

  function applyAiResult() {
    if (aiState.status !== "success") return;
    const aiItems: LineItem[] = aiState.data.materials.map((m) => ({
      id: generateId(),
      description: m.name,
      quantity: m.quantity,
      unitPrice: m.unitPrice,
    }));
    if (aiState.data.labourCost > 0) {
      aiItems.push({ id: generateId(), description: "Labour", quantity: 1, unitPrice: aiState.data.labourCost });
    }
    if (aiItems.length > 0) setItems(aiItems);
    setNotes((prev) => [aiState.data.description, prev].filter(Boolean).join("\n\n"));
    setAiState({ status: "idle" });
    setAiInput("");
  }

  // ─── View mode actions ───

  async function updateView() {
    if (!createdQuoteId) return;
    const token = window.localStorage.getItem("jobstacker_token");
    const response = await fetch(`/api/quotes/${createdQuoteId}`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    if (response.ok) {
      const data = (await response.json()) as QuoteDetail;
      setViewState({ status: "success", data });
    }
  }

  async function updateStatus(newStatus?: string, newPaid?: boolean) {
    if (!createdQuoteId) return;
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
      const response = await fetch(`/api/quotes/${createdQuoteId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        body: JSON.stringify(body),
      });
      if (!response.ok) {
        const errBody = await response.json();
        setStatusError(errBody?.error?.message ?? errBody?.message ?? "Failed to update.");
        return;
      }
      await updateView();
    } catch (error) {
      setStatusError(error instanceof Error ? error.message : "Something went wrong.");
    }
  }

  async function downloadPdf() {
    if (!createdQuoteId) return;
    setPdfLoading(true);
    try {
      const token = window.localStorage.getItem("jobstacker_token");
      const response = await fetch(`/api/quotes/${createdQuoteId}/pdf`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (!response.ok) throw new Error(await readErrorMessage(response));
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `quote-${viewState.data?.quoteNumber ?? createdQuoteId}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      setStatusError(error instanceof Error ? error.message : "Failed to download PDF.");
    } finally {
      setPdfLoading(false);
    }
  }

  async function handleArchive() {
    if (!createdQuoteId) return;
    try {
      const token = window.localStorage.getItem("jobstacker_token");
      await fetch(`/api/quotes/${createdQuoteId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        body: JSON.stringify({ archived: true }),
      });
      window.location.assign("/quotes");
    } catch { /* ok */ }
  }

  // ─── Render ───

  if (mode === "view") {
    const quote = viewState.data;
    const validTransitions = quote ? statusTransitions[quote.status] ?? [] : [];
    const hasDate = quote?.jobDate != null;
    const isScheduled = hasDate && quote?.status === "accepted";
    const isAccepted = quote?.status === "accepted";

    return (
      <section className="workspace-page">
        <div className="workspace-page__header">
          <div>
            <Link href="/quotes" style={{ color: "var(--text-muted)", fontSize: 14, fontWeight: 650, marginBottom: 8, display: "inline-block" }}>
              &larr; Back to quotes
            </Link>
            <p className="workspace-page__eyebrow">Quote</p>
            {quote ? <h1>{quote.quoteNumber}</h1> : <h1>Quote details</h1>}
          </div>
        </div>

        {viewState.status === "loading" ? (
          <div className="table-card" aria-busy="true">
            <div className="table-skeleton table-skeleton--header" />
            {Array.from({ length: 6 }).map((_, i) => (<div className="table-skeleton" key={i} />))}
          </div>
        ) : null}

        {viewState.status === "error" ? (
          <div className="state-panel state-panel--error" role="alert">
            <h2>Quote could not be loaded</h2>
            <p>{viewState.error}</p>
            <button className="button button--secondary" type="button" onClick={updateView}>
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
                          <button type="button" onClick={async () => { setShowSendMenu(false); await updateStatus("sent"); }} style={{ display: "block", width: "100%", padding: "12px 16px", textAlign: "left", border: "none", background: "none", cursor: "pointer", fontSize: 14, fontWeight: 600, color: "#0f172a", borderBottom: "1px solid var(--border)" }}>
                            Share link
                            <span style={{ display: "block", fontSize: 12, fontWeight: 400, color: "#64748b", marginTop: 1 }}>Copy link & mark as sent</span>
                          </button>
                          <button type="button" onClick={async () => { setShowSendMenu(false); await downloadPdf(); }} style={{ display: "block", width: "100%", padding: "12px 16px", textAlign: "left", border: "none", background: "none", cursor: "pointer", fontSize: 14, fontWeight: 600, color: "#0f172a" }}>
                            Download PDF
                            <span style={{ display: "block", fontSize: 12, fontWeight: 400, color: "#64748b", marginTop: 1 }}>Send via email or print</span>
                          </button>
                        </div>
                      </>
                    ) : null}
                  </div>
                ) : null}

                {validTransitions.includes("sent") && quote.status !== "draft" ? (
                  <button className="button button--primary" type="button" onClick={() => updateStatus("sent")}>Mark as sent</button>
                ) : null}

                {validTransitions.includes("accepted") ? (
                  <button className="button button--primary" type="button" onClick={() => setShowAcceptModal(true)}>Mark accepted</button>
                ) : null}

                {(validTransitions.includes("rejected") || validTransitions.includes("expired")) ? (
                  <span style={{ width: 1, height: 24, background: "var(--border)", margin: "0 4px" }} />
                ) : null}

                {validTransitions.includes("rejected") ? (
                  <button className="button button--secondary" type="button" onClick={() => updateStatus("rejected")} style={{ borderColor: "var(--danger)", color: "var(--danger)" }}>Mark rejected</button>
                ) : null}

                {validTransitions.includes("expired") ? (
                  <button className="button button--ghost" type="button" onClick={() => updateStatus("expired")} style={{ color: "#64748b" }}>Mark expired</button>
                ) : null}

                {quote.status !== "rejected" && quote.status !== "expired" ? (
                  <span style={{ width: 1, height: 24, background: "var(--border)", margin: "0 4px" }} />
                ) : null}

                {quote.status !== "draft" && quote.status !== "rejected" && quote.status !== "expired" ? (
                  <button className="button button--secondary" type="button" disabled={pdfLoading} onClick={downloadPdf}>
                    {pdfLoading ? "Preparing..." : "Download PDF"}
                  </button>
                ) : null}

                {quote.status !== "draft" && quote.status !== "rejected" && quote.status !== "expired" ? (
                  <button className="button button--ghost" type="button" onClick={() => {
                    const url = `${window.location.origin}/q/${createdQuoteId}`;
                    navigator.clipboard.writeText(url);
                    setStatusError("Share link copied!");
                    setTimeout(() => setStatusError(""), 2000);
                  }}>Copy link</button>
                ) : null}

                {quote.status !== "rejected" && quote.status !== "expired" ? (
                  <span style={{ width: 1, height: 24, background: "var(--border)", margin: "0 4px" }} />
                ) : null}

                {quote.status !== "rejected" && quote.status !== "expired" ? (
                  <button className={`button ${quote.paid ? "button--secondary" : "button--ghost"}`} type="button"
                    onClick={() => updateStatus(undefined, !quote.paid)}
                    style={quote.paid ? { borderColor: "var(--success, #065f46)", color: "var(--success, #065f46)" } : {}}
                  >
                    {quote.paid ? "✓ Paid" : "Mark paid"}
                  </button>
                ) : null}

                <span style={{ flex: 1 }} />

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

            {/* Schedule status banners */}
            {hasDate && !isScheduled ? (
              <div style={{ background: "#fef3c7", border: "1px solid #fcd34d", borderRadius: 8, padding: "12px 16px", marginBottom: 20, fontSize: 14, color: "#92400e" }}>
                <strong>Date set</strong> — job will be added to calendar once this quote is marked accepted.
                &nbsp;{quote.jobDate} at {quote.startTime?.slice(0, 5)}{quote.endTime ? ` – ${quote.endTime?.slice(0, 5)}` : ""}
              </div>
            ) : null}

            {isScheduled ? (
              <div style={{ background: "#d1fae5", border: "1px solid #a7f3d0", borderRadius: 8, padding: "12px 16px", marginBottom: 20, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div style={{ fontSize: 14, color: "#065f46" }}>
                  <strong>Scheduled</strong> on calendar &mdash; {quote.jobDate} at {quote.startTime?.slice(0, 5)}{quote.endTime ? ` – ${quote.endTime?.slice(0, 5)}` : ""}
                </div>
                <Link className="button button--ghost" href="/calendar" style={{ fontSize: 13 }}>View on calendar</Link>
              </div>
            ) : null}

            {isAccepted && !isScheduled ? (
              <div style={{ background: "#f8fafc", border: "1px solid var(--border)", borderRadius: 8, padding: "16px 20px", marginBottom: 20, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <span style={{ fontSize: 14, color: "#64748b" }}>Quote accepted. Add this to your job calendar.</span>
                <button className="button button--primary" onClick={() => setShowAcceptModal(true)}>Schedule now</button>
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
                  {quote.validUntil ? <span>Valid until {formatDate(quote.validUntil)}</span> : null}
                </div>
              </div>
              <div className="qp-preview__customer">
                <h2>Customer</h2>
                <p className="qp-preview__customer-name">{quote.customer.name}</p>
                <p className="qp-preview__customer-detail">{quote.customer.email}</p>
                {quote.customer.phone ? <p className="qp-preview__customer-detail">{quote.customer.phone}</p> : null}
                {quote.customer.company ? <p className="qp-preview__customer-detail">{quote.customer.company}</p> : null}
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
                    <span>{taxLabel} ({quote.taxRate}%)</span>
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

            {/* Accept + Schedule modal */}
            {showAcceptModal ? (
              <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.35)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center" }}
                onClick={() => setShowAcceptModal(false)}>
                <div style={{ background: "#fff", borderRadius: 12, width: "100%", maxWidth: 420, boxShadow: "0 20px 60px rgba(0,0,0,0.15)" }}
                  onClick={(e) => e.stopPropagation()}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "20px 24px 0" }}>
                    <div>
                      <h2 style={{ fontSize: 18, fontWeight: 700, margin: 0 }}>Accept quote</h2>
                      <p style={{ fontSize: 14, color: "#64748b", margin: "4px 0 0" }}>
                        {quote.quoteNumber} — {quote.customer.name}
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
                      <input type="date" style={{ width: "100%", padding: "8px 12px", border: "1px solid #e5e7eb", borderRadius: 6, fontSize: 14, outline: "none", boxSizing: "border-box" }}
                        value={schedDate} onChange={(e) => setSchedDate(e.target.value)} />
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 14 }}>
                      <div>
                        <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#334155", marginBottom: 4 }}>Start time</label>
                        <input type="time" style={{ width: "100%", padding: "8px 12px", border: "1px solid #e5e7eb", borderRadius: 6, fontSize: 14, outline: "none", boxSizing: "border-box" }}
                          value={schedStart} onChange={(e) => setSchedStart(e.target.value)} />
                      </div>
                      <div>
                        <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#334155", marginBottom: 4 }}>End time</label>
                        <input type="time" style={{ width: "100%", padding: "8px 12px", border: "1px solid #e5e7eb", borderRadius: 6, fontSize: 14, outline: "none", boxSizing: "border-box" }}
                          value={schedEnd} onChange={(e) => setSchedEnd(e.target.value)} />
                      </div>
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                      <button style={{ padding: "10px 0", borderRadius: 6, fontSize: 14, fontWeight: 600, cursor: "pointer", border: "none", background: "#1F6B4F", color: "#fff" }}
                        onClick={() => { setShowAcceptModal(false); updateStatus("accepted"); }}>
                        Accept & Schedule
                      </button>
                      <button style={{ padding: "10px 0", borderRadius: 6, fontSize: 14, fontWeight: 500, cursor: "pointer", border: "none", background: "transparent", color: "#64748b" }}
                        onClick={() => { setSchedDate(""); setSchedStart("09:00"); setSchedEnd(""); setShowAcceptModal(false); updateStatus("accepted"); }}>
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

  // ─── Builder mode ───

  return (
    <section className="workspace-page">
      <div className="workspace-page__header">
        <div>
          <Link href="/quotes" style={{ color: "var(--text-muted)", fontSize: 14, fontWeight: 650, marginBottom: 8, display: "inline-block" }}>
            &larr; Back to quotes
          </Link>
          <p className="workspace-page__eyebrow">Quotes</p>
          <h1>New quote</h1>
          <p>Fill in the customer details and line items to create a quote.</p>
        </div>
      </div>

      <div className="table-card">
        <h2 className="bp-section__title">
          Generate with AI
          <span style={{ color: "var(--text-muted)", fontSize: 13, fontWeight: 650 }}>Powered by GPT-4o</span>
        </h2>
        <div className="bp-section__body">
          <div className="field">
            <label htmlFor="ai-input">Describe the job in natural language</label>
            <textarea
              id="ai-input"
              className="bp-textarea"
              placeholder='e.g. "Replace a leaking hot water cylinder in a 3-bedroom house, including new copper piping and pressure relief valve install"'
              value={aiInput}
              onChange={(e) => setAiInput(e.target.value)}
              style={{ minHeight: 80 }}
            />
          </div>
          <div className="ai-toolbar">
            <button className="button button--primary" type="button" disabled={aiState.status === "loading" || !aiInput.trim()} onClick={handleAiGenerate}>
              {aiState.status === "loading" ? "Generating..." : "Generate quote"}
            </button>
            {aiState.status === "success" ? (
              <button className="button button--secondary" type="button" onClick={applyAiResult}>Apply to form</button>
            ) : null}
          </div>
          {aiState.status === "loading" ? (
            <div className="ai-loading" aria-busy="true">
              <div className="ai-loading__spinner" />
              <span>AI is drafting your quote...</span>
            </div>
          ) : null}
          {aiState.status === "error" ? (
            <div className="auth-form__error" role="alert" style={{ marginTop: 12 }}>{aiState.error}</div>
          ) : null}
          {aiState.status === "success" ? (
            <div className="ai-result">
              <p className="ai-result__desc">{aiState.data.description}</p>
              <div className="ai-result__items">
                <div className="ai-result__items-head">
                  <span>Item</span>
                  <span>Qty</span>
                  <span>Unit price</span>
                  <span>Amount</span>
                </div>
                {aiState.data.materials.map((m, i) => (
                  <div className="ai-result__items-row" key={i}>
                    <span>{m.name}</span>
                    <span>{m.quantity}</span>
                    <span>{formatCurrency(m.unitPrice)}</span>
                    <span>{formatCurrency(m.quantity * m.unitPrice)}</span>
                  </div>
                ))}
                {aiState.data.labourCost > 0 ? (
                  <div className="ai-result__items-row">
                    <span>Labour</span>
                    <span>1</span>
                    <span>{formatCurrency(aiState.data.labourCost)}</span>
                    <span>{formatCurrency(aiState.data.labourCost)}</span>
                  </div>
                ) : null}
              </div>
              <div className="ai-result__total">
                <span>Estimated total</span>
                <strong>{formatCurrency(aiState.data.total)}</strong>
              </div>
            </div>
          ) : null}
        </div>
      </div>

      <form className="quote-builder" onSubmit={handleCreate} noValidate>
        <div className="table-card">
          <h2 className="bp-section__title">Customer</h2>
          <div className="bp-section__body">
            <div className="field">
              <label htmlFor="quote-customer">Customer *</label>
              {customersLoading ? (
                <p style={{ color: "var(--text-muted)", fontSize: 14, margin: "8px 0", padding: "10px 0" }}>Loading customers...</p>
              ) : (
                <select
                  id="quote-customer"
                  className="filter-select"
                  style={{ width: "100%", maxWidth: 400 }}
                  value={customerId}
                  onChange={(e) => { setCustomerId(e.target.value); if (errors.customerId) { const next = { ...errors }; delete next.customerId; setErrors(next); } }}
                  aria-invalid={Boolean(errors.customerId)}
                >
                  <option value="">Select a customer</option>
                  {customers.map((c) => (
                    <option key={c.id} value={c.id}>{c.name} — {c.email}</option>
                  ))}
                </select>
              )}
              {errors.customerId ? <p className="field__error">{errors.customerId}</p> : null}
              {!customersLoading && customers.length === 0 ? (
                <p style={{ color: "var(--text-muted)", fontSize: 13, marginTop: 6 }}>
                  No customers found.{" "}
                  <a href="/customers" style={{ color: "var(--brand)", fontWeight: 750 }}>Create one first</a>.
                </p>
              ) : null}
            </div>
          </div>
        </div>

        <div className="table-card">
          <h2 className="bp-section__title">
            Line items
            <button className="button button--ghost" type="button" onClick={addItem} style={{ fontSize: 13, minHeight: 34 }}>+ Add item</button>
          </h2>
          <div className="bp-section__body">
            {errors.items ? <p className="field__error" style={{ marginBottom: 12 }}>{errors.items}</p> : null}
            <div className="line-items">
              <div className="line-items__head">
                <span>Description</span>
                <span>Qty</span>
                <span>Unit price</span>
                <span>Amount</span>
                <span></span>
              </div>
              {items.map((item) => (
                <div className="line-items__row" key={item.id}>
                  <input className="line-items__input" type="text" placeholder="Item description"
                    value={item.description} onChange={(e) => updateItem(item.id, "description", e.target.value)}
                    aria-invalid={Boolean(item.description.trim() && item.quantity <= 0 && errors[`item_${item.id}_quantity`])} />
                  <input className="line-items__input line-items__input--narrow" type="number" min="0" step="1"
                    value={item.quantity} onChange={(e) => updateItem(item.id, "quantity", e.target.value)}
                    aria-invalid={Boolean(item.description.trim() && item.quantity <= 0 && errors[`item_${item.id}_quantity`])} />
                  <input className="line-items__input line-items__input--narrow" type="number" min="0" step="0.01"
                    value={item.unitPrice} onChange={(e) => updateItem(item.id, "unitPrice", e.target.value)}
                    aria-invalid={Boolean(item.description.trim() && item.unitPrice <= 0 && errors[`item_${item.id}_unitPrice`])} />
                  <span className="line-items__amount">{formatCurrency(item.quantity * item.unitPrice)}</span>
                  <button className="line-items__remove" type="button" disabled={items.length <= 1} onClick={() => removeItem(item.id)} aria-label="Remove item">&times;</button>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="table-card">
          <h2 className="bp-section__title">Totals</h2>
          <div className="bp-section__body">
            <div className="totals-grid">
              <div className="totals-grid__row">
                <span>Subtotal</span>
                <span>{formatCurrency(subtotal)}</span>
              </div>
              <div className="totals-grid__row">
                <div className="field" style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                  <label htmlFor="tax-rate" style={{ whiteSpace: "nowrap", margin: 0 }}>Tax rate (%)</label>
                  <input id="tax-rate" className="line-items__input line-items__input--narrow" type="number" min="0" max="100" step="0.1"
                    value={taxRate} onChange={(e) => setTaxRate(Number(e.target.value) || 0)} style={{ width: 80, minHeight: 36 }} />
                </div>
                <span>{formatCurrency(taxAmount)}</span>
              </div>
              <div className="totals-grid__row totals-grid__row--total">
                <span>Total</span>
                <span>{formatCurrency(totalAmt)}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="table-card">
          <h2 className="bp-section__title">Additional details</h2>
          <div className="bp-section__body bp-section__body--cols">
            <div className="field">
              <label htmlFor="quote-notes">Notes</label>
              <textarea id="quote-notes" className="bp-textarea" placeholder="Payment terms, scope notes, etc." value={notes} onChange={(e) => setNotes(e.target.value)} />
            </div>
            <div className="field">
              <label htmlFor="quote-valid">Valid until</label>
              <input id="quote-valid" className="line-items__input" type="date" value={validUntil} onChange={(e) => setValidUntil(e.target.value)} style={{ minHeight: 42 }} />
            </div>
            <div className="field" style={{ gridColumn: "1 / -1" }}>
              <label>Attach image</label>
              {imageUrl ? (
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <img src={imageUrl} alt="Attached" style={{ maxHeight: 80, maxWidth: 160, objectFit: "contain", borderRadius: 4, border: "1px solid var(--border)" }} />
                  <button className="button button--ghost" type="button" onClick={() => { setImageUrl(null); if (imageRef.current) imageRef.current.value = ""; }} style={{ fontSize: 12 }}>Remove</button>
                </div>
              ) : (
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <input ref={imageRef} type="file" accept="image/*" style={{ fontSize: 13 }} onChange={(e) => { const f = e.target.files?.[0]; if (f) handleImage(f); }} />
                  {imageLoading ? <span style={{ fontSize: 12, color: "var(--text-muted)" }}>Loading...</span> : null}
                </div>
              )}
            </div>
          </div>
        </div>

        {apiError ? <div className="auth-form__error" role="alert">{apiError}</div> : null}

        <div className="bp-actions">
          <Link className="button button--secondary" href="/quotes">Cancel</Link>
          <button className="button button--primary" type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Creating..." : "Create quote"}
          </button>
        </div>
      </form>
    </section>
  );
}
