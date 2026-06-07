"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { OnboardingWizard } from "../OnboardingWizard";
import { useRegion } from "../../hooks/useRegion";

type RecentQuote = {
  id: string;
  quoteNumber: string;
  customerName: string;
  status: string;
  total: number;
  createdAt: string;
};

type RecentCustomer = {
  id: string;
  name: string;
  totalQuotes: number;
};

type DashboardSummary = {
  customerCount: number;
  openQuotesCount: number;
  recentQuotes: RecentQuote[];
  recentCustomers: RecentCustomer[];
};

type DashboardState =
  | { status: "loading"; data?: undefined; error?: undefined }
  | { status: "error"; data?: undefined; error: string }
  | { status: "success"; data: DashboardSummary; error?: undefined };

function statusLabel(status: string) {
  switch (status) {
    case "draft":
      return "Draft";
    case "sent":
      return "Sent";
    case "accepted":
      return "Accepted";
    case "rejected":
      return "Rejected";
    case "expired":
      return "Expired";
    default:
      return status;
  }
}

async function readErrorMessage(response: Response) {
  try {
    const json = await response.json();
    const error = json?.error;
    if (typeof error === "string") return error;
    if (error && typeof error.message === "string") return error.message;
    if (typeof json?.message === "string") return json.message;
    return "Unable to load dashboard.";
  } catch {
    return "Unable to load dashboard.";
  }
}

export function DashboardPage() {
  const { formatCurrency, formatDate } = useRegion();
  const [state, setState] = useState<DashboardState>({ status: "loading" });
  const [refreshKey, setRefreshKey] = useState(0);
  const [showOnboarding, setShowOnboarding] = useState(false);

  useEffect(() => {
    let isCurrent = true;

    async function loadDashboard() {
      setState({ status: "loading" });

      try {
        const token = window.localStorage.getItem("quotecraft_token");
        const response = await fetch("/api/dashboard/summary", {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });

        if (!response.ok) {
          throw new Error(await readErrorMessage(response));
        }

        const data = (await response.json()) as DashboardSummary;

        if (isCurrent) {
          setState({ status: "success", data });
        }
      } catch (error) {
        if (isCurrent) {
          setState({
            status: "error",
            error:
              error instanceof Error
                ? error.message
                : "Unable to load dashboard.",
          });
        }
      }
    }

    loadDashboard();

    return () => {
      isCurrent = false;
    };
  }, [refreshKey]);

  const isEmpty =
    state.status === "success" &&
    state.data.customerCount === 0 &&
    state.data.openQuotesCount === 0 &&
    state.data.recentQuotes.length === 0 &&
    state.data.recentCustomers.length === 0;

  useEffect(() => {
    if (state.status === "success") {
      const dismissed = window.localStorage.getItem("quotecraft_onboarding_dismissed");
      if (isEmpty && !dismissed) {
        setShowOnboarding(true);
      }
    }
  }, [state.status, isEmpty]);

  return (
    <section className="workspace-page">
      <div className="workspace-page__header">
        <div>
          <p className="workspace-page__eyebrow">Dashboard</p>
          <h1>Workspace overview</h1>
          <p>
            Quick snapshot of customer activity, open quotes, and recent work.
          </p>
        </div>
        <div className="dashboard__actions">
          <Link className="button button--secondary" href="/customers">
            New customer
          </Link>
          <Link className="button button--primary" href="/quotes">
            New quote
          </Link>
        </div>
      </div>

      {state.status === "loading" ? (
        <div aria-busy="true">
          <div className="dashboard-stats">
            {Array.from({ length: 2 }).map((_, i) => (
              <div className="stat-card stat-card--skeleton" key={i}>
                <div className="skeleton-line skeleton-line--short" />
                <div className="skeleton-line skeleton-line--long" />
              </div>
            ))}
          </div>
          <div className="table-card" style={{ marginTop: 24 }}>
            <div className="table-skeleton table-skeleton--header" />
            {Array.from({ length: 3 }).map((_, i) => (
              <div className="table-skeleton" key={i} />
            ))}
          </div>
        </div>
      ) : null}

      {state.status === "error" ? (
        <div className="state-panel state-panel--error" role="alert">
          <h2>Dashboard could not be loaded</h2>
          <p>{state.error}</p>
          <button
            className="button button--secondary"
            type="button"
            onClick={() => setRefreshKey((current) => current + 1)}
          >
            Try again
          </button>
        </div>
      ) : null}

      {state.status === "success" && !isEmpty ? (
        <>
          <div className="dashboard-stats">
            <div className="stat-card">
              <span className="stat-card__value">{state.data.customerCount}</span>
              <span className="stat-card__label">Total customers</span>
            </div>
            <div className="stat-card">
              <span className="stat-card__value">{state.data.openQuotesCount}</span>
              <span className="stat-card__label">Open quotes</span>
            </div>
          </div>

          <div className="dashboard-panels">
            <div className="table-card">
              <div className="dashboard-panel__header">
                <h2>Recent quotes</h2>
                <Link className="button button--ghost" href="/quotes">
                  View all
                </Link>
              </div>
              {state.data.recentQuotes.length > 0 ? (
                <div className="dash-table">
                  <div className="dash-table__head">
                    <span>Number</span>
                    <span>Customer</span>
                    <span>Status</span>
                    <span>Total</span>
                    <span>Created</span>
                  </div>
                  {state.data.recentQuotes.map((quote) => (
                    <Link
                      className="dash-table__row"
                      key={quote.id}
                      href={`/quotes/${quote.id}`}
                    >
                      <span className="dash-table__number">{quote.quoteNumber}</span>
                      <span>{quote.customerName}</span>
                      <span>
                        <span className={`status-badge status-badge--${quote.status}`}>
                          {statusLabel(quote.status)}
                        </span>
                      </span>
                      <span className="dash-table__total">
                        {formatCurrency(quote.total)}
                      </span>
                      <span className="dash-table__muted">
                        {formatDate(quote.createdAt)}
                      </span>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="dashboard-panel__empty">
                  No quotes yet. Create your first quote to get started.
                </div>
              )}
            </div>

            <div className="table-card">
              <div className="dashboard-panel__header">
                <h2>Recent customers</h2>
                <Link className="button button--ghost" href="/customers">
                  View all
                </Link>
              </div>
              {state.data.recentCustomers.length > 0 ? (
                <div className="dash-table">
                  <div className="dash-table__head">
                    <span>Name</span>
                    <span>Quotes</span>
                  </div>
                  {state.data.recentCustomers.map((customer) => (
                    <Link
                      className="dash-table__row dash-table__row--cols2"
                      key={customer.id}
                      href={`/customers`}
                    >
                      <span>{customer.name}</span>
                      <span className="quote-count">{customer.totalQuotes}</span>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="dashboard-panel__empty">
                  No customers yet. Add your first customer.
                </div>
              )}
            </div>
          </div>
        </>
      ) : null}

      {isEmpty ? (
        <div className="state-panel">
          <h2>Welcome to QuoteCraft</h2>
          <p>
            Your workspace is ready. Add a customer to start creating quotes and
            tracking estimates.
          </p>
          <div className="dashboard__actions">
            <Link className="button button--primary" href="/customers">
              New customer
            </Link>
            <Link className="button button--secondary" href="/quotes">
              New quote
            </Link>
          </div>
        </div>
      ) : null}
      <OnboardingWizard
        open={showOnboarding}
        onComplete={() => {
          window.localStorage.setItem("quotecraft_onboarding_dismissed", "1");
          setShowOnboarding(false);
        }}
        onDismiss={() => {
          window.localStorage.setItem("quotecraft_onboarding_dismissed", "1");
          setShowOnboarding(false);
        }}
      />
    </section>
  );
}
