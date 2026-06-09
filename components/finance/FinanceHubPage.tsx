"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRegion } from "../../hooks/useRegion";

type FinanceSummary = {
  metrics: {
    revenue: number; profit: number; expenses: number; estimatedTax: number;
    outstandingValue: number; avgJobValue: number; revenueGrowth: number;
    profitMargin: number; paidCount: number; healthScore: number;
  };
  chartData: Array<{ month: string; revenue: number; expenses: number; profit: number }>;
  expenseCategories: Record<string, number>;
  forecast: { nextMonthRevenue: number; nextMonthProfit: number; nextQuarterRevenue: number; nextQuarterProfit: number };
  disclaimer: string;
};

type Expense = {
  id: string; expense_date: string; amount: number; category: string; description: string;
  recurrence: string; linked_service: string | null;
};

const EXPENSE_CATEGORIES = [
  "Materials", "Equipment", "Fuel", "Subcontractors", "Insurance",
  "Advertising", "Software", "Vehicle Costs", "Office Costs", "Labour", "Other",
];

const PERIODS = [
  { value: "1", label: "This month" },
  { value: "3", label: "3 months" },
  { value: "6", label: "6 months" },
  { value: "12", label: "12 months" },
  { value: "all", label: "All time" },
];

const GREEN = "#1F6B4F";
const GREEN_LIGHT = "#eefaf4";
const BORDER = "#e5e7eb";

const pillBase: React.CSSProperties = {
  display: "inline-flex", alignItems: "center", gap: 6,
  padding: "7px 18px", borderRadius: 12, fontSize: 13, fontWeight: 600,
  border: "1.5px solid #e5e7eb", background: "#fff", color: "#334155",
  cursor: "pointer", transition: "all 0.15s",
};

const cardBase: React.CSSProperties = {
  background: "#fff", borderRadius: 16, padding: "28px 24px",
  boxShadow: "0 1px 4px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)",
  border: "1px solid #f1f5f9",
};

const inputStyle: React.CSSProperties = {
  width: "100%", padding: "10px 14px", border: "1.5px solid #e5e7eb", borderRadius: 12,
  fontSize: 14, outline: "none", boxSizing: "border-box", background: "#fff",
};

function StatCard({ value, label, color, bg }: { value: string; label: string; color?: string; bg?: string }) {
  return (
    <div style={{
      padding: "28px 24px", borderRadius: 16,
      background: bg ?? "#fff",
      boxShadow: bg ? "none" : "0 1px 4px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)",
      border: bg ? `1.5px solid ${bg === GREEN_LIGHT ? "#a7f3d0" : BORDER}` : "1px solid #f1f5f9",
    }}>
      <div style={{ fontSize: 32, fontWeight: 800, color: color ?? "#0f172a", letterSpacing: "-0.02em", marginBottom: 2 }}>{value}</div>
      <div style={{ fontSize: 13, fontWeight: 500, color: "#94a3b8", marginTop: 6 }}>{label}</div>
    </div>
  );
}

function BarChart({ data, maxVal }: { data: Array<{ month: string; revenue: number; expenses: number; profit: number }>; maxVal: number }) {
  const max = Math.max(maxVal, 1);
  return (
    <div style={{ display: "flex", alignItems: "flex-end", gap: 10, height: 180, padding: "16px 0 0" }}>
      {data.map((d) => {
        const rH = (d.revenue / max) * 180;
        const eH = (d.expenses / max) * 180;
        return (
          <div key={d.month} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", height: 180 }}>
            <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "flex-end", gap: 3, width: "100%" }}>
              <div style={{ width: "100%", height: Math.max(4, rH), background: GREEN, borderRadius: 4, minHeight: 0 }} />
              <div style={{ width: "100%", height: Math.max(4, eH), background: "#fca5a5", borderRadius: 4, minHeight: 0 }} />
            </div>
            <div style={{ fontSize: 10, fontWeight: 600, color: "#94a3b8", marginTop: 8, whiteSpace: "nowrap" }}>{d.month.slice(2)}</div>
          </div>
        );
      })}
    </div>
  );
}

function HealthMeter({ score }: { score: number }) {
  let label = "Poor", color = "#ef4444", bg = "#fef2f2";
  if (score >= 70) { label = "Excellent"; color = "#22c55e"; bg = "#f0fdf4"; }
  else if (score >= 50) { label = "Good"; color = GREEN; bg = GREEN_LIGHT; }
  else if (score >= 30) { label = "Fair"; color = "#f59e0b"; bg = "#fffbeb"; }
  return (
    <div style={{ ...cardBase, padding: "24px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
        <span style={{ fontSize: 15, fontWeight: 700, color: "#0f172a" }}>Business Health</span>
        <span style={{ fontSize: 12, fontWeight: 700, color, background: bg, padding: "4px 12px", borderRadius: 10 }}>{label}</span>
      </div>
      <div style={{ height: 8, background: "#e5e7eb", borderRadius: 4, overflow: "hidden" }}>
        <div style={{ height: "100%", width: `${Math.min(100, score)}%`, background: color, borderRadius: 4, transition: "width 0.5s" }} />
      </div>
      <div style={{ fontSize: 12, color: "#94a3b8", marginTop: 8 }}>{score}/100</div>
    </div>
  );
}

export function FinanceHubPage() {
  const { formatCurrency } = useRegion();
  const [summary, setSummary] = useState<FinanceSummary | null>(null);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [costSync, setCostSync] = useState<{ costBreakdown: Array<{ service: string; perJobCost: number; jobCount: number; totalCost: number }>; totalRecurringCost: number } | null>(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState("1");
  const [taxRate, setTaxRate] = useState(20);

  const [showAddExpense, setShowAddExpense] = useState(false);
  const [expDate, setExpDate] = useState(new Date().toISOString().slice(0, 10));
  const [expAmt, setExpAmt] = useState("");
  const [expCat, setExpCat] = useState("Materials");
  const [expDesc, setExpDesc] = useState("");
  const [expRecurrence, setExpRecurrence] = useState("one_time");
  const [expLinkedService, setExpLinkedService] = useState("");
  const [expSaving, setExpSaving] = useState(false);

  const [aiQuestion, setAiQuestion] = useState("");
  const [aiAnswer, setAiAnswer] = useState("");
  const [aiLoading, setAiLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    (async () => {
      try {
        const tk = localStorage.getItem("jobstacker_token");
        const headers: Record<string, string> = tk ? { Authorization: `Bearer ${tk}` } : {};
        const [sumRes, expRes, syncRes] = await Promise.all([
          fetch(`/api/finance/summary?period=${period}&taxRate=${taxRate}`, { headers }),
          fetch("/api/finance/expenses/list", { headers }),
          fetch("/api/finance/cost-sync", { headers }),
        ]);
        if (sumRes.ok && !cancelled) setSummary(await sumRes.json());
        if (expRes.ok) { const d = await expRes.json(); if (!cancelled) setExpenses(d.expenses ?? []); }
        if (syncRes.ok && !cancelled) setCostSync(await syncRes.json());
      } catch { /* */ }
      finally { if (!cancelled) setLoading(false); }
    })();
    return () => { cancelled = true; };
  }, [period, taxRate]);

  async function handleAddExpense() {
    const amt = parseFloat(expAmt);
    if (isNaN(amt) || amt <= 0) return;
    setExpSaving(true);
    try {
      const tk = localStorage.getItem("jobstacker_token");
      const hdrs: Record<string, string> = { "Content-Type": "application/json" };
      if (tk) hdrs.Authorization = `Bearer ${tk}`;
      const r = await fetch("/api/finance/expenses/create", {
        method: "POST", headers: hdrs,
        body: JSON.stringify({ expense_date: expDate, amount: amt, category: expCat, description: expDesc, recurrence: expRecurrence, linked_service: expRecurrence === "per_job" ? expLinkedService : undefined }),
      });
      if (r.ok) { setShowAddExpense(false); setExpAmt(""); setExpDesc(""); setExpRecurrence("one_time"); setExpLinkedService(""); setPeriod("1"); }
    } catch { /* */ } finally { setExpSaving(false); }
  }

  async function handleAiAsk() {
    if (!aiQuestion.trim() || !summary) return;
    setAiLoading(true); setAiAnswer("");

    const context = {
      period,
      taxRate,
      metrics: summary.metrics,
      chartData: summary.chartData.slice(-6),
      expenseCategories: summary.expenseCategories,
      costSync: costSync?.costBreakdown ?? [],
      forecast: summary.forecast,
      recentExpenses: expenses.slice(0, 10).map(e => ({
        date: e.expense_date, amount: e.amount, category: e.category,
        description: e.description, recurrence: e.recurrence,
      })),
    };

    try {
      const tk = localStorage.getItem("jobstacker_token");
      const r = await fetch("/api/finance/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json", ...(tk ? { Authorization: `Bearer ${tk}` } : {}) },
        body: JSON.stringify({ question: aiQuestion, context }),
      });
      if (r.ok) {
        const d = await r.json();
        setAiAnswer(d.answer);
      } else {
        setAiAnswer("Failed to get answer. Try rephrasing your question.");
      }
    } catch {
      setAiAnswer("Network error. Please try again.");
    } finally {
      setAiLoading(false);
    }
  }

  const exportCSV = () => {
    if (!summary) return;
    let csv = "Month,Revenue,Expenses,Profit\n";
    for (const d of summary.chartData) csv += `${d.month},${d.revenue.toFixed(2)},${d.expenses.toFixed(2)},${d.profit.toFixed(2)}\n`;
    const blob = new Blob([csv], { type: "text/csv" });
    const a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = "jobstacker-finance.csv"; a.click();
  };

  if (loading) return (
    <section className="workspace-page">
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "40px 32px", textAlign: "center", color: "#64748b" }}>Loading…</div>
    </section>
  );

  return (
    <section className="workspace-page" style={{ paddingBottom: 80 }}>
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "0 32px" }}>
        {/* Header */}
        <div className="workspace-page__header">
          <div>
            <p className="workspace-page__eyebrow">Finance</p>
            <h1>Finance Hub</h1>
            <p>Revenue, profit, expenses, tax estimates, and forecasting.</p>
          </div>
          <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
            <button style={{ ...pillBase, borderColor: "transparent", background: "transparent" }} onClick={exportCSV}>Export CSV</button>
            <button style={{ ...pillBase, background: GREEN, color: "#fff", borderColor: GREEN }} onClick={() => setShowAddExpense(true)}>
              <span style={{ fontSize: 16, lineHeight: 1 }}>+</span> Add expense
            </button>
          </div>
        </div>

        {/* Period + Tax */}
        <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 28, flexWrap: "wrap" }}>
          {PERIODS.map(p => (
            <button key={p.value}
              style={{
                ...pillBase,
                background: period === p.value ? GREEN : "#fff",
                color: period === p.value ? "#fff" : "#334155",
                borderColor: period === p.value ? GREEN : BORDER,
              }}
              onClick={() => setPeriod(p.value)}
            >
              {p.label}
            </button>
          ))}
          <span style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontSize: 13, color: "#94a3b8", fontWeight: 500 }}>Tax</span>
            <input type="number" min="0" max="100" value={taxRate}
              onChange={e => setTaxRate(parseInt(e.target.value) || 0)}
              style={{ width: 56, padding: "6px 8px", border: `1.5px solid ${BORDER}`, borderRadius: 10, fontSize: 13, textAlign: "center", outline: "none" }} />
            <span style={{ fontSize: 13, color: "#94a3b8" }}>%</span>
          </span>
        </div>

        {/* Disclaimer — slim info bar */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 18px", borderRadius: 12, marginBottom: 28, background: "#fffbeb", border: "1.5px solid #fde68a" }}>
          <span style={{ fontSize: 15 }}>ℹ️</span>
          <span style={{ fontSize: 13, color: "#92400e", fontWeight: 500 }}>
            Estimates only. Always consult a qualified accountant or tax professional.
          </span>
        </div>

        {summary ? (
          <>
            {/* Metric cards */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: 20, marginBottom: 28 }}>
              <StatCard value={formatCurrency(summary.metrics.revenue)} label="Revenue" color={GREEN} bg={GREEN_LIGHT} />
              <StatCard value={formatCurrency(summary.metrics.profit)} label={`Profit (${summary.metrics.profitMargin.toFixed(1)}%)`} color={summary.metrics.profit >= 0 ? "#065f46" : "#991b1b"} />
              <StatCard value={formatCurrency(summary.metrics.expenses)} label="Expenses" />
              <StatCard value={formatCurrency(summary.metrics.estimatedTax)} label={`Est. tax (${taxRate}%)`} />
              <StatCard value={formatCurrency(summary.metrics.outstandingValue)} label="Outstanding" />
              <StatCard value={formatCurrency(summary.metrics.avgJobValue)} label="Avg job value" />
            </div>

            {/* Chart + side cards */}
            <div style={{ display: "grid", gridTemplateColumns: "minmax(340px, 1fr) 260px", gap: 20, marginBottom: 28 }}>
              <div style={cardBase}>
                <h2 style={{ fontSize: 16, fontWeight: 700, color: "#0f172a", margin: "0 0 4px" }}>Revenue vs Expenses</h2>
                <div style={{ fontSize: 12, color: "#94a3b8", marginBottom: 4, display: "flex", gap: 18 }}>
                  <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <span style={{ width: 8, height: 8, background: GREEN, borderRadius: 2 }} /> Revenue
                  </span>
                  <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <span style={{ width: 8, height: 8, background: "#fca5a5", borderRadius: 2 }} /> Expenses
                  </span>
                </div>
                <BarChart data={summary.chartData} maxVal={Math.max(summary.metrics.revenue, summary.metrics.expenses, 100)} />
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                <HealthMeter score={summary.metrics.healthScore} />
                <div style={{ ...cardBase, padding: "22px 24px", background: GREEN_LIGHT, border: `1.5px solid #bbf7d0`, boxShadow: "none" }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: "#065f46", marginBottom: 10, textTransform: "uppercase", letterSpacing: "0.04em" }}>
                    Forecast (est.)
                  </div>
                  <div style={{ fontSize: 14, color: "#065f46", lineHeight: 1.9, fontWeight: 500 }}>
                    <div>Next month: <strong>{formatCurrency(summary.forecast.nextMonthRevenue)}</strong></div>
                    <div>Next quarter: <strong>{formatCurrency(summary.forecast.nextQuarterRevenue)}</strong></div>
                  </div>
                </div>
              </div>
            </div>

            {/* AI Assistant */}
            <div style={{ ...cardBase, marginBottom: 28 }}>
              <h2 style={{ fontSize: 16, fontWeight: 700, color: "#0f172a", margin: "0 0 14px" }}>AI Finance Assistant</h2>
              <div style={{ display: "flex", gap: 10, marginBottom: 14 }}>
                <input type="text" style={{ ...inputStyle, flex: 1 }}
                  placeholder="e.g. How much profit did I make? What's my best month?"
                  value={aiQuestion} onChange={e => setAiQuestion(e.target.value)}
                  onKeyDown={e => { if (e.key === "Enter") handleAiAsk(); }} />
                <button
                  style={{
                    padding: "10px 24px", borderRadius: 12, border: "none", cursor: "pointer",
                    background: aiLoading || !aiQuestion.trim() ? "#d1d5db" : GREEN,
                    color: "#fff", fontSize: 14, fontWeight: 700,
                    transition: "all 0.15s", whiteSpace: "nowrap",
                  }}
                  onClick={handleAiAsk} disabled={aiLoading || !aiQuestion.trim()}
                >
                  {aiLoading ? "…" : "Ask"}
                </button>
              </div>
              {aiAnswer ? (
                <div style={{ background: "#f8fafc", borderRadius: 14, padding: "16px 20px", fontSize: 14, color: "#334155", lineHeight: 1.7, whiteSpace: "pre-line" }}>
                  {aiAnswer}
                </div>
              ) : null}
              <div style={{ fontSize: 12, color: "#94a3b8", marginTop: 10 }}>
                Ask anything about your finances — powered by AI with your real data.
              </div>
            </div>

            {/* Expense list + categories */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 28 }}>
              <div style={cardBase}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                  <h2 style={{ fontSize: 16, fontWeight: 700, color: "#0f172a", margin: 0 }}>Recent expenses</h2>
                  <button
                    style={{ ...pillBase, padding: "5px 14px", fontSize: 12, fontWeight: 500, color: "#94a3b8", background: "transparent", border: "1.5px solid #e5e7eb" }}
                    onClick={() => setShowAddExpense(true)}
                  >
                    + Add
                  </button>
                </div>
                {expenses.length === 0 ? (
                  <div style={{ padding: 40, textAlign: "center", color: "#94a3b8", fontSize: 14 }}>No expenses yet. Track costs for better profit insights.</div>
                ) : (
                  expenses.map((e) => (
                    <div key={e.id} style={{ padding: "12px 0", borderBottom: `1px solid #f1f5f9`, display: "flex", alignItems: "center", gap: 12, fontSize: 14 }}>
                      <span style={{ width: 84, fontWeight: 600, color: "#334155" }}>{e.expense_date}</span>
                      <span style={{ minWidth: 90, fontWeight: 600, background: "#f8fafc", color: "#64748b", borderRadius: 8, padding: "3px 10px", fontSize: 12, textAlign: "center" }}>{e.category}</span>
                      <span style={{ flex: 1, color: "#334155", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{e.description || "—"}</span>
                      {e.recurrence && e.recurrence !== "one_time" ? (
                        <span style={{ fontSize: 11, fontWeight: 600, background: GREEN_LIGHT, color: GREEN, borderRadius: 8, padding: "2px 8px", whiteSpace: "nowrap" }}>
                          {e.recurrence === "per_job" ? `per job${e.linked_service ? `: ${e.linked_service}` : ""}` : e.recurrence}
                        </span>
                      ) : null}
                      <span style={{ fontWeight: 700, color: "#991b1b" }}>-{formatCurrency(e.amount)}</span>
                    </div>
                  ))
                )}
              </div>
              <div style={cardBase}>
                <h2 style={{ fontSize: 16, fontWeight: 700, color: "#0f172a", margin: "0 0 16px" }}>Expense breakdown</h2>
                {Object.entries(summary.expenseCategories).sort((a, b) => b[1] - a[1]).slice(0, 8).map(([cat, amt]) => (
                  <div key={cat} style={{ padding: "12px 0", borderBottom: `1px solid #f1f5f9`, display: "flex", justifyContent: "space-between", fontSize: 14 }}>
                    <span style={{ color: "#334155", fontWeight: 600 }}>{cat}</span>
                    <span style={{ fontWeight: 700, color: "#991b1b" }}>{formatCurrency(amt)}</span>
                  </div>
                ))}
                {Object.keys(summary.expenseCategories).length === 0 ? (
                  <div style={{ padding: 40, textAlign: "center", color: "#94a3b8", fontSize: 14 }}>No expense data yet.</div>
                ) : null}
              </div>
            </div>

            {/* Recurring cost sync */}
            {costSync && costSync.costBreakdown.length > 0 ? (
              <div style={{ ...cardBase, marginBottom: 28 }}>
                <h2 style={{ fontSize: 16, fontWeight: 700, color: "#0f172a", margin: "0 0 4px" }}>Per-job cost estimates</h2>
                <span style={{ fontSize: 13, color: "#94a3b8", display: "block", marginBottom: 16 }}>Based on completed & paid jobs matching your recurring expenses.</span>
                {costSync.costBreakdown.map((c) => (
                  <div key={c.service} style={{ padding: "10px 0", borderBottom: "1px solid #f1f5f9", display: "flex", alignItems: "center", gap: 16, fontSize: 14 }}>
                    <span style={{ fontWeight: 600, color: "#334155", width: 160 }}>{c.service}</span>
                    <span style={{ color: "#64748b", width: 100 }}>{formatCurrency(c.perJobCost)} × {c.jobCount} jobs</span>
                    <span style={{ marginLeft: "auto", fontWeight: 700, color: "#991b1b" }}>{formatCurrency(c.totalCost)}</span>
                  </div>
                ))}
                <div style={{ marginTop: 14, paddingTop: 12, borderTop: "2px solid #f1f5f9", display: "flex", justifyContent: "space-between", fontWeight: 700, fontSize: 15 }}>
                  <span style={{ color: "#0f172a" }}>Total per-job costs</span>
                  <span style={{ color: "#991b1b" }}>{formatCurrency(costSync.totalRecurringCost)}</span>
                </div>
              </div>
            ) : null}

            {/* Growth row */}
            <div style={{ display: "flex", gap: 32, flexWrap: "wrap", padding: "22px 28px", borderRadius: 16, background: "#f8fafc", border: "1.5px solid #f1f5f9", marginBottom: 28 }}>
              <div>
                <span style={{ fontSize: 13, color: "#94a3b8" }}>Revenue growth</span>
                <strong style={{ display: "block", fontSize: 20, fontWeight: 700, color: summary.metrics.revenueGrowth >= 0 ? "#065f46" : "#991b1b", marginTop: 2 }}>
                  {summary.metrics.revenueGrowth >= 0 ? "+" : ""}{summary.metrics.revenueGrowth.toFixed(1)}%
                </strong>
              </div>
              <div>
                <span style={{ fontSize: 13, color: "#94a3b8" }}>Profit margin</span>
                <strong style={{ display: "block", fontSize: 20, fontWeight: 700, color: "#0f172a", marginTop: 2 }}>{summary.metrics.profitMargin.toFixed(1)}%</strong>
              </div>
              <div>
                <span style={{ fontSize: 13, color: "#94a3b8" }}>Paid jobs</span>
                <strong style={{ display: "block", fontSize: 20, fontWeight: 700, color: "#0f172a", marginTop: 2 }}>{summary.metrics.paidCount}</strong>
              </div>
            </div>
          </>
        ) : null}

        {/* Add expense modal */}
        {showAddExpense ? (
          <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.35)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center" }} onClick={() => setShowAddExpense(false)}>
            <div style={{ background: "#fff", borderRadius: 16, width: "100%", maxWidth: 420, boxShadow: "0 20px 60px rgba(0,0,0,0.12)" }} onClick={e => e.stopPropagation()}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "24px 28px 0" }}>
                <h2 style={{ fontSize: 18, fontWeight: 700, margin: 0, color: "#0f172a" }}>Add expense</h2>
                <button style={{ background: "none", border: "none", fontSize: 22, cursor: "pointer", color: "#94a3b8", padding: 0 }} onClick={() => setShowAddExpense(false)}>&times;</button>
              </div>
              <div style={{ padding: "20px 28px 28px" }}>
                <div style={{ marginBottom: 16 }}><label style={sLabel}>Date</label><input type="date" style={inputStyle} value={expDate} onChange={e => setExpDate(e.target.value)} /></div>
                <div style={{ marginBottom: 16 }}><label style={sLabel}>Amount (£)</label><input type="number" style={inputStyle} value={expAmt} onChange={e => setExpAmt(e.target.value)} placeholder="0.00" step="0.01" min="0" /></div>
                <div style={{ marginBottom: 16 }}><label style={sLabel}>Category</label><select style={{ ...inputStyle, background: "#fff" }} value={expCat} onChange={e => setExpCat(e.target.value)}>{EXPENSE_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}</select></div>
                <div style={{ marginBottom: 16 }}>
                  <label style={sLabel}>Recurrence</label>
                  <select style={{ ...inputStyle, background: "#fff" }} value={expRecurrence} onChange={e => setExpRecurrence(e.target.value)}>
                    <option value="one_time">One-time</option>
                    <option value="per_job">Per job</option>
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                  </select>
                </div>
                {expRecurrence === "per_job" ? (
                  <div style={{ marginBottom: 16 }}>
                    <label style={sLabel}>Linked service</label>
                    <input type="text" style={inputStyle} list="service-suggestions" value={expLinkedService} onChange={e => setExpLinkedService(e.target.value)} placeholder='e.g. patio cleaning, fencing, tree work' />
                    <datalist id="service-suggestions">
                      {expenses.filter(e => e.linked_service).map(e => (
                        <option key={e.linked_service} value={e.linked_service!} />
                      ))}
                    </datalist>
                  </div>
                ) : null}
                <div style={{ marginBottom: 20 }}><label style={sLabel}>Description</label><input type="text" style={inputStyle} value={expDesc} onChange={e => setExpDesc(e.target.value)} placeholder="Optional" /></div>
                <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
                  <button style={{ ...pillBase, background: "transparent", borderColor: "transparent" }} onClick={() => setShowAddExpense(false)}>Cancel</button>
                  <button style={{ ...pillBase, background: GREEN, color: "#fff", borderColor: GREEN }} onClick={handleAddExpense} disabled={expSaving || !expAmt}>Save</button>
                </div>
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </section>
  );
}

const sLabel: React.CSSProperties = { display: "block", fontSize: 13, fontWeight: 600, color: "#334155", marginBottom: 6 };
