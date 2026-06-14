"use client";

import Link from "next/link";
import { FormEvent, useEffect, useMemo, useState } from "react";
import { CustomerCreateModal } from "./CustomerCreateModal";
import { useRegion } from "../../hooks/useRegion";
import { CustomerEditModal } from "./CustomerEditModal";
import { ConfirmDialog } from "../ConfirmDialog";
import { useToast } from "../Toast";

type Customer = { id: string; email: string; name: string; phone: string | null; company: string | null; totalQuotes: number; createdAt: string };
type CustomerDetail = Customer & {
  address?: string; city?: string; state?: string; zip?: string; notes?: string | null;
  quotes: Array<{ id: string; quoteNumber: string; status: string; total: number; createdAt: string }>;
  jobs: Array<{ id: string; jobTitle: string; status: string; jobDate: string; startTime: string; endTime: string | null; location: string | null; quoteId: string | null }>;
};

type CustomerListResponse = { customers: Customer[]; total: number };

async function readErrorMessage(r: Response) {
  try { const j = await r.json(); const e = j?.error; return typeof e === "string" ? e : e?.message ?? "Error"; } catch { return "Error"; }
}

export function CustomerListPage() {
  const { formatDate, formatCurrency } = useRegion();
  const [state, setState] = useState<{ status: "loading" } | { status: "error"; error: string } | { status: "success"; data: CustomerListResponse }>({ status: "loading" });
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [refreshKey, setRefreshKey] = useState(0);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editCustomerId, setEditCustomerId] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; name: string } | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [detailCache, setDetailCache] = useState<Record<string, CustomerDetail>>({});
  const { toast } = useToast();

  const query = useMemo(() => {
    const p = new URLSearchParams({ page: "1", limit: "500" });
    if (search.trim()) p.set("search", search.trim());
    return p.toString();
  }, [search]);

  useEffect(() => {
    let c = true;
    (async () => {
      setState({ status: "loading" });
      try {
        const tk = localStorage.getItem("jobstacker_token");
        const r = await fetch(`/api/customers/list?${query}`, { headers: tk ? { Authorization: `Bearer ${tk}` } : {} });
        if (!r.ok) throw new Error(await readErrorMessage(r));
        const d = await r.json() as CustomerListResponse;
        if (c) setState({ status: "success", data: d });
      } catch (e) { if (c) setState({ status: "error", error: e instanceof Error ? e.message : "Error" }); }
    })();
    return () => { c = false; };
  }, [query, refreshKey]);

  async function expandCustomer(id: string) {
    if (expandedId === id) { setExpandedId(null); return; }
    setExpandedId(id);
    if (detailCache[id]) return;
    try {
      const tk = localStorage.getItem("jobstacker_token");
      const r = await fetch(`/api/customers/${id}`, { headers: tk ? { Authorization: `Bearer ${tk}` } : {} });
      if (r.ok) { const d = await r.json(); setDetailCache(prev => ({ ...prev, [id]: d })); }
    } catch { /* */ }
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    setDeleteLoading(true);
    try {
      const tk = localStorage.getItem("jobstacker_token");
      const r = await fetch(`/api/customers/${deleteTarget.id}/delete`, { method: "DELETE", headers: tk ? { Authorization: `Bearer ${tk}` } : {} });
      if (!r.ok) throw new Error(await readErrorMessage(r));
      toast("Customer deleted.", "success");
      setDeleteTarget(null);
      setRefreshKey(k => k + 1);
    } catch (e) { toast(e instanceof Error ? e.message : "Failed.", "error"); } finally { setDeleteLoading(false); }
  }

  const customers = state.status === "success" ? state.data.customers : [];
  const total = state.status === "success" ? state.data.total : 0;

  const BORDER = "#e5e7eb";
  const GREEN = "#1F6B4F";

  return (
    <section className="workspace-page">
      <div className="workspace-page__header">
        <div>
          <p className="workspace-page__eyebrow">Customers</p>
          <h1>Customer records</h1>
          <p>All your customers, their quotes, and jobs in one place.</p>
        </div>
        <button className="button button--primary" type="button" onClick={() => setShowCreateModal(true)}>New customer</button>
      </div>

      <div className="toolbar">
        <form className="search-form" onSubmit={(e) => { e.preventDefault(); setSearch(searchInput); }}>
          <label htmlFor="cs-search">Search customers</label>
          <div className="search-form__row">
            <div className="search-form__wrapper">
              <input id="cs-search" type="search" placeholder="Name, company, or email" value={searchInput} onChange={e => setSearchInput(e.target.value)} />
              {searchInput ? <button className="search-form__clear" type="button" onClick={() => { setSearchInput(""); setSearch(""); }}>&times;</button> : null}
            </div>
            <button className="button button--secondary" type="submit">Search</button>
          </div>
        </form>
        <div className="summary-chip">{state.status === "success" ? `${total} total` : "Loading"}</div>
      </div>

      {state.status === "loading" ? (
        <div className="table-card" aria-busy="true">
          <div className="table-skeleton table-skeleton--header" />
          {Array.from({ length: 5 }).map((_, i) => <div className="table-skeleton" key={i} />)}
        </div>
      ) : state.status === "error" ? (
        <div className="state-panel state-panel--error" role="alert">
          <h2>Could not load customers</h2>
          <p>{state.error}</p>
          <button className="button button--secondary" type="button" onClick={() => setRefreshKey(k => k + 1)}>Retry</button>
        </div>
      ) : customers.length === 0 ? (
        <div className="state-panel">
          <h2>{search ? "No customers match your search" : "No customers yet"}</h2>
          <p>{search ? "Try a different search term." : "Add your first customer to start quoting."}</p>
          {search ? <button className="button button--secondary" onClick={() => { setSearchInput(""); setSearch(""); }}>Clear search</button>
          : <button className="button button--primary" onClick={() => setShowCreateModal(true)}>New customer</button>}
        </div>
      ) : (
        <div className="table-card" style={{ border: `1px solid ${BORDER}`, borderRadius: 8, overflow: "hidden" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 80px 100px 60px", gap: 12, padding: "12px 16px", borderBottom: `1px solid ${BORDER}`, fontSize: 11, fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.05em", background: "#fafafa" }}>
            <span>Customer</span><span>Contact</span><span>Quotes</span><span>Created</span><span />
          </div>
          {customers.map(c => {
            const isOpen = expandedId === c.id;
            const det = detailCache[c.id];
            return (
              <div key={c.id} style={{ borderBottom: `1px solid ${BORDER}` }}>
                {/* Row header — clickable */}
                <div
                  onClick={() => expandCustomer(c.id)}
                  style={{ display: "grid", gridTemplateColumns: "1fr 1fr 80px 100px 60px", gap: 12, padding: "14px 16px", cursor: "pointer", fontSize: 14, alignItems: "center", background: isOpen ? "#f0faf4" : "#fff" }}
                >
                  <div>
                    <div style={{ fontWeight: 700, color: "#0f172a" }}>{c.name}</div>
                    <div style={{ fontSize: 12, color: "#64748b" }}>{c.company ?? "Individual"}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: 13, color: GREEN }}>{c.email}</div>
                    <div style={{ fontSize: 12, color: "#64748b" }}>{c.phone ?? "—"}</div>
                  </div>
                  <div><span className="quote-count" style={c.totalQuotes > 0 ? {} : { opacity: 0.4 }}>{c.totalQuotes}</span></div>
                  <div style={{ fontSize: 13, color: "#64748b" }}>{formatDate(c.createdAt)}</div>
                  <div style={{ fontSize: 11, color: "#94a3b8" }}>{isOpen ? "▲" : "▼"}</div>
                </div>

                {/* Expanded detail */}
                {isOpen && (
                  <div style={{ background: "#f9fcf9", borderTop: `1px solid ${BORDER}`, padding: "16px 20px 20px" }}>
                    {!det ? (
                      <div style={{ padding: 12, textAlign: "center", color: "#94a3b8", fontSize: 13 }}>Loading details...</div>
                    ) : (
                      <>
                        {/* Customer info */}
                        <div style={{ display: "flex", gap: 20, flexWrap: "wrap", marginBottom: 16, fontSize: 13, color: "#475569" }}>
                          {det.company ? <span><strong style={{ color: "#334155" }}>Company:</strong> {det.company}</span> : null}
                          {det.phone ? <span><strong style={{ color: "#334155" }}>Phone:</strong> {det.phone}</span> : null}
                          <span><strong style={{ color: "#334155" }}>Email:</strong> {det.email}</span>
                          {[det.address, det.city, det.state, det.zip].filter(Boolean).length > 0 ? (
                            <span><strong style={{ color: "#334155" }}>Address:</strong> {[det.address, det.city, det.state, det.zip].filter(Boolean).join(", ")}</span>
                          ) : null}
                          {det.notes ? <span style={{ width: "100%" }}><strong style={{ color: "#334155" }}>Notes:</strong> {det.notes}</span> : null}
                        </div>

                        <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
                          <Link className="button button--primary" href={`/quotes/new?customerId=${c.id}`} style={{ fontSize: 13, padding: "7px 16px", textDecoration: "none" }}>+ New quote</Link>
                          <button className="button button--ghost" type="button" onClick={() => setEditCustomerId(c.id)} style={{ fontSize: 13 }}>Edit customer</button>
                        </div>

                        {/* Jobs */}
                        <div style={{ marginBottom: 16 }}>
                          <h3 style={{ fontSize: 13, fontWeight: 700, color: "#334155", margin: "0 0 8px" }}>Jobs ({det.jobs.length})</h3>
                          {det.jobs.length === 0 ? (
                            <p style={{ fontSize: 13, color: "#94a3b8", margin: 0 }}>No jobs yet.</p>
                          ) : (
                            <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                              {det.jobs.slice(0, 5).map(j => (
                                <div key={j.id} style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 13, padding: "6px 10px", background: "#fff", borderRadius: 6, border: `1px solid ${BORDER}` }}>
                                  <span style={{ fontWeight: 600, width: 90 }}>{j.jobDate}</span>
                                  <span style={{ fontWeight: 600, flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{j.jobTitle}</span>
                                  <span style={{ color: j.status === "completed" ? "#065f46" : j.status === "cancelled" ? "#991b1b" : "#1e40af", fontWeight: 600, fontSize: 11, textTransform: "capitalize" }}>{j.status}</span>
                                  {j.quoteId ? <Link href={`/quotes/${j.quoteId}`} style={{ color: GREEN, fontSize: 12, textDecoration: "none", fontWeight: 600 }}>View quote</Link> : null}
                                </div>
                              ))}
                              {det.jobs.length > 5 ? <div style={{ fontSize: 12, color: "#94a3b8", padding: "4px 10px" }}>+{det.jobs.length - 5} more jobs</div> : null}
                            </div>
                          )}
                        </div>

                        {/* Quotes */}
                        <div>
                          <h3 style={{ fontSize: 13, fontWeight: 700, color: "#334155", margin: "0 0 8px" }}>Quotes ({det.quotes.length})</h3>
                          {det.quotes.length === 0 ? (
                            <p style={{ fontSize: 13, color: "#94a3b8", margin: 0 }}>No quotes yet.</p>
                          ) : (
                            <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                              {det.quotes.slice(0, 8).map(q => (
                                <Link key={q.id} href={`/quotes/${q.id}`} style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 13, padding: "6px 10px", background: "#fff", borderRadius: 6, border: `1px solid ${BORDER}`, textDecoration: "none", color: "inherit" }}>
                                  <span style={{ fontWeight: 700, width: 100 }}>{q.quoteNumber}</span>
                                  <span style={{ flex: 1 }}>{formatCurrency(q.total)}</span>
                                  <span style={{ fontSize: 11, fontWeight: 600, color: q.status === "accepted" ? "#065f46" : q.status === "rejected" ? "#991b1b" : q.status === "expired" ? "#64748b" : "#1e40af", padding: "2px 8px", borderRadius: 10, background: q.status === "accepted" ? "#d1fae5" : q.status === "rejected" ? "#fee2e2" : q.status === "expired" ? "#f1f5f9" : "#dbeafe", textTransform: "capitalize" }}>{q.status}</span>
                                  <span style={{ color: "#94a3b8", fontSize: 12 }}>{formatDate(q.createdAt)}</span>
                                </Link>
                              ))}
                              {det.quotes.length > 8 ? <div style={{ fontSize: 12, color: "#94a3b8", padding: "4px 10px" }}>+{det.quotes.length - 8} more quotes</div> : null}
                            </div>
                          )}
                        </div>
                      </>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      <CustomerCreateModal open={showCreateModal} onClose={() => setShowCreateModal(false)} onCreated={() => setRefreshKey(k => k + 1)} />
      <CustomerEditModal open={editCustomerId !== null} customerId={editCustomerId} onClose={() => setEditCustomerId(null)} onUpdated={() => setRefreshKey(k => k + 1)} />
      <ConfirmDialog open={deleteTarget !== null} title="Delete customer" message={`Delete ${deleteTarget?.name}?`} confirmLabel="Delete" variant="danger" loading={deleteLoading} onConfirm={handleDelete} onCancel={() => setDeleteTarget(null)} />
    </section>
  );
}
