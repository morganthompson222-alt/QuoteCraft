"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ConfirmDialog } from "../ConfirmDialog";
import { useRegion } from "../../hooks/useRegion";
import { useToast } from "../Toast";
import { JobModal } from "../jobs/JobModal";

type Quote = {
  id: string;
  quoteNumber: string;
  customerId: string;
  customerName: string;
  status: string;
  total: number;
  paid: boolean;
  paidAt: string | null;
  createdAt: string;
};

type JobInfo = {
  id: string;
  quote_id: string | null;
  status: string;
  customer_name: string;
};

type QuoteListResponse = {
  quotes: Quote[];
  total: number;
  page: number;
  limit: number;
};

type ListState =
  | { status: "loading"; data?: undefined; error?: undefined }
  | { status: "error"; data?: undefined; error: string }
  | { status: "success"; data: QuoteListResponse; error?: undefined };

const statusOptions = [
  { value: "", label: "All statuses" },
  { value: "draft", label: "Draft" },
  { value: "sent", label: "Sent" },
  { value: "accepted", label: "Accepted" },
  { value: "rejected", label: "Rejected" },
  { value: "expired", label: "Expired" },
];

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
    return "Unable to load quotes.";
  } catch {
    return "Unable to load quotes.";
  }
}

export function QuoteListPage() {
  const { formatCurrency, formatDate } = useRegion();
  const [state, setState] = useState<ListState>({ status: "loading" });
  const [statusFilter, setStatusFilter] = useState("");
  const [paidFilter, setPaidFilter] = useState("");
  const [refreshKey, setRefreshKey] = useState(0);
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; number: string } | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [jobs, setJobs] = useState<JobInfo[]>([]);
  const [scheduleQuote, setScheduleQuote] = useState<{ id: string; customerName: string } | null>(null);
  const { toast } = useToast();

  const query = useMemo(() => {
    const params = new URLSearchParams({ page: "1", limit: "50" });
    if (statusFilter) params.set("status", statusFilter);
    if (paidFilter) params.set("paid", paidFilter);
    return params.toString();
  }, [statusFilter, paidFilter]);

  useEffect(() => {
    let isCurrent = true;
    async function loadQuotes() {
      setState({ status: "loading" });
      try {
        const token = window.localStorage.getItem("quotecraft_token");
        const [quotesRes, jobsRes] = await Promise.all([
          fetch(`/api/quotes/list?${query}`, { headers: token ? { Authorization: `Bearer ${token}` } : {} }),
          fetch("/api/jobs/list?limit=100", { headers: token ? { Authorization: `Bearer ${token}` } : {} }),
        ]);

        if (!quotesRes.ok) throw new Error(await readErrorMessage(quotesRes));
        const data = (await quotesRes.json()) as QuoteListResponse;

        if (jobsRes.ok) {
          const jobsData = await jobsRes.json();
          setJobs(jobsData.jobs ?? []);
        }

        if (isCurrent) setState({ status: "success", data });
      } catch (error) {
        if (isCurrent) {
          setState({ status: "error", error: error instanceof Error ? error.message : "Unable to load quotes." });
        }
      }
    }
    loadQuotes();
    return () => { isCurrent = false; };
  }, [query, refreshKey]);

  const quotes = state.status === "success" ? state.data.quotes : [];
  const total = state.status === "success" ? state.data.total : 0;
  const isEmpty = state.status === "success" && quotes.length === 0;

  const jobByQuote = useMemo(() => {
    const map = new Map<string, JobInfo>();
    for (const j of jobs) {
      if (j.quote_id && !map.has(j.quote_id)) map.set(j.quote_id, j);
    }
    return map;
  }, [jobs]);

  async function handleDelete() {
    if (!deleteTarget) return;
    setDeleteLoading(true);
    try {
      const token = window.localStorage.getItem("quotecraft_token");
      const response = await fetch(`/api/quotes/${deleteTarget.id}/delete`, {
        method: "DELETE",
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (!response.ok) throw new Error(await readErrorMessage(response));
      toast("Quote deleted.", "success");
      setDeleteTarget(null);
      setRefreshKey((k) => k + 1);
    } catch (error) {
      toast(error instanceof Error ? error.message : "Failed to delete quote.", "error");
    } finally {
      setDeleteLoading(false);
    }
  }

  return (
    <section className="workspace-page">
      <div className="workspace-page__header">
        <div>
          <p className="workspace-page__eyebrow">Quotes</p>
          <h1>Quote records</h1>
          <p>Review, send, and manage all your customer quotes in one place.</p>
        </div>
        <Link className="button button--primary" href="/quotes/new">New quote</Link>
      </div>

      <div className="toolbar">
        <div className="filter-group">
          <label htmlFor="quote-status-filter">Status</label>
          <select id="quote-status-filter" className="filter-select" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            {statusOptions.map((opt) => (<option key={opt.value} value={opt.value}>{opt.label}</option>))}
          </select>
        </div>
        <div className="filter-group">
          <label htmlFor="quote-paid-filter">Payment</label>
          <select id="quote-paid-filter" className="filter-select" value={paidFilter} onChange={(e) => setPaidFilter(e.target.value)}>
            <option value="">All</option>
            <option value="true">Paid</option>
            <option value="false">Unpaid</option>
          </select>
        </div>
        <div className="summary-chip" aria-live="polite">
          {state.status === "success" ? `${total} total` : "Loading"}
        </div>
      </div>

      {state.status === "loading" ? (
        <div className="table-card" aria-busy="true">
          <div className="table-skeleton table-skeleton--header" />
          {Array.from({ length: 5 }).map((_, i) => (<div className="table-skeleton" key={i} />))}
        </div>
      ) : null}

      {state.status === "error" ? (
        <div className="state-panel state-panel--error" role="alert">
          <h2>Quotes could not be loaded</h2>
          <p>{state.error}</p>
          <button className="button button--secondary" type="button" onClick={() => setRefreshKey((k) => k + 1)}>Try again</button>
        </div>
      ) : null}

      {isEmpty ? (
        <div className="state-panel">
          <h2>{statusFilter ? "No quotes match this status" : "No quotes yet"}</h2>
          <p>{statusFilter ? "Try a different status filter." : "Create your first quote for a customer."}</p>
          {statusFilter ? (<button className="button button--secondary" type="button" onClick={() => setStatusFilter("")}>Clear filter</button>) : (<Link className="button button--primary" href="/quotes/new">New quote</Link>)}
        </div>
      ) : null}

      {state.status === "success" && quotes.length > 0 ? (
        <div className="table-card">
          <div className="quote-table quote-table--head">
            <span>Quote</span>
            <span>Customer</span>
            <span>Status</span>
            <span>Total</span>
            <span>Paid</span>
            <span>Created</span>
            <span>Scheduled</span>
            <span></span>
          </div>
          {quotes.map((quote) => {
            const linkedJob = jobByQuote.get(quote.id);
            const isScheduled = linkedJob != null;
            const canSchedule = quote.status === "accepted" && !isScheduled;

            return (
              <Link className="quote-table quote-table--row" key={quote.id} href={`/quotes/${quote.id}`} style={{ color: "inherit", textDecoration: "none" }}>
                <span className="quote-table__number">{quote.quoteNumber}</span>
                <span>{quote.customerName}</span>
                <span>
                  <span className={`status-badge status-badge--${quote.status}`}>{statusLabel(quote.status)}</span>
                </span>
                <span className="quote-table__total">{formatCurrency(quote.total)}</span>
                <span>
                  <span className={`status-badge status-badge--${quote.paid ? "paid" : "unpaid"}`}>
                    {quote.paid ? "Paid" : "Unpaid"}
                  </span>
                </span>
                <span className="quote-table__muted">{formatDate(quote.createdAt)}</span>
                <span>
                  {isScheduled ? (
                    <button
                      className="button button--ghost"
                      type="button"
                      style={{ fontSize: 12, minHeight: 28, padding: "0 10px", color: "#1F6B4F", fontWeight: 600 }}
                      onClick={(e) => { e.preventDefault(); e.stopPropagation(); window.location.href = "/calendar"; }}
                    >
                      View in calendar
                    </button>
                  ) : canSchedule ? (
                    <button
                      className="button button--primary"
                      type="button"
                      style={{ fontSize: 11, minHeight: 28, padding: "0 12px", fontWeight: 600 }}
                      onClick={(e) => { e.preventDefault(); e.stopPropagation(); setScheduleQuote({ id: quote.id, customerName: quote.customerName }); }}
                    >
                      Schedule this job
                    </button>
                  ) : (
                    <span style={{ fontSize: 12, color: "#94a3b8" }}>—</span>
                  )}
                </span>
                <button
                  className="button button--ghost"
                  type="button"
                  style={{ fontSize: 13, minHeight: 32, padding: "0 10px", color: "var(--danger)" }}
                  onClick={(e) => { e.preventDefault(); e.stopPropagation(); setDeleteTarget({ id: quote.id, number: quote.quoteNumber }); }}
                >
                  Delete
                </button>
              </Link>
            );
          })}
        </div>
      ) : null}

      <ConfirmDialog
        open={deleteTarget !== null}
        title="Delete quote"
        message={`Are you sure you want to delete ${deleteTarget?.number ?? "this quote"}?`}
        confirmLabel="Delete"
        variant="danger"
        loading={deleteLoading}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />

      {scheduleQuote ? (
        <JobModal
          initial={{ quoteId: scheduleQuote.id, customerName: scheduleQuote.customerName }}
          onClose={() => setScheduleQuote(null)}
          onSaved={() => { setScheduleQuote(null); setRefreshKey((k) => k + 1); }}
        />
      ) : null}
    </section>
  );
}
