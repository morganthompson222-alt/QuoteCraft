"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRegion } from "../../hooks/useRegion";

type CustomerQuote = {
  id: string;
  quoteNumber: string;
  status: string;
  total: number;
  createdAt: string;
};

type CustomerDetail = {
  id: string;
  email: string;
  name: string;
  phone: string | null;
  company: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  zip: string | null;
  notes: string | null;
  createdAt: string;
  quotes: CustomerQuote[];
};

type DetailState =
  | { status: "loading" }
  | { status: "error"; error: string }
  | { status: "success"; data: CustomerDetail };

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
    return "Unable to load customer.";
  } catch {
    return "Unable to load customer.";
  }
}

type CustomerDetailPageProps = {
  customerId: string;
};

export function CustomerDetailPage({ customerId }: CustomerDetailPageProps) {
  const { formatCurrency, formatDate } = useRegion();
  const [state, setState] = useState<DetailState>({ status: "loading" });
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    let isCurrent = true;

    async function loadCustomer() {
      setState({ status: "loading" });

      try {
        const token = window.localStorage.getItem("jobstacker_token");
        const response = await fetch(`/api/customers/${customerId}`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });

        if (!response.ok) {
          throw new Error(await readErrorMessage(response));
        }

        const data = (await response.json()) as CustomerDetail;

        if (isCurrent) {
          setState({ status: "success", data });
        }
      } catch (error) {
        if (isCurrent) {
          setState({
            status: "error",
            error: error instanceof Error ? error.message : "Unable to load customer.",
          });
        }
      }
    }

    loadCustomer();
    return () => { isCurrent = false; };
  }, [customerId, refreshKey]);

  return (
    <section className="workspace-page">
      <div className="workspace-page__header">
        <div>
          <Link
            href="/customers"
            style={{ color: "var(--text-muted)", fontSize: 14, fontWeight: 650, marginBottom: 8, display: "inline-block" }}
          >
            &larr; Back to customers
          </Link>
          <p className="workspace-page__eyebrow">Customer</p>
          {state.status === "success" ? (
            <h1>{state.data.name}</h1>
          ) : (
            <h1>Customer details</h1>
          )}
        </div>
      </div>

      {state.status === "loading" ? (
        <div className="table-card" aria-busy="true">
          <div className="table-skeleton table-skeleton--header" />
          {Array.from({ length: 4 }).map((_, i) => (
            <div className="table-skeleton" key={i} />
          ))}
        </div>
      ) : null}

      {state.status === "error" ? (
        <div className="state-panel state-panel--error" role="alert">
          <h2>Customer could not be loaded</h2>
          <p>{state.error}</p>
          <button
            className="button button--secondary"
            type="button"
            onClick={() => setRefreshKey((k) => k + 1)}
          >
            Try again
          </button>
        </div>
      ) : null}

      {state.status === "success" ? (
        <>
          <div className="detail-grid">
            <div className="table-card">
              <h2 className="detail-section__title">Contact information</h2>
              <dl className="detail-list">
                <div className="detail-list__row">
                  <dt>Email</dt>
                  <dd>
                    {state.data.email ? (
                      <span className="contact-highlight contact-highlight--active">
                        {state.data.email}
                        {!state.data.phone ? <span className="contact-highlight__badge">Primary</span> : null}
                      </span>
                    ) : (
                      <span className="contact-highlight contact-highlight--missing">No email provided</span>
                    )}
                  </dd>
                </div>
                <div className="detail-list__row">
                  <dt>Phone</dt>
                  <dd>
                    {state.data.phone ? (
                      <span className="contact-highlight contact-highlight--active">
                        {state.data.phone}
                        {!state.data.email ? <span className="contact-highlight__badge">Primary</span> : null}
                      </span>
                    ) : (
                      <span className="contact-highlight contact-highlight--missing">No phone provided</span>
                    )}
                  </dd>
                </div>
                <div className="detail-list__row">
                  <dt>Company</dt>
                  <dd>{state.data.company ?? "—"}</dd>
                </div>
                <div className="detail-list__row">
                  <dt>Address</dt>
                  <dd>
                    {[state.data.address, state.data.city, state.data.state, state.data.zip]
                      .filter(Boolean)
                      .join(", ") || "—"}
                  </dd>
                </div>
              </dl>
            </div>

            {state.data.notes ? (
              <div className="table-card">
                <h2 className="detail-section__title">Notes</h2>
                <p className="detail-notes">{state.data.notes}</p>
              </div>
            ) : null}

            <div className="table-card detail-quotes">
              <div className="dashboard-panel__header">
                <h2 className="detail-section__title">Quote history</h2>
                <Link className="button button--primary" href="/quotes">
                  New quote
                </Link>
              </div>
              {state.data.quotes.length > 0 ? (
                <div className="dash-table">
                  <div className="dash-table__head" style={{ gridTemplateColumns: "100px 90px 100px 100px" }}>
                    <span>Number</span>
                    <span>Status</span>
                    <span>Total</span>
                    <span>Created</span>
                  </div>
                  {state.data.quotes.map((quote) => (
                    <Link
                      className="dash-table__row"
                      key={quote.id}
                      href={`/quotes/${quote.id}`}
                      style={{ gridTemplateColumns: "100px 90px 100px 100px" }}
                    >
                      <span className="dash-table__number">{quote.quoteNumber}</span>
                      <span>
                        <span className={`status-badge status-badge--${quote.status}`}>
                          {statusLabel(quote.status)}
                        </span>
                      </span>
                      <span className="dash-table__total">{formatCurrency(quote.total)}</span>
                      <span className="dash-table__muted">{formatDate(quote.createdAt)}</span>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="dashboard-panel__empty">
                  No quotes yet for this customer.
                </div>
              )}
            </div>
          </div>
        </>
      ) : null}
    </section>
  );
}
