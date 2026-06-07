"use client";

import { useEffect, useState } from "react";
import { useRegion } from "../../hooks/useRegion";

type MonthlyEntry = {
  month: string;
  label: string;
  total: number;
};

type RevenueData = {
  lifetimeTotal: number;
  thisMonthTotal: number;
  lastMonthTotal: number;
  pctChange: number;
  months: number;
  monthlyData: MonthlyEntry[];
};

const GREEN = "#1F6B4F";
const BORDER = "#e5e7eb";

function LineChart({ data }: { data: MonthlyEntry[] }) {
  const w = 700;
  const h = 260;
  const padLeft = 50;
  const padRight = 20;
  const padTop = 20;
  const padBottom = 30;
  const chartW = w - padLeft - padRight;
  const chartH = h - padTop - padBottom;

  const maxVal = Math.max(...data.map((d) => d.total), 1);
  const points = data.map((d, i) => {
    const x = padLeft + (i / Math.max(data.length - 1, 1)) * chartW;
    const y = padTop + chartH - (d.total / maxVal) * chartH;
    return { x, y, ...d };
  });

  const pathD = points.map((p, i) => (i === 0 ? `M${p.x},${p.y}` : `L${p.x},${p.y}`)).join(" ");

  return (
    <svg viewBox={`0 0 ${w} ${h}`} style={{ width: "100%", maxWidth: w, height: "auto" }}>
      {/* Grid lines */}
      {[0, 0.25, 0.5, 0.75, 1].map((ratio) => {
        const y = padTop + chartH - ratio * chartH;
        return (
          <g key={ratio}>
            <line x1={padLeft} y1={y} x2={padLeft + chartW} y2={y} stroke={BORDER} strokeWidth={1} />
            {ratio > 0 && (
              <text x={padLeft - 8} y={y + 4} textAnchor="end" fontSize={10} fill="#94a3b8">
                £{Math.round(maxVal * ratio)}
              </text>
            )}
          </g>
        );
      })}

      {/* X-axis labels */}
      {points.filter((_, i) => i % Math.max(Math.floor(data.length / 6), 1) === 0).map((p) => (
        <text key={p.month} x={p.x} y={h - 6} textAnchor="middle" fontSize={10} fill="#94a3b8">
          {p.label}
        </text>
      ))}

      {/* Area fill */}
      <path
        d={`${pathD} L${points[points.length - 1].x},${padTop + chartH} L${points[0].x},${padTop + chartH} Z`}
        fill="url(#revenueGradient)"
        opacity={0.3}
      />

      {/* Line */}
      <path d={pathD} fill="none" stroke={GREEN} strokeWidth={2.5} strokeLinejoin="round" />

      {/* Points */}
      {points.map((p) => (
        <circle key={p.month} cx={p.x} cy={p.y} r={3} fill="#fff" stroke={GREEN} strokeWidth={2} />
      ))}

      {/* Gradient */}
      <defs>
        <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={GREEN} stopOpacity={0.4} />
          <stop offset="100%" stopColor={GREEN} stopOpacity={0} />
        </linearGradient>
      </defs>
    </svg>
  );
}

export default function RevenuePage() {
  const { formatCurrency } = useRegion();
  const [data, setData] = useState<RevenueData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [months, setMonths] = useState(12);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    setLoading(true);
    (async () => {
      try {
        const tk = localStorage.getItem("quotecraft_token");
        const r = await fetch(`/api/revenue/summary?months=${months}`, {
          headers: tk ? { Authorization: `Bearer ${tk}` } : {},
        });
        if (!r.ok) {
          const j = await r.json().catch(() => ({}));
          throw new Error(j?.error?.message ?? "Failed");
        }
        setData(await r.json());
      } catch (x) {
        setError(x instanceof Error ? x.message : "Failed to load");
      } finally {
        setLoading(false);
      }
    })();
  }, [months, refreshKey]);

  const S = {
    page: { padding: "32px 24px", maxWidth: 800, margin: "0 auto" } as React.CSSProperties,
    header: { display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginBottom: 24 } as React.CSSProperties,
    eyebrow: { fontSize: 12, fontWeight: 700, color: "#64748b", letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 4 } as React.CSSProperties,
    h1: { fontSize: 26, fontWeight: 800, margin: 0, color: "#0f172a" } as React.CSSProperties,
    statsRow: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 12, marginBottom: 24 } as React.CSSProperties,
    statCard: { background: "#fff", border: `1px solid ${BORDER}`, borderRadius: 8, padding: "16px 20px" } as React.CSSProperties,
    statValue: { fontSize: 24, fontWeight: 800, margin: "0 0 2px", color: "#0f172a" } as React.CSSProperties,
    statLabel: { fontSize: 12, color: "#64748b" } as React.CSSProperties,
    chartCard: { background: "#fff", border: `1px solid ${BORDER}`, borderRadius: 8, padding: "20px 24px" } as React.CSSProperties,
    timeButtons: { display: "flex", gap: 6, marginBottom: 20 } as React.CSSProperties,
    timeBtn: (active: boolean) => ({
      padding: "6px 14px", borderRadius: 20, fontSize: 12, fontWeight: 600, cursor: "pointer",
      border: "none", background: active ? GREEN : "#f1f5f9", color: active ? "#fff" : "#334155",
    }) as React.CSSProperties,
    empty: { padding: 60, textAlign: "center" as const, color: "#64748b", fontSize: 14 },
    exportBtn: { padding: "8px 14px", borderRadius: 6, fontSize: 12, fontWeight: 600, cursor: "pointer", border: `1px solid ${BORDER}`, background: "#fff", color: "#334155" },
  };

  function handleExportCSV() {
    if (!data?.monthlyData.length) return;
    const csv = ["Month,Revenue (GBP)", ...data.monthlyData.map((d) => `${d.label},${d.total}`)].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "revenue-export.csv";
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <section style={S.page}>
      <div style={S.header}>
        <div>
          <p style={S.eyebrow}>Revenue</p>
          <h1 style={S.h1}>Revenue analytics</h1>
        </div>
        {data?.monthlyData?.length ? (
          <button style={S.exportBtn} onClick={handleExportCSV}>Export CSV</button>
        ) : null}
      </div>

      {loading ? (
        <div style={S.empty}>Loading...</div>
      ) : error ? (
        <div style={{ ...S.empty, color: "#b91c1c" }}>{error}</div>
      ) : !data ? null : data.lifetimeTotal === 0 && data.monthlyData.every((d) => d.total === 0) ? (
        <div style={S.empty}>
          <p style={{ margin: "0 0 8px", fontWeight: 600 }}>No revenue yet</p>
          <p style={{ margin: 0 }}>
            Mark completed jobs as paid to see revenue analytics.
          </p>
        </div>
      ) : (
        <>
          {/* Stats */}
          <div style={S.statsRow}>
            <div style={{ ...S.statCard, background: "#eefaf4", borderColor: "#a7f3d0" }}>
              <div style={{ ...S.statValue, color: "#065f46" }}>{formatCurrency(data.lifetimeTotal)}</div>
              <div style={{ ...S.statLabel, color: "#065f46" }}>Lifetime revenue</div>
            </div>
            <div style={S.statCard}>
              <div style={S.statValue}>{formatCurrency(data.thisMonthTotal)}</div>
              <div style={S.statLabel}>This month</div>
            </div>
            <div style={S.statCard}>
              <div style={S.statValue}>{formatCurrency(data.lastMonthTotal)}</div>
              <div style={S.statLabel}>Last month</div>
            </div>
            <div style={S.statCard}>
              <div style={{
                ...S.statValue,
                color: data.pctChange > 0 ? "#065f46" : data.pctChange < 0 ? "#b91c1c" : "#64748b",
              }}>
                {data.pctChange > 0 ? "+" : ""}{data.pctChange}%
              </div>
              <div style={S.statLabel}>Month-over-month</div>
            </div>
          </div>

          {/* Chart */}
          <div style={S.chartCard}>
            <div style={S.timeButtons}>
              {[3, 6, 12].map((m) => (
                <button key={m} style={S.timeBtn(months === m)} onClick={() => setMonths(m)}>
                  {m} months
                </button>
              ))}
            </div>
            {data.monthlyData.length > 0 ? (
              <LineChart data={data.monthlyData} />
            ) : (
              <div style={{ padding: 40, textAlign: "center", color: "#94a3b8", fontSize: 13 }}>
                No data for this period
              </div>
            )}
          </div>
        </>
      )}
    </section>
  );
}
