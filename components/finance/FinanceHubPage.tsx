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
const BORDER = "#e5e7eb";
const sl = { display: "block", fontSize: 13, fontWeight: 600, color: "#334155", marginBottom: 4 } as React.CSSProperties;
const si = { width: "100%", padding: "8px 12px", border: "1px solid #e5e7eb", borderRadius: 6, fontSize: 14, outline: "none", boxSizing: "border-box" as const };

function StatCard({ value, label, color, bg }: { value: string; label: string; color?: string; bg?: string }) {
  return (
    <div style={{ padding: "20px 22px", borderRadius: 10, background: bg ?? "#f8fafc", border: `1px solid ${BORDER}` }}>
      <div style={{ fontSize: 28, fontWeight: 800, color: color ?? "#0f172a", marginBottom: 4 }}>{value}</div>
      <div style={{ fontSize: 13, fontWeight: 600, color: "#64748b" }}>{label}</div>
    </div>
  );
}

function BarChart({ data, maxVal }: { data: Array<{ month: string; revenue: number; expenses: number; profit: number }>; maxVal: number }) {
  const max = Math.max(maxVal, 1);
  return (
    <div style={{ display: "flex", alignItems: "flex-end", gap: 8, height: 160, padding: "8px 0" }}>
      {data.map((d) => {
        const rH = (d.revenue / max) * 160;
        const eH = (d.expenses / max) * 160;
        return (
          <div key={d.month} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", height: 160 }}>
            <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "flex-end", gap: 2, width: "100%" }}>
              <div style={{ width: "100%", height: Math.max(2, rH), background: GREEN, borderRadius: "3px 3px 0 0" }} />
              <div style={{ width: "100%", height: Math.max(2, eH), background: "#fca5a5", borderRadius: "3px 3px 0 0" }} />
            </div>
            <div style={{ fontSize: 10, fontWeight: 600, color: "#64748b", marginTop: 6, transform: "rotate(-45deg)", transformOrigin: "left top", whiteSpace: "nowrap" }}>{d.month.slice(2)}</div>
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
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState("1");
  const [taxRate, setTaxRate] = useState(20);

  // Add expense
  const [showAddExpense, setShowAddExpense] = useState(false);
  const [expDate, setExpDate] = useState(new Date().toISOString().slice(0, 10));
  const [expAmt, setExpAmt] = useState("");
  const [expCat, setExpCat] = useState("Materials");
  const [expDesc, setExpDesc] = useState("");
  const [expSaving, setExpSaving] = useState(false);

  // AI Assistant
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
        const [sumRes, expRes] = await Promise.all([
          fetch(`/api/finance/summary?period=${period}&taxRate=${taxRate}`, { headers }),
          fetch("/api/finance/expenses/list", { headers }),
        ]);
        if (sumRes.ok && !cancelled) setSummary(await sumRes.json());
        if (expRes.ok) { const d = await expRes.json(); if (!cancelled) setExpenses(d.expenses ?? []); }
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
          method: "POST",
          headers: hdrs,
        body: JSON.stringify({ expense_date: expDate, amount: amt, category: expCat, description: expDesc }),
      });
      if (r.ok) { setShowAddExpense(false); setExpAmt(""); setExpDesc(""); setPeriod("1"); }
    } catch { /* */ } finally { setExpSaving(false); }
  }

  async function handleAiAsk() {
    if (!aiQuestion.trim() || !summary) return;
    setAiLoading(true);
    setAiAnswer("");

    const m = summary.metrics;
    const topCat = Object.entries(summary.expenseCategories).sort((a, b) => b[1] - a[1])[0];

    // Rule-based finance assistant (no LLM needed for basic queries)
    const q = aiQuestion.toLowerCase();
    let answer = "";

    if (q.includes("profit")) {
      answer = `Your profit for this period is ${formatCurrency(m.profit)}. `;
      answer += `That's a ${m.profitMargin.toFixed(1)}% margin. `;
      if (m.profitMargin < 15) answer += "This is below the typical 20-30% target. Consider reviewing expenses.";
      else if (m.profitMargin > 30) answer += "Great margin. Keep doing what you're doing.";
    } else if (q.includes("best month") || q.includes("best month")) {
      const best = summary.chartData.sort((a, b) => b.revenue - a.revenue)[0];
      answer = best ? `Your best month was ${best.month} with ${formatCurrency(best.revenue)} in revenue.` : "Not enough data yet.";
    } else if (q.includes("service") || q.includes("most money")) {
      answer = topCat ? `${topCat[0]} is your highest-earning category at ${formatCurrency(topCat[1])}.` : "Not enough data yet.";
    } else if (q.includes("tax")) {
      answer = `Estimated tax at ${taxRate}% is ${formatCurrency(m.estimatedTax)}. This is based on your profit of ${formatCurrency(m.profit)}. Always confirm with your accountant.`;
    } else if (q.includes("expense") && (q.includes("increasing") || q.includes("fastest"))) {
      const cats = Object.entries(summary.expenseCategories).sort((a, b) => b[1] - a[1]);
      answer = cats.length > 0 ? `Your top expense categories: ${cats.slice(0, 3).map(([n, v]) => `${n} (${formatCurrency(v)})`).join(", ")}.` : "No expense data yet.";
    } else if (q.includes("quote") || q.includes("average")) {
      answer = `Your average job value is ${formatCurrency(m.avgJobValue)} across ${m.paidCount} paid jobs.`;
    } else if (q.includes("health") || q.includes("score")) {
      answer = `Your business health score is ${m.healthScore}/100. `;
      if (m.healthScore >= 70) answer += "Looking strong.";
      else if (m.healthScore >= 50) answer += "Doing well — focus on improving your profit margin.";
      else answer += "There's room for improvement. Start by tracking expenses and reviewing costs.";
    } else {
      answer = `Here's your financial snapshot:\n\nRevenue: ${formatCurrency(m.revenue)}\nProfit: ${formatCurrency(m.profit)} (${m.profitMargin.toFixed(1)}%)\nExpenses: ${formatCurrency(m.expenses)}\nEst. Tax: ${formatCurrency(m.estimatedTax)}\nJobs: ${m.paidCount}`;
      answer += `\n\nI can answer questions about: profit, best month, services, tax, expenses, average quotes, and health score. Try asking something specific!`;
    }

    answer += "\n\n*Estimates only. Consult your accountant.*";
    setTimeout(() => setAiAnswer(answer), 600);
    setTimeout(() => setAiLoading(false), 700);
  }

  const exportCSV = () => {
    if (!summary) return;
    let csv = "Month,Revenue,Expenses,Profit\n";
    for (const d of summary.chartData) csv += `${d.month},${d.revenue.toFixed(2)},${d.expenses.toFixed(2)},${d.profit.toFixed(2)}\n`;
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = "jobstacker-finance.csv"; a.click();
    URL.revokeObjectURL(url);
  };

  if (loading) return (
    <section className="workspace-page"><div style={{ padding: 40, textAlign: "center", color: "#64748b" }}>Loading finance data...</div></section>
  );

  return (
    <section className="workspace-page" style={{ paddingBottom: 60 }}>
      <div className="workspace-page__header">
        <div>
          <p className="workspace-page__eyebrow">Finance</p>
          <h1>Finance Hub</h1>
          <p>Revenue, profit, expenses, tax estimates, and forecasting.</p>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button className="button button--ghost" style={{ fontSize: 13 }} onClick={exportCSV}>Export CSV</button>
          <button className="button button--primary" onClick={() => setShowAddExpense(true)}>+ Add expense</button>
        </div>
      </div>

      {/* Period selector + Tax rate */}
      <div style={{ display: "flex", gap: 12, alignItems: "center", marginBottom: 20, flexWrap: "wrap" }}>
        {PERIODS.map(p => (
          <button key={p.value} className={`button ${period === p.value ? "button--primary" : "button--ghost"}`}
            style={{ fontSize: 13, padding: "6px 16px" }} onClick={() => setPeriod(p.value)}>
            {p.label}
          </button>
        ))}
        <span style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: 13, color: "#64748b", fontWeight: 600 }}>Tax rate:</span>
          <input type="number" min="0" max="100" value={taxRate} onChange={e => setTaxRate(parseInt(e.target.value) || 0)}
            style={{ width: 60, padding: "5px 8px", border: `1px solid ${BORDER}`, borderRadius: 6, fontSize: 13, textAlign: "center", outline: "none" }} />
          <span style={{ fontSize: 13, color: "#64748b" }}>%</span>
        </span>
      </div>

      {/* Disclaimer */}
      <div style={{ background: "#fef3c7", border: "1px solid #fcd34d", borderRadius: 8, padding: "10px 16px", marginBottom: 24, fontSize: 13, color: "#92400e", fontWeight: 600 }}>
        JobStacker is not an accounting service. Estimates only. Always consult a qualified accountant or tax professional.
      </div>

      {summary ? (
        <>
          {/* Metric cards */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(170px, 1fr))", gap: 12, marginBottom: 24 }}>
            <StatCard value={formatCurrency(summary.metrics.revenue)} label="Revenue" color={GREEN} bg="#eefaf4" />
            <StatCard value={formatCurrency(summary.metrics.profit)} label={`Profit (${summary.metrics.profitMargin.toFixed(1)}%)`} color={summary.metrics.profit >= 0 ? "#065f46" : "#991b1b"} />
            <StatCard value={formatCurrency(summary.metrics.expenses)} label="Expenses" />
            <StatCard value={formatCurrency(summary.metrics.estimatedTax)} label={`Est. tax (${taxRate}%)`} />
            <StatCard value={formatCurrency(summary.metrics.outstandingValue)} label="Outstanding quotes" />
            <StatCard value={formatCurrency(summary.metrics.avgJobValue)} label="Avg job value" />
          </div>

          {/* Chart + Health + Forecasting */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 280px", gap: 16, marginBottom: 24 }}>
            <div className="table-card">
              <h2 style={{ fontSize: 16, fontWeight: 700, margin: "0 0 4px" }}>Revenue vs Expenses</h2>
              <div style={{ fontSize: 12, color: "#64748b", marginBottom: 8, display: "flex", gap: 16 }}>
                <span><span style={{ display: "inline-block", width: 10, height: 10, background: GREEN, borderRadius: 2, marginRight: 4 }} />Revenue</span>
                <span><span style={{ display: "inline-block", width: 10, height: 10, background: "#fca5a5", borderRadius: 2, marginRight: 4 }} />Expenses</span>
              </div>
              <BarChart data={summary.chartData} maxVal={Math.max(summary.metrics.revenue, summary.metrics.expenses, 100)} />
            </div>
            <div>
              <HealthMeter score={summary.metrics.healthScore} />
              <div style={{ marginTop: 12, padding: "16px 20px", borderRadius: 10, background: "#f0fdf4", border: "1px solid #bbf7d0" }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: "#065f46", marginBottom: 8, textTransform: "uppercase" }}>Forecast (est.)</div>
                <div style={{ fontSize: 13, color: "#065f46", lineHeight: 1.8 }}>
                  Next month: {formatCurrency(summary.forecast.nextMonthRevenue)} revenue<br />
                  Next quarter: {formatCurrency(summary.forecast.nextQuarterRevenue)} revenue
                </div>
              </div>
            </div>
          </div>

          {/* AI Finance Assistant */}
          <div className="table-card" style={{ marginBottom: 24 }}>
            <h2 style={{ fontSize: 16, fontWeight: 700, color: "#0f172a", margin: "0 0 12px" }}>AI Finance Assistant</h2>
            <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
              <input type="text" style={{ ...si, flex: 1 }} placeholder="e.g. How much profit did I make? What's my best month?"
                value={aiQuestion} onChange={e => setAiQuestion(e.target.value)}
                onKeyDown={e => { if (e.key === "Enter") handleAiAsk(); }} />
              <button className="button button--primary" onClick={handleAiAsk} disabled={aiLoading || !aiQuestion.trim()}>
                {aiLoading ? "..." : "Ask"}
              </button>
            </div>
            {aiAnswer ? (
              <div style={{ background: "#f8fafc", borderRadius: 8, padding: "14px 18px", fontSize: 14, color: "#334155", lineHeight: 1.7, whiteSpace: "pre-line" }}>
                {aiAnswer}
              </div>
            ) : null}
            <div style={{ fontSize: 12, color: "#94a3b8", marginTop: 8 }}>Ask about profit, best month, services, tax, expenses, quotes, or health score.</div>
          </div>

          {/* Expense list + Category breakdown */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 24 }}>
            <div className="table-card">
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                <h2 style={{ fontSize: 16, fontWeight: 700, color: "#0f172a", margin: 0 }}>Recent expenses</h2>
                <button className="button button--ghost" style={{ fontSize: 13 }} onClick={() => setShowAddExpense(true)}>+ Add</button>
              </div>
              {expenses.length === 0 ? (
                <div style={{ padding: 32, textAlign: "center", color: "#64748b", fontSize: 14 }}>No expenses yet. Track costs for better profit insights.</div>
              ) : (
                expenses.slice(0, 8).map((e) => (
                  <div key={e.id} style={{ padding: "10px 16px", borderBottom: `1px solid ${BORDER}`, display: "flex", alignItems: "center", gap: 10, fontSize: 14 }}>
                    <span style={{ width: 80, fontWeight: 600, color: "#334155" }}>{e.expense_date}</span>
                    <span style={{ minWidth: 90, fontWeight: 600, background: "#f1f5f9", color: "#334155", borderRadius: 6, padding: "2px 8px", fontSize: 12, textAlign: "center" }}>{e.category}</span>
                    <span style={{ flex: 1, color: "#0f172a", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{e.description || "—"}</span>
                    <span style={{ fontWeight: 700, color: "#991b1b" }}>-{formatCurrency(e.amount)}</span>
                  </div>
                ))
              )}
            </div>
            <div className="table-card">
              <h2 style={{ fontSize: 16, fontWeight: 700, color: "#0f172a", margin: "0 0 12px" }}>Expense breakdown</h2>
              {Object.entries(summary.expenseCategories).sort((a, b) => b[1] - a[1]).slice(0, 8).map(([cat, amt]) => (
                <div key={cat} style={{ padding: "10px 16px", borderBottom: `1px solid ${BORDER}`, display: "flex", justifyContent: "space-between", fontSize: 14 }}>
                  <span style={{ color: "#334155", fontWeight: 600 }}>{cat}</span>
                  <span style={{ fontWeight: 700, color: "#991b1b" }}>{formatCurrency(amt)}</span>
                </div>
              ))}
              {Object.keys(summary.expenseCategories).length === 0 ? (
                <div style={{ padding: 32, textAlign: "center", color: "#64748b", fontSize: 14 }}>No expense data yet.</div>
              ) : null}
            </div>
          </div>

          {/* Growth metrics */}
          <div style={{ display: "flex", gap: 24, flexWrap: "wrap", padding: "16px 20px", background: "#f8fafc", borderRadius: 10, border: `1px solid ${BORDER}`, marginBottom: 24 }}>
            <div>
              <span style={{ fontSize: 13, color: "#64748b" }}>Revenue growth</span>
              <strong style={{ display: "block", fontSize: 18, color: summary.metrics.revenueGrowth >= 0 ? "#065f46" : "#991b1b" }}>
                {summary.metrics.revenueGrowth >= 0 ? "+" : ""}{summary.metrics.revenueGrowth.toFixed(1)}%
              </strong>
            </div>
            <div>
              <span style={{ fontSize: 13, color: "#64748b" }}>Profit margin</span>
              <strong style={{ display: "block", fontSize: 18, color: "#0f172a" }}>{summary.metrics.profitMargin.toFixed(1)}%</strong>
            </div>
            <div>
              <span style={{ fontSize: 13, color: "#64748b" }}>Paid jobs</span>
              <strong style={{ display: "block", fontSize: 18, color: "#0f172a" }}>{summary.metrics.paidCount}</strong>
            </div>
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
              <div style={{ marginBottom: 14 }}><label style={sl}>Date</label><input type="date" style={si} value={expDate} onChange={e => setExpDate(e.target.value)} /></div>
              <div style={{ marginBottom: 14 }}><label style={sl}>Amount (£)</label><input type="number" style={si} value={expAmt} onChange={e => setExpAmt(e.target.value)} placeholder="0.00" step="0.01" min="0" /></div>
              <div style={{ marginBottom: 14 }}><label style={sl}>Category</label><select style={{ ...si, background: "#fff" }} value={expCat} onChange={e => setExpCat(e.target.value)}>{EXPENSE_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}</select></div>
              <div style={{ marginBottom: 14 }}><label style={sl}>Description</label><input type="text" style={si} value={expDesc} onChange={e => setExpDesc(e.target.value)} placeholder="Optional" /></div>
              <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
                <button className="button button--ghost" onClick={() => setShowAddExpense(false)}>Cancel</button>
                <button className="button button--primary" onClick={handleAddExpense} disabled={expSaving || !expAmt}>Save</button>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
}
