"use client";

import { useEffect, useState } from "react";
import { useRegion } from "../../hooks/useRegion";

type BillingLimits = {
  maxActiveQuotes: number;
  maxCustomers: number;
  aiGenerationsPerMonth: number;
  scheduleJobs: boolean;
  calendarExport: boolean;
  maxTeamMembers: number;
};

type BillingStatus = {
  tier: string;
  name: string;
  displayPrice: string;
  subscriptionStatus: string | null;
  periodStart: string | null;
  periodEnd: string | null;
  stripeCustomerId: string | null;
  limits: BillingLimits;
};

type BillingState =
  | { status: "loading" }
  | { status: "error"; error: string }
  | { status: "success"; data: BillingStatus };

const plans: { tier: string; name: string; amount: number; period: string; features: string[]; highlight: boolean }[] = [
  { tier: "solo", name: "Solo", amount: 0, period: "forever", features: ["30 customers", "5 active quotes", "20 AI generations/mo", "PDF quotes", "Basic tracking"], highlight: false },
  { tier: "solo_pro", name: "Solo Pro", amount: 0, period: "until Sep 2026", features: ["Unlimited customers", "Unlimited quotes", "Unlimited AI gens/mo", "Job scheduling", ".ics export", "Templates", "Revenue dashboard"], highlight: true },
  { tier: "business", name: "Business", amount: 0, period: "contact for info", features: ["500+ customers", "50+ active quotes", "150+ AI gens/mo", "Full scheduling", "3 team members", "Revenue tracking"], highlight: false },
  { tier: "growth", name: "Growth", amount: 0, period: "contact for info", features: ["2000+ customers", "150+ active quotes", "400+ AI gens/mo", "10 team members", "Advanced reporting", "Multi-calendar"], highlight: false },
  { tier: "enterprise", name: "Enterprise", amount: 0, period: "contact for info", features: ["Unlimited everything", "Unlimited team", "API access", "SSO", "Custom integrations", "Dedicated support"], highlight: false },
];

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

const tierPrices: Record<string, string> = {
  solo: "",
  solo_pro: process.env.NEXT_PUBLIC_STRIPE_PRICE_SOLO_PRO || "price_solo_pro",
  business: process.env.NEXT_PUBLIC_STRIPE_PRICE_BUSINESS || "price_business",
  growth: process.env.NEXT_PUBLIC_STRIPE_PRICE_GROWTH || "price_growth",
  enterprise: process.env.NEXT_PUBLIC_STRIPE_PRICE_ENTERPRISE || "price_enterprise",
};

const TIER_RANK: Record<string, number> = {
  solo: 0, solo_pro: 1, business: 2, growth: 3, enterprise: 4,
};

export function BillingPage() {
  const { formatDate, formatCurrency } = useRegion();
  const [state, setState] = useState<BillingState>({ status: "loading" });
  const [refreshKey, setRefreshKey] = useState(0);
  const [checkoutLoading, setCheckoutLoading] = useState<string | null>(null);
  const [checkoutError, setCheckoutError] = useState("");
  const [testTier, setTestTier] = useState<string>("");
  const [testLoading, setTestLoading] = useState(false);
  const [testError, setTestError] = useState("");

  useEffect(() => {
    let isCurrent = true;

    async function loadBilling() {
      setState({ status: "loading" });

      try {
        const token = window.localStorage.getItem("jobstacker_token");
        const response = await fetch("/api/billing/status", {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });

        if (!response.ok) {
          throw new Error(await readErrorMessage(response));
        }

        const data = (await response.json()) as BillingStatus;

        if (isCurrent) {
          setState({ status: "success", data });
        }
      } catch (error) {
        if (isCurrent) {
          setState({
            status: "error",
            error: error instanceof Error ? error.message : "Unable to load billing info.",
          });
        }
      }
    }

    loadBilling();
    return () => { isCurrent = false; };
  }, [refreshKey]);

  async function handleUpgrade(tier: string) {
    const priceId = tierPrices[tier];
    if (!priceId) return;

    setCheckoutLoading(tier);
    setCheckoutError("");

    try {
      const token = window.localStorage.getItem("jobstacker_token");
      const response = await fetch("/api/stripe/create-checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ priceId, returnUrl: window.location.href }),
      });

      if (!response.ok) {
        throw new Error(await readErrorMessage(response));
      }

      const data = (await response.json()) as { url: string };
      window.location.assign(data.url);
    } catch (error) {
      setCheckoutError(
        error instanceof Error ? error.message : "Failed to start checkout.",
      );
    } finally {
      setCheckoutLoading(null);
    }
  }

  async function handleTestSwitch(tier: string) {
    setTestLoading(true);
    setTestError("");
    try {
      const tk = localStorage.getItem("jobstacker_token");
      const r = await fetch("/api/billing/tier", {
        method: "PUT",
        headers: { "Content-Type": "application/json", ...(tk ? { Authorization: `Bearer ${tk}` } : {}) },
        body: JSON.stringify({ tier }),
      });
      if (!r.ok) throw new Error(await readErrorMessage(r));
      setRefreshKey((k) => k + 1);
    } catch (x) {
      setTestError(x instanceof Error ? x.message : "Failed");
    } finally {
      setTestLoading(false);
    }
  }

  const currentTier = state.status === "success" ? state.data.tier : null;
  const currentRank = currentTier ? (TIER_RANK[currentTier] ?? 0) : 0;
  const isSubscribed = state.status === "success" && state.data.subscriptionStatus === "active";

  return (
    <>

      {state.status === "loading" ? (
        <div className="table-card" aria-busy="true">
          <div className="table-skeleton table-skeleton--header" />
          {Array.from({ length: 3 }).map((_, i) => (
            <div className="table-skeleton" key={i} />
          ))}
        </div>
      ) : null}

      {state.status === "error" ? (
        <div className="state-panel state-panel--error" role="alert">
          <h2>Billing info could not be loaded</h2>
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
          {state.status === "success" && isSubscribed ? (
            <div className="table-card" style={{ marginBottom: 24 }}>
              <h2 className="bp-section__title">Current subscription</h2>
              <div className="bp-section__body">
                <dl className="detail-list">
                  <div className="detail-list__row">
                    <dt>Plan</dt>
                    <dd style={{ textTransform: "capitalize" }}>{state.data.name}</dd>
                  </div>
                  <div className="detail-list__row">
                    <dt>Status</dt>
                    <dd>
                      <span className={`status-badge status-badge--${state.data.subscriptionStatus === "active" ? "accepted" : state.data.subscriptionStatus === "past_due" ? "rejected" : "expired"}`}>
                        {state.data.subscriptionStatus}
                      </span>
                    </dd>
                  </div>
                  {state.data.periodStart ? (
                    <div className="detail-list__row">
                      <dt>Period start</dt>
                      <dd>{formatDate(state.data.periodStart)}</dd>
                    </div>
                  ) : null}
                  {state.data.periodEnd ? (
                    <div className="detail-list__row">
                      <dt>Period end</dt>
                      <dd>{formatDate(state.data.periodEnd)}</dd>
                    </div>
                  ) : null}
                </dl>
              </div>
            </div>
          ) : null}

          {/* Test mode: quick plan switch */}
          <div style={{
            background: "#fefce8", border: "1px solid #fde68a", borderRadius: 8,
            padding: "12px 16px", marginBottom: 20, display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap",
          }}>
            <span style={{ fontSize: 13, fontWeight: 700, color: "#92400e" }}>Test mode</span>
            <span style={{ fontSize: 13, color: "#92400e" }}>Current: <strong style={{ textTransform: "capitalize" }}>{state.data.name} ({currentTier})</strong></span>
            <select
              value={testTier || currentTier || ""}
              onChange={(e) => setTestTier(e.target.value)}
              style={{ padding: "6px 10px", borderRadius: 6, border: "1px solid #fde68a", fontSize: 13 }}
            >
              {Object.keys(TIER_RANK).map((t) => (
                <option key={t} value={t}>{t === "solo_pro" ? "Solo Pro" : t.charAt(0).toUpperCase() + t.slice(1)}</option>
              ))}
            </select>
            <button
              style={{
                padding: "6px 14px", borderRadius: 6, fontSize: 12, fontWeight: 700, cursor: "pointer",
                border: "none", background: "#92400e", color: "#fff",
              }}
              disabled={testLoading || !testTier || testTier === currentTier}
              onClick={() => handleTestSwitch(testTier)}
            >
              {testLoading ? "Switching..." : "Switch now"}
            </button>
            {testError ? <span style={{ fontSize: 12, color: "#b91c1c" }}>{testError}</span> : null}
          </div>

          <div className="billing-plans">
            {plans.map((plan) => {
              const isCurrent = currentTier === plan.tier;
              const planRank = TIER_RANK[plan.tier] ?? 0;
              const isAbove = planRank > currentRank;
              const isBelow = planRank < currentRank;

              return (
                <div
                  className={`billing-plan ${isCurrent ? "billing-plan--current" : ""} ${plan.highlight ? "billing-plan--highlight" : ""}`}
                  key={plan.tier}
                >
                  <div className="billing-plan__header">
                    <h2 className="billing-plan__name">{plan.name}</h2>
                    <div className="billing-plan__price">
                      <strong>{formatCurrency(plan.amount)}</strong>
                      <span>/{plan.period}</span>
                    </div>
                  </div>

                  <ul className="billing-plan__features">
                    {plan.features.map((f) => (
                      <li key={f}>{f}</li>
                    ))}
                  </ul>

                  {isCurrent ? (
                    <span className="billing-plan__current-badge">Current plan</span>
                  ) : plan.tier === "business" || plan.tier === "growth" || plan.tier === "enterprise" ? (
                    <button
                      className="button button--secondary billing-plan__button"
                      type="button"
                      onClick={() => window.open("mailto:billing@jobstacker.app?subject=I'm interested in the " + plan.name + " plan", "_blank")}
                    >
                      Contact for info
                    </button>
                  ) : isAbove ? (
                    <button
                      className={`button ${plan.highlight ? "button--primary" : "button--secondary"} billing-plan__button`}
                      type="button"
                      disabled={checkoutLoading === plan.tier}
                      onClick={() => handleUpgrade(plan.tier)}
                    >
                      {checkoutLoading === plan.tier ? "Redirecting..." : `Upgrade to ${plan.name}`}
                    </button>
                  ) : isBelow ? (
                    <button
                      className="button button--secondary billing-plan__button"
                      type="button"
                      disabled={testLoading}
                      onClick={() => handleTestSwitch(plan.tier)}
                    >
                      {testLoading ? "Switching..." : `Switch to ${plan.name}`}
                    </button>
                  ) : null}
                </div>
              );
            })}
          </div>

          {checkoutError ? (
            <div className="auth-form__error" role="alert" style={{ marginTop: 18 }}>
              {checkoutError}
            </div>
          ) : null}

          {state.data.limits ? (
            <div className="table-card" style={{ marginTop: 24 }}>
              <h2 className="bp-section__title">Resource limits</h2>
              <div className="bp-section__body">
                <dl className="detail-list">
                  <div className="detail-list__row">
                    <dt>Active quotes</dt>
                    <dd>{state.data.limits.maxActiveQuotes === -1 ? "Unlimited" : state.data.limits.maxActiveQuotes}</dd>
                  </div>
                  <div className="detail-list__row">
                    <dt>Max customers</dt>
                    <dd>{state.data.limits.maxCustomers === -1 ? "Unlimited" : state.data.limits.maxCustomers}</dd>
                  </div>
                  <div className="detail-list__row">
                    <dt>AI generations / month</dt>
                    <dd>{state.data.limits.aiGenerationsPerMonth === -1 ? "Unlimited" : state.data.limits.aiGenerationsPerMonth}</dd>
                  </div>
                </dl>
              </div>
            </div>
          ) : null}
        </>
      ) : null}
    </>
  );
}
