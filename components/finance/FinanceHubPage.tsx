"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRegion } from "../../hooks/useRegion";

type FinanceSummary = {
  metrics: {
    monthlyRevenue: number;
    monthlyProfit: number;
    monthlyExpenses: number;
    estimatedTax: number;
    outstandingValue: number;
    avgJobValue: number;
    revenueGrowth: number;
    profitMargin: number;
    totalCustomers: number;
    paidCount: number;
    healthScore: number;
  };
  expenseCategories: Record<string, number>;
  disclaimer: string;
};

type FinanceInsights = {
  chartData: Array<{ month: string; revenue: number; expenses: number; profit: number }>;
  monthlyRevenue: number;
  monthlyProfit: number;
  monthlyExpenses: number;
  profitMargin: number;
  insights: string[];
  recommendations: string[];
  expenseByCategory: Record<string, number>;
  disclaimer: string;
};

type Expense = {
  id: string;
  expense_date: string;
  amount: number;
  category: string;
  description: string;
};

const EXPENSE_CATEGORIES = [
  "Materials", "Equipment", "Fuel", "Subcontractors", "Insurance",
  "Advertising", "Software", "Vehicle Costs", "Office Costs", "Labour", "Other",
];

const GREEN = "#1F6B4F";
const BORDER = "#e5e7eb";

function StatCard({ value, label, color, bg }: { value: string; label: string; color?: string; bg?: string }) {
  return (
    <div style={{ padding: "20px 22px", borderRadius: 10, background: bg ?? "#f8fafc", border: `1px solid ${BORDER}` }}>
      <div style={{ fontSize: 28, fontWeight: 800, color: color ?? "#0f172a", marginBottom: 4 }}>{value}</div>
      <div style={{ fontSize: 13, fontWeight: 600, color: "#64748b" }}>{label}</div>
    </div>
  );
}

function SimpleBarChart({ data, maxVal }: { data: Array<{ month: string; revenue: number; expenses: number; profit: number }>; maxVal: number }) {
  const H = 160;
  const months = data.slice(-6);
  const max = Math.max(maxVal, 1);

  return (
    <div style={{ display: "flex", alignItems: "flex-end", gap: 8, height: H, padding: "8px 0" }}>
      {months.map((d) => {
        const rH = (d.revenue / max) * H;
        const eH = (d.expenses / max) * H;
        const label = d.month.slice(5);
        return (
          <div key={d.month} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", height: H }}>
            <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "flex-end", gap: 2, width: "100%" }}>
              <div style={{ width: "100%", height: Math.max(2, rH), background: GREEN, borderRadius: "3px 3px 0 0", transition: "height 0.3s" }} title={`Revenue: £${d.revenue}`} />
              <div style={{ width: "100%", height: Math.max(2, eH), background: "#fca5a5", borderRadius: "3px 3px 0 0", transition: "height 0.3s" }} title={`Expenses: £${d.expenses}`} />
            </div>
            <div style={{ fontSize: 10, fontWeight: 600, color: "#64748b", marginTop: 6 }}>{label}</div>
          </div>
        );
      })}
    </div>
  );
}

function HealthMeter({ score }: { score: number }) {
  let label = "Poor", color = "#ef4444";
  if (score >= 70) { label = "Excellent"; color = "#22c55e"; }
  else if (score >= 50) { label = "Good"; color = GREEN; }
  else if (score >= 30) { label = "Fair"; color = "#f59e0b"; }

  return (
    <div style={{ padding: "24px", borderRadius: 10, background: "#f8fafc", border: `2px solid ${color}` }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
        <span style={{ fontSize: 14, fontWeight: 700, color: "#0f172a" }}>Business Health</span>
        <span style={{ fontSize: 13, fontWeight: 700, color }}>{label}</span>
      </div>
      <div style={{ height: 8, background: "#e5e7eb", borderRadius: 4, overflow: "hidden" }}>
        <div style={{ height: "100%", width: `${Math.min(100, score)}%`, background: color, borderRadius: 4, transition: "width 0.5s" }} />
      </div>
      <div style={{ fontSize: 12, color: "#64748b", marginTop: 6 }}>{score}/100</div>
    </div>
  );
}

export function FinanceHubPage() {
  const { formatCurrency } = useRegion();
  const [summary, setSummary] = useState<FinanceSummary | null>(null);
  const [insights, setInsights] = useState<FinanceInsights | null>(null);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showAddExpense, setShowAddExpense] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  // Add expense form
  const [expDate, setExpDate] = useState(new Date().toISOString().slice(0, 10));
  const [expAmt, setExpAmt] = useState("");
  const [expCat, setExpCat] = useState("Materials");
  const [expDesc, setExpDesc] = useState("");
  const [expSaving, setExpSaving] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    (async () => {
      try {
        const tk = localStorage.getItem("jobstacker_token");
        const headers = tk ? { Authorization: `Bearer ${tk}` } : {};

        const [sumRes, insRes, expRes] = await Promise.all([
          fetch("/api/finance/summary", { headers }),
          fetch("/api/finance/insights", { headers }),
          fetch("/api/finance/expenses/list", { headers }),
        ]);

        if (sumRes.ok && !cancelled) setSummary(await sumRes.json());
        if (insRes.ok && !cancelled) setInsights(await insRes.json());
        if (expRes.ok) {
          const d = await expRes.json();
          if (!cancelled) setExpenses(d.expenses ?? []);
        }
      } catch {
        if (!cancelled) setError("Failed to load finance data.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [refreshKey]);

  async function handleAddExpense() {
    const amt = parseFloat(expAmt);
    if (isNaN(amt) || amt <= 0) return;
    setExpSaving(true);
    try {
      const tk = localStorage.getItem("jobstacker_token");
      const r = await fetch("/api/finance/expenses/create", {
        method: "POST",
        headers: { "Content-Type": "application/json", ...(tk ? { Authorization: `Bearer ${tk}` } : {}) },
        body: JSON.stringify({ expense_date: expDate, amount: amt, category: expCat, description: expDesc }),
      });
      if (r.ok) {
        setShowAddExpense(false);
        setExpAmt(""); setExpDesc("");
        setRefreshKey(k => k + 1);
      }
    } catch { /* ok */ } finally { setExpSaving(false); }
  }

  if (loading) return (
    <section className="workspace-page">
      <div style={{ padding: "40px", textAlign: "center", color: "#64748b" }}>Loading finance data...</div>
    </section>
  );

  return (
    <section className="workspace-page">
      <div className="workspace-page__header">
        <div>
          <p className="workspace-page__eyebrow">Finance</p>
          <h1>Finance Hub</h1>
          <p>Revenue, profit, expenses, and tax estimates for your business.</p>
        </div>
        <button className="button button--primary" onClick={() => setShowAddExpense(true)}>+ Add expense</button>
      </div>

      {/* Disclaimer */}
      <div style={{ background: "#fef3c7", border: "1px solid #fcd34d", borderRadius: 8, padding: "10px 16px", marginBottom: 24, fontSize: 13, color: "#92400e", fontWeight: 600 }}>
        JobStacker is not an accounting service. Estimates only. Always consult a qualified accountant or tax professional.
      </div>

      {error ? (
        <div className="state-panel state-panel--error"><h2>Failed to load</h2><p>{error}</p></div>
      ) : null}

      {summary ? (
        <>
          {/* Metric cards */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: 12, marginBottom: 24 }}>
            <StatCard value={formatCurrency(summary.metrics.monthlyRevenue)} label="Revenue this month" color={GREEN} bg="#eefaf4" />
            <StatCard value={formatCurrency(summary.metrics.monthlyProfit)} label={summary.metrics.monthlyProfit >= 0 ? "Profit this month" : "Loss this month"} color={summary.metrics.monthlyProfit >= 0 ? "#065f46" : "#991b1b"} />
            <StatCard value={formatCurrency(summary.metrics.monthlyExpenses)} label="Expenses this month" />
            <StatCard value={formatCurrency(summary.metrics.estimatedTax)} label="Estimated tax (20%)" />
            <StatCard value={formatCurrency(summary.metrics.outstandingValue)} label="Outstanding quotes" />
            <StatCard value={formatCurrency(summary.metrics.avgJobValue)} label="Avg job value" />
          </div>

          {/* Chart + Health */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 280px", gap: 16, marginBottom: 24 }}>
            <div className="table-card">
              <h2 style={{ fontSize: 16, fontWeight: 700, color: "#0f172a", margin: "0 0 4px" }}>Revenue vs Expenses</h2>
              <div style={{ fontSize: 12, color: "#64748b", marginBottom: 8, display: "flex", gap: 16 }}>
                <span><span style={{ display: "inline-block", width: 10, height: 10, background: GREEN, borderRadius: 2, marginRight: 4 }} />Revenue</span>
                <span><span style={{ display: "inline-block", width: 10, height: 10, background: "#fca5a5", borderRadius: 2, marginRight: 4 }} />Expenses</span>
              </div>
              {insights?.chartData ? (
                <SimpleBarChart data={insights.chartData} maxVal={Math.max(summary.metrics.monthlyRevenue, summary.metrics.monthlyExpenses, 100)} />
              ) : null}
            </div>
            <HealthMeter score={summary.metrics.healthScore} />
          </div>

          {/* Insights & Recommendations */}
          {insights?.insights?.length ? (
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 24 }}>
              <div className="table-card">
                <h2 style={{ fontSize: 16, fontWeight: 700, color: "#0f172a", margin: "0 0 12px" }}>Insights</h2>
                {insights.insights.map((i, idx) => (
                  <div key={idx} style={{ padding: "10px 0", borderBottom: `1px solid ${BORDER}`, fontSize: 14, color: "#334155", display: "flex", gap: 8 }}>
                    <span style={{ color: GREEN }}>●</span> {i}
                  </div>
                ))}
              </div>
              <div className="table-card">
                <h2 style={{ fontSize: 16, fontWeight: 700, color: "#0f172a", margin: "0 0 12px" }}>Recommendations</h2>
                {insights.recommendations.map((r, idx) => (
                  <div key={idx} style={{ padding: "10px 0", borderBottom: `1px solid ${BORDER}`, fontSize: 14, color: "#334155", display: "flex", gap: 8 }}>
                    <span style={{ color: "#f59e0b" }}>▲</span> {r}
                  </div>
                ))}
                {!insights.recommendations.length ? (
                  <div style={{ fontSize: 13, color: "#64748b", padding: 16 }}>No recommendations right now. Keep tracking your expenses for more insights.</div>
                ) : null}
              </div>
            </div>
          ) : null}

          {/* Expense list */}
          <div className="table-card">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
              <h2 style={{ fontSize: 16, fontWeight: 700, color: "#0f172a", margin: 0 }}>Recent expenses</h2>
              <button className="button button--ghost" style={{ fontSize: 13 }} onClick={() => setShowAddExpense(true)}>+ Add</button>
            </div>
            {expenses.length === 0 ? (
              <div style={{ padding: 32, textAlign: "center", color: "#64748b", fontSize: 14 }}>
                No expenses recorded. Start tracking your costs to get better profit insights.
              </div>
            ) : (
              expenses.slice(0, 10).map((e) => (
                <div key={e.id} style={{ padding: "10px 16px", borderBottom: `1px solid ${BORDER}`, display: "flex", alignItems: "center", gap: 12, fontSize: 14 }}>
                  <span style={{ width: 90, fontWeight: 600, color: "#334155" }}>{e.expense_date}</span>
                  <span style={{ width: 100, fontWeight: 600, background: "#f1f5f9", color: "#334155", borderRadius: 6, padding: "2px 8px", fontSize: 12, textAlign: "center" }}>{e.category}</span>
                  <span style={{ flex: 1, color: "#0f172a" }}>{e.description || "—"}</span>
                  <span style={{ fontWeight: 700, color: "#991b1b" }}>-{formatCurrency(e.amount)}</span>
                </div>
              ))
            )}
          </div>
        </>
      ) : null}

      {/* Add expense modal */}
      {showAddExpense ? (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.35)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center" }} onClick={() => setShowAddExpense(false)}>
          <div style={{ background: "#fff", borderRadius: 12, width: "100%", maxWidth: 400, boxShadow: "0 20px 60px rgba(0,0,0,0.15)" }} onClick={e => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "20px 24px 0" }}>
              <h2 style={{ fontSize: 18, fontWeight: 700, margin: 0 }}>Add expense</h2>
              <button style={{ background: "none", border: "none", fontSize: 22, cursor: "pointer", color: "#64748b" }} onClick={() => setShowAddExpense(false)}>&times;</button>
            </div>
            <div style={{ padding: "16px 24px 24px" }}>
              <div style={{ marginBottom: 14 }}>
                <label style={sLabel}>Date</label>
                <input type="date" style={sInput} value={expDate} onChange={e => setExpDate(e.target.value)} />
              </div>
              <div style={{ marginBottom: 14 }}>
                <label style={sLabel}>Amount (£)</label>
                <input type="number" style={sInput} value={expAmt} onChange={e => setExpAmt(e.target.value)} placeholder="0.00" step="0.01" min="0" />
              </div>
              <div style={{ marginBottom: 14 }}>
                <label style={sLabel}>Category</label>
                <select style={sSelect} value={expCat} onChange={e => setExpCat(e.target.value)}>
                  {EXPENSE_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div style={{ marginBottom: 14 }}>
                <label style={sLabel}>Description</label>
                <input type="text" style={sInput} value={expDesc} onChange={e => setExpDesc(e.target.value)} placeholder="Optional" />
              </div>
              <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
                <button className="button button--ghost" onClick={() => setShowAddExpense(false)}>Cancel</button>
                <button className="button button--primary" onClick={handleAddExpense} disabled={expSaving || !expAmt}>Save</button>
              </div>
            </div>
          </div>
        </div>
      ) : null}

      <div style={{ marginTop: 32, textAlign: "center" }}>
        <Link href="/finance" style={{ fontSize: 13, color: "#64748b" }}>
          Finance Hub v1 — JobStacker
        </Link>
      </div>
    </section>
  );
}

const sLabel = { display: "block", fontSize: 13, fontWeight: 600, color: "#334155", marginBottom: 4 } as React.CSSProperties;
const sInput = { width: "100%", padding: "8px 12px", border: "1px solid #e5e7eb", borderRadius: 6, fontSize: 14, outline: "none", boxSizing: "border-box" as const };
const sSelect = { width: "100%", padding: "8px 12px", border: "1px solid #e5e7eb", borderRadius: 6, fontSize: 14, outline: "none", background: "#fff", boxSizing: "border-box" as const };
