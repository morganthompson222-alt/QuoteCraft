"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

type PublicQuote = {
  id: string;
  quoteNumber: string;
  status: string;
  subtotal: number;
  taxRate: number;
  taxAmount: number;
  total: number;
  notes: string | null;
  imageUrl: string | null;
  validUntil: string | null;
  createdAt: string;
  companyName: string;
  companyLogo: string | null;
  companyPhone: string | null;
  customer: { name: string; email: string; company: string | null };
  items: Array<{ description: string; quantity: number; unitPrice: number; amount: number }>;
};

const GREEN = "#1F6B4F";

export default function QuoteViewPage() {
  const { id } = useParams<{ id: string }>();
  const [quote, setQuote] = useState<PublicQuote | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [acting, setActing] = useState(false);
  const [actError, setActError] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const r = await fetch(`/api/public/quotes/${id}`);
        if (!r.ok) throw new Error("Quote not found");
        setQuote(await r.json());
      } catch (x) {
        setError(x instanceof Error ? x.message : "Failed to load");
      } finally { setLoading(false); }
    })();
  }, [id]);

  async function handleAction(action: "accepted" | "rejected") {
    setActing(true); setActError("");
    try {
      const r = await fetch(`/api/public/quotes/${id}/action`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });
      if (!r.ok) {
        const j = await r.json().catch(() => ({}));
        throw new Error(j?.error?.message ?? "Failed");
      }
      setQuote((q) => q ? { ...q, status: action } : null);
    } catch (x) {
      setActError(x instanceof Error ? x.message : "Failed");
    } finally { setActing(false); }
  }

  if (loading) return <div style={{ padding: 60, textAlign: "center", fontFamily: "system-ui, sans-serif", color: "#64748b" }}>Loading quote...</div>;
  if (error || !quote) return <div style={{ padding: 60, textAlign: "center", fontFamily: "system-ui, sans-serif" }}><h2 style={{ color: "#b91c1c" }}>Quote not found</h2><p style={{ color: "#64748b" }}>This quote may have been removed or the link is incorrect.</p></div>;

  const isActionable = quote.status === "sent";
  const isAccepted = quote.status === "accepted";
  const isRejected = quote.status === "rejected";

  return (
    <div style={{ maxWidth: 640, margin: "0 auto", padding: "40px 24px", fontFamily: "system-ui, -apple-system, sans-serif" }}>
      {/* Company header */}
      <div style={{ marginBottom: 28, borderBottom: `1px solid #e5e7eb`, paddingBottom: 20 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            {quote.companyLogo ? (
              <img src={quote.companyLogo} alt={quote.companyName} style={{ maxHeight: 40, marginBottom: 8 }} />
            ) : null}
            <h1 style={{ fontSize: 22, fontWeight: 800, color: "#0f172a", margin: 0 }}>{quote.companyName}</h1>
            {quote.companyPhone ? <p style={{ fontSize: 13, color: "#64748b", margin: "4px 0 0" }}>{quote.companyPhone}</p> : null}
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: GREEN }}>QUOTE</div>
            <div style={{ fontSize: 18, fontWeight: 800, color: "#0f172a" }}>{quote.quoteNumber}</div>
          </div>
        </div>
      </div>

      {/* Status banner */}
      {isAccepted ? (
        <div style={{ background: "#d1fae5", borderRadius: 8, padding: "14px 18px", marginBottom: 20, color: "#065f46", fontWeight: 600, fontSize: 14 }}>
          ✓ You have accepted this quote.
        </div>
      ) : isRejected ? (
        <div style={{ background: "#fee2e2", borderRadius: 8, padding: "14px 18px", marginBottom: 20, color: "#991b1b", fontWeight: 600, fontSize: 14 }}>
          ✗ You have declined this quote.
        </div>
      ) : null}

      {/* Customer info */}
      <div style={{ marginBottom: 20, fontSize: 14, color: "#334155" }}>
        <div style={{ fontWeight: 600, color: "#0f172a", marginBottom: 4 }}>Prepared for</div>
        <div>{quote.customer.name}</div>
        {quote.customer.company ? <div>{quote.customer.company}</div> : null}
        <div style={{ color: "#64748b", fontSize: 13 }}>{quote.customer.email}</div>
      </div>

      {/* Meta */}
      <div style={{ display: "flex", gap: 40, marginBottom: 24, fontSize: 13, color: "#64748b" }}>
        <div>Date: {new Date(quote.createdAt).toLocaleDateString()}</div>
        {quote.validUntil ? <div>Valid until: {new Date(quote.validUntil).toLocaleDateString()}</div> : null}
      </div>

      {/* Attached image */}
      {quote.imageUrl ? (
        <div style={{ marginBottom: 20 }}>
          <img src={quote.imageUrl} alt="Quote attachment" style={{ maxWidth: "100%", maxHeight: 300, borderRadius: 6, border: "1px solid #e5e7eb" }} />
        </div>
      ) : null}

      {/* Line items */}
      <div style={{ borderRadius: 8, border: "1px solid #e5e7eb", overflow: "hidden", marginBottom: 20 }}>
        <div style={{ display: "flex", padding: "10px 16px", background: "#f9fafb", fontSize: 11, fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.05em" }}>
          <span style={{ flex: 1 }}>Item</span>
          <span style={{ width: 60, textAlign: "center" }}>Qty</span>
          <span style={{ width: 90, textAlign: "right" }}>Unit price</span>
          <span style={{ width: 90, textAlign: "right" }}>Amount</span>
        </div>
        {quote.items.map((item, i) => (
          <div key={i} style={{ display: "flex", padding: "10px 16px", borderTop: "1px solid #e5e7eb", fontSize: 14, color: "#334155" }}>
            <span style={{ flex: 1 }}>{item.description}</span>
            <span style={{ width: 60, textAlign: "center" }}>{item.quantity}</span>
            <span style={{ width: 90, textAlign: "right" }}>£{item.unitPrice.toFixed(2)}</span>
            <span style={{ width: 90, textAlign: "right", fontWeight: 600 }}>£{item.amount.toFixed(2)}</span>
          </div>
        ))}
      </div>

      {/* Totals */}
      <div style={{ textAlign: "right", marginBottom: 24 }}>
        <div style={{ display: "flex", justifyContent: "flex-end", gap: 40, fontSize: 14, color: "#64748b", marginBottom: 4 }}>
          <span>Subtotal</span><span style={{ width: 90, textAlign: "right" }}>£{quote.subtotal.toFixed(2)}</span>
        </div>
        {quote.taxRate > 0 ? (
          <div style={{ display: "flex", justifyContent: "flex-end", gap: 40, fontSize: 14, color: "#64748b", marginBottom: 4 }}>
            <span>Tax ({quote.taxRate}%)</span><span style={{ width: 90, textAlign: "right" }}>£{quote.taxAmount.toFixed(2)}</span>
          </div>
        ) : null}
        <div style={{ display: "flex", justifyContent: "flex-end", gap: 40, fontSize: 18, fontWeight: 800, color: "#0f172a", borderTop: "2px solid #e5e7eb", paddingTop: 8, marginTop: 8 }}>
          <span>Total</span><span style={{ width: 90, textAlign: "right" }}>£{quote.total.toFixed(2)}</span>
        </div>
      </div>

      {/* Notes */}
      {quote.notes ? (
        <div style={{ background: "#f9fafb", borderRadius: 8, padding: "14px 18px", marginBottom: 24, fontSize: 14, color: "#475569", border: "1px solid #e5e7eb" }}>
          <div style={{ fontWeight: 600, color: "#334155", marginBottom: 4 }}>Notes</div>
          {quote.notes}
        </div>
      ) : null}

      {/* Action buttons */}
      {isActionable ? (
        <div style={{ display: "flex", gap: 12 }}>
          <button
            onClick={() => handleAction("accepted")}
            disabled={acting}
            style={{
              flex: 1, padding: "14px 24px", borderRadius: 8, fontSize: 16, fontWeight: 700,
              border: "none", cursor: "pointer", background: GREEN, color: "#fff",
            }}
          >
            {acting ? "..." : "Accept quote"}
          </button>
          <button
            onClick={() => handleAction("rejected")}
            disabled={acting}
            style={{
              padding: "14px 24px", borderRadius: 8, fontSize: 16, fontWeight: 600,
              border: "1px solid #e5e7eb", cursor: "pointer", background: "#fff", color: "#64748b",
            }}
          >
            {acting ? "..." : "Decline"}
          </button>
        </div>
      ) : null}

      {actError ? (
        <div style={{ marginTop: 12, padding: "10px 16px", background: "#fef2f2", color: "#991b1b", borderRadius: 8, fontSize: 13 }}>
          {actError}
        </div>
      ) : null}

      <div style={{ marginTop: 40, textAlign: "center", fontSize: 12, color: "#94a3b8" }}>
        Sent via JobStacker &middot; {quote.companyName}
      </div>
    </div>
  );
}
