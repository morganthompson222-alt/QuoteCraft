"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { JobModal } from "../jobs/JobModal";

type Job = {
  id: string;
  quote_id: string | null;
  customer_name: string;
  job_title: string;
  status: string;
  job_date: string;
  start_time: string;
  end_time: string | null;
  location: string | null;
  notes: string | null;
  archived: boolean;
};

const DAY_NAMES = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const MONTH_NAMES = [
  "January","February","March","April","May","June",
  "July","August","September","October","November","December",
];

function pad(n: number) { return String(n).padStart(2, "0"); }
function toKey(d: Date) { return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`; }
function sameDay(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

const GREEN = "#1F6B4F";
const GREEN_LIGHT = "#eefaf4";
const BORDER = "#e5e7eb";

const STATUS_TABS = ["all", "scheduled", "in_progress", "completed", "cancelled", "archived"] as const;

const STATUS_COLORS: Record<string, { bg: string; fg: string; label: string }> = {
  scheduled: { bg: "#dbeafe", fg: "#1e40af", label: "Scheduled" },
  in_progress: { bg: "#fef3c7", fg: "#92400e", label: "In progress" },
  completed: { bg: "#d1fae5", fg: "#065f46", label: "Completed" },
  cancelled: { bg: "#fee2e2", fg: "#991b1b", label: "Cancelled" },
};

/* ─── Detail modal ─── */
function DetailModal({ job, onClose, onEdit, onExport }: {
  job: Job; onClose: () => void; onEdit: () => void; onExport: () => void;
}) {
  const router = useRouter();
  const sc = STATUS_COLORS[job.status] ?? { bg: "#f1f5f9", fg: "#334155", label: job.status };
  const s = {
    backdrop: { position: "fixed" as const, inset: 0, background: "rgba(0,0,0,0.35)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center" },
    card: { background: "#fff", borderRadius: 12, width: "100%", maxWidth: 420, boxShadow: "0 20px 60px rgba(0,0,0,0.15)" },
    head: { display: "flex", alignItems: "center", justifyContent: "space-between", padding: "20px 24px 0" },
    title: { fontSize: 18, fontWeight: 700, margin: 0 },
    close: { background: "none", border: "none", fontSize: 22, cursor: "pointer", color: "#64748b" },
    body: { padding: "16px 24px" },
    row: { display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: `1px solid ${BORDER}` },
    label: { fontSize: 13, color: "#64748b" },
    value: { fontSize: 14, fontWeight: 600, color: "#0f172a" },
    actions: { display: "flex", gap: 8, padding: "0 24px 20px" },
    btn: { padding: "8px 16px", borderRadius: 6, fontSize: 13, fontWeight: 600, cursor: "pointer", border: "none" },
  };

  return (
    <div style={s.backdrop} onClick={onClose}>
      <div style={s.card} onClick={(e) => e.stopPropagation()}>
        <div style={s.head}>
          <h2 style={s.title}>{job.job_title}</h2>
          <button style={s.close} onClick={onClose}>&times;</button>
        </div>
        <div style={s.body}>
          {[
            ["Customer", job.customer_name || "—"],
            ["Date", job.job_date],
            ["Time", `${job.start_time}${job.end_time ? ` – ${job.end_time}` : ""}`],
            ["Status", job.status],
            ...(job.location ? [["Location", job.location]] : []),
            ...(job.notes ? [["Notes", job.notes]] : []),
          ].map(([l, v]) => (
            <div style={s.row} key={l}>
              <span style={s.label}>{l}</span>
              {l === "Status" ? (
                <span style={{ ...s.value, background: sc.bg, color: sc.fg, padding: "2px 10px", borderRadius: 12, fontSize: 12, fontWeight: 600, textTransform: "capitalize" }}>{sc.label}</span>
              ) : (
                <span style={s.value}>{v}</span>
              )}
            </div>
          ))}
        </div>
        <div style={{ ...s.actions, justifyContent: "space-between" }}>
          <div style={{ display: "flex", gap: 8 }}>
            <button style={{ ...s.btn, background: "#f1f5f9", color: "#334155" }} onClick={onEdit}>Edit</button>
            <button style={{ ...s.btn, background: "#f1f5f9", color: "#334155" }} onClick={onExport}>Export PDF</button>
            {job.quote_id ? (
              <button style={{ ...s.btn, background: GREEN_LIGHT, color: GREEN }} onClick={() => router.push(`/quotes/${job.quote_id}`)}>
                View quote
              </button>
            ) : null}
          </div>
          <button style={{ ...s.btn, background: "#f1f5f9", color: "#334155" }} onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
}

/* ─── Main ─── */
export function CalendarPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [today] = useState(() => new Date());
  const [cursor, setCursor] = useState(() => new Date(today.getFullYear(), today.getMonth(), 1));
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [editJob, setEditJob] = useState<Job | null>(null);
  const [showNew, setShowNew] = useState(false);
  const [planTier, setPlanTier] = useState("solo");
  const [refreshKey, setRefreshKey] = useState(0);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [listTab, setListTab] = useState<typeof STATUS_TABS[number]>("all");

  const monthStart = new Date(cursor.getFullYear(), cursor.getMonth(), 1);
  const monthEnd = new Date(cursor.getFullYear(), cursor.getMonth() + 1, 0);

  const load = useCallback(async () => {
    setLoading(true); setError("");
    try {
      const tk = localStorage.getItem("jobstacker_token");
      const from = toKey(new Date(monthStart.getFullYear(), monthStart.getMonth() - 1, 1));
      const to = toKey(new Date(monthEnd.getFullYear(), monthEnd.getMonth() + 1, 0));
      const archivedParam = listTab === "archived" ? "&include_archived=true" : "";
      const r = await fetch(`/api/jobs/list?from=${from}&to=${to}${archivedParam}`, {
        headers: tk ? { Authorization: `Bearer ${tk}` } : {},
      });
      if (!r.ok) { const j = await r.json().catch(() => ({})); throw new Error(j?.error?.message ?? "Failed"); }
      const d = await r.json();
      setJobs(d.jobs ?? []);
    } catch (x) { setError(x instanceof Error ? x.message : "Failed"); }
    finally { setLoading(false); }
  }, [cursor.getFullYear(), cursor.getMonth(), listTab]);

  useEffect(() => {
    load();
    (async () => {
      try {
        const tk = localStorage.getItem("jobstacker_token");
        const r = await fetch("/api/profile", { headers: tk ? { Authorization: `Bearer ${tk}` } : {} });
        if (r.ok) { const d = await r.json(); setPlanTier(d.planTier ?? "solo"); }
      } catch { /* ok */ }
    })();
  }, [refreshKey]);

  const jobsByDate = useMemo(() => {
    const m: Record<string, Job[]> = {};
    for (const j of jobs) (m[j.job_date] ??= []).push(j);
    for (const k of Object.keys(m)) m[k].sort((a, b) => a.start_time.localeCompare(b.start_time));
    return m;
  }, [jobs]);

  const grid = useMemo(() => {
    const firstDayOfWeek = monthStart.getDay();
    const padBefore = firstDayOfWeek === 0 ? 6 : firstDayOfWeek - 1;
    const cells: (Date | null)[] = [];
    for (let i = padBefore; i > 0; i--) { const d = new Date(monthStart); d.setDate(d.getDate() - i); cells.push(d); }
    for (let d = 1; d <= monthEnd.getDate(); d++) cells.push(new Date(cursor.getFullYear(), cursor.getMonth(), d));
    const total = Math.ceil(cells.length / 7) * 7;
    let nxt = new Date(monthEnd); nxt.setDate(nxt.getDate() + 1);
    while (cells.length < total) { cells.push(new Date(nxt)); nxt.setDate(nxt.getDate() + 1); }
    return cells;
  }, [cursor.getFullYear(), cursor.getMonth()]);

  const prev = () => setCursor(new Date(cursor.getFullYear(), cursor.getMonth() - 1, 1));
  const next = () => setCursor(new Date(cursor.getFullYear(), cursor.getMonth() + 1, 1));
  const goToday = () => setCursor(new Date(today.getFullYear(), today.getMonth(), 1));

  const handleExport = async () => {
    try {
      const from = toKey(monthStart); const to = toKey(monthEnd);
      const tk = localStorage.getItem("jobstacker_token");
      const r = await fetch(`/api/jobs/export-all?from=${from}&to=${to}`, { headers: tk ? { Authorization: `Bearer ${tk}` } : {} });
      if (!r.ok) throw new Error((await r.json().catch(() => ({})))?.error?.message ?? "Export failed");
      const blob = await r.blob(); const url = URL.createObjectURL(blob);
      const a = document.createElement("a"); a.href = url; a.download = `jobstacker-${toKey(new Date())}.ics`; a.click();
      URL.revokeObjectURL(url);
    } catch (x) { setError(x instanceof Error ? x.message : "Export failed"); }
  };

  async function handleStatusChange(jobId: string, newStatus: string) {
    try {
      const tk = localStorage.getItem("jobstacker_token");
      const r = await fetch(`/api/jobs/${jobId}/update`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", ...(tk ? { Authorization: `Bearer ${tk}` } : {}) },
        body: JSON.stringify({ status: newStatus }),
      });
      if (!r.ok) { const j = await r.json().catch(() => ({})); throw new Error(j?.error?.message ?? "Failed"); }
      setRefreshKey((k) => k + 1);
    } catch (x) { setError(x instanceof Error ? x.message : "Failed to update"); }
  }

  async function handleArchive(jobId: string) {
    try {
      const tk = localStorage.getItem("jobstacker_token");
      const r = await fetch(`/api/jobs/${jobId}/update`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", ...(tk ? { Authorization: `Bearer ${tk}` } : {}) },
        body: JSON.stringify({ archived: true }),
      });
      if (!r.ok) { const j = await r.json().catch(() => ({})); throw new Error(j?.error?.message ?? "Failed"); }
      setRefreshKey((k) => k + 1);
    } catch (x) { setError(x instanceof Error ? x.message : "Failed to archive"); }
  }

  // List view
  const filtered = listTab === "all" ? jobs : listTab === "archived" ? jobs.filter((j) => j.archived) : jobs.filter((j) => j.status === listTab);
  const sorted = [...filtered].sort((a, b) => b.job_date.localeCompare(a.job_date));
  const counts = { all: jobs.filter((j) => !j.archived).length } as Record<string, number>;
  for (const j of jobs) { if (!j.archived) counts[j.status] = (counts[j.status] ?? 0) + 1; }
  counts.archived = jobs.filter((j) => j.archived).length;

  // Styles
  const PAGE: React.CSSProperties = { padding: "32px 24px", maxWidth: 960, margin: "0 auto", overflowX: "hidden" };
  const HEADER: React.CSSProperties = { display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginBottom: 24 };
  const EYEBROW: React.CSSProperties = { fontSize: 12, fontWeight: 700, color: "#64748b", letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 4 };
  const HEADING: React.CSSProperties = { fontSize: 26, fontWeight: 800, margin: 0, color: "#0f172a" };
  const NAV: React.CSSProperties = { display: "flex", alignItems: "center", justifyContent: "center", gap: 10, marginBottom: 16 };
  const NAV_BTN: React.CSSProperties = { width: 36, height: 36, display: "flex", alignItems: "center", justifyContent: "center", border: `1px solid ${BORDER}`, borderRadius: 8, background: "#fff", fontSize: 16, fontWeight: 700, cursor: "pointer", color: "#334155" };
  const NAV_LABEL: React.CSSProperties = { fontSize: 16, fontWeight: 800, minWidth: 220, textAlign: "center", color: "#0f172a" };
  const TODAY_BTN: React.CSSProperties = { height: 36, padding: "0 14px", border: `1px solid ${BORDER}`, borderRadius: 8, background: "#fff", fontSize: 12, fontWeight: 700, cursor: "pointer", color: "#334155" };
  const GRID: React.CSSProperties = { display: "grid", gridTemplateColumns: "repeat(7, 1fr)", borderLeft: `1px solid ${BORDER}`, borderTop: `1px solid ${BORDER}` };
  const DAY_HEADER: React.CSSProperties = { padding: "10px 0", textAlign: "center", fontSize: 11, fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.05em", borderBottom: `1px solid ${BORDER}`, borderRight: `1px solid ${BORDER}` };
  const CELL: React.CSSProperties = { minHeight: 100, borderRight: `1px solid ${BORDER}`, borderBottom: `1px solid ${BORDER}`, padding: 6, display: "flex", flexDirection: "column", background: "#fff" };
  const CELL_OFF: React.CSSProperties = { ...CELL, background: "#fafafa", opacity: 0.45 };
  const CELL_TODAY: React.CSSProperties = { ...CELL, background: GREEN_LIGHT };
  const DATE_NUM: React.CSSProperties = { fontSize: 13, fontWeight: 700, color: "#334155", lineHeight: 1 };
  const DATE_NUM_TODAY: React.CSSProperties = { fontSize: 12, fontWeight: 800, color: "#fff", background: GREEN, borderRadius: "50%", width: 24, height: 24, display: "inline-flex", alignItems: "center", justifyContent: "center" };
  const JOB_CHIP: React.CSSProperties = { display: "block", width: "100%", border: "none", borderRadius: 4, padding: "3px 6px", fontSize: 11, fontWeight: 500, textAlign: "left", cursor: "pointer", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", marginTop: 3, lineHeight: 1.4 };
  const TOGGLE = (active: boolean): React.CSSProperties => ({ padding: "6px 14px", borderRadius: 6, fontSize: 12, fontWeight: 700, cursor: "pointer", border: `1px solid ${active ? GREEN : BORDER}`, background: active ? GREEN : "#fff", color: active ? "#fff" : "#334155" });
  const TAB = (active: boolean): React.CSSProperties => ({ padding: "5px 12px", borderRadius: 20, fontSize: 12, fontWeight: 600, cursor: "pointer", border: "none", background: active ? GREEN : "#f1f5f9", color: active ? "#fff" : "#334155" });
  const TBODY: React.CSSProperties = { border: `1px solid ${BORDER}`, borderRadius: 8, overflow: "hidden" };
  const TROW: React.CSSProperties = { display: "flex", alignItems: "center", gap: 12, padding: "10px 14px", borderBottom: `1px solid ${BORDER}`, cursor: "pointer", fontSize: 13, background: "#fff" };
  const THEAD: React.CSSProperties = { display: "flex", alignItems: "center", gap: 12, padding: "8px 14px", borderBottom: `1px solid ${BORDER}`, fontSize: 11, fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.05em", background: "#fafafa" };

  return (
    <section style={PAGE}>
      <div style={HEADER}>
        <div>
          <p style={EYEBROW}>Schedule</p>
          <h1 style={HEADING}>Job schedule</h1>
        </div>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <div style={{ display: "flex", gap: 4, marginRight: 8 }}>
            <button style={TOGGLE(viewMode === "grid")} onClick={() => setViewMode("grid")}>Grid</button>
            <button style={TOGGLE(viewMode === "list")} onClick={() => setViewMode("list")}>List</button>
          </div>
          {planTier !== "solo" && planTier !== "free" ? (
            <>
              <button style={{ height: 36, padding: "0 14px", background: "#f1f5f9", color: "#334155", border: `1px solid ${BORDER}`, borderRadius: 6, fontSize: 12, fontWeight: 700, cursor: "pointer" }} onClick={handleExport}>
                Export .ics
              </button>
              <button style={{ height: 36, padding: "0 16px", background: GREEN, color: "#fff", border: "none", borderRadius: 6, fontSize: 13, fontWeight: 700, cursor: "pointer" }} onClick={() => setShowNew(true)}>
                + New job
              </button>
            </>
          ) : null}
        </div>
      </div>

      {viewMode === "grid" ? (
        <div style={NAV}>
          <button style={NAV_BTN} onClick={prev}>←</button>
          <span style={NAV_LABEL}>{MONTH_NAMES[cursor.getMonth()]} {cursor.getFullYear()}</span>
          <button style={NAV_BTN} onClick={next}>→</button>
          <button style={TODAY_BTN} onClick={goToday}>Today</button>
        </div>
      ) : null}

      {error ? (
        <div style={{ background: "#fef2f2", color: "#991b1b", padding: "12px 16px", borderRadius: 8, marginBottom: 16, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span>{error}</span>
          <button style={{ background: "none", border: "none", color: "#991b1b", fontWeight: 700, cursor: "pointer" }} onClick={() => setRefreshKey((k) => k + 1)}>Retry</button>
        </div>
      ) : null}

      {loading ? (
        <div style={{ padding: 40, textAlign: "center", color: "#64748b" }}>Loading...</div>
      ) : (
        <>
          {viewMode === "grid" ? (
            <div style={GRID}>
              {DAY_NAMES.map((d) => (<div style={DAY_HEADER} key={d}>{d}</div>))}
              {grid.map((day, i) => {
                if (!day) return <div style={{ ...CELL, background: "#fafafa" }} key={`e${i}`} />;
                const key = toKey(day);
                const isMonth = day.getMonth() === cursor.getMonth();
                const isToday = sameDay(day, today);
                const dayJobs = jobsByDate[key] ?? [];
                const cellStyle = !isMonth ? CELL_OFF : isToday ? CELL_TODAY : CELL;
                return (
                  <div style={cellStyle} key={key}>
                    <span style={isToday ? DATE_NUM_TODAY : DATE_NUM}>{day.getDate()}</span>
                    <div style={{ marginTop: 2, flex: 1, display: "flex", flexDirection: "column" }}>
                      {dayJobs.slice(0, 3).map((j) => {
                        const bg =
                          j.status === "completed" ? "#d1fae5" :
                          j.status === "cancelled" ? "#fee2e2" :
                          j.status === "in_progress" ? "#fef3c7" :
                          GREEN_LIGHT;
                        const fg =
                          j.status === "completed" ? "#065f46" :
                          j.status === "cancelled" ? "#991b1b" :
                          j.status === "in_progress" ? "#92400e" :
                          "#145c3c";
                        return (
                          <button key={j.id} style={{ ...JOB_CHIP, background: bg, color: fg }} onClick={() => setSelectedJob(j)}>
                            {j.start_time.slice(0, 5)} {j.job_title}{j.customer_name ? ` — ${j.customer_name}` : ""}
                          </button>
                        );
                      })}
                      {dayJobs.length > 3 ? (
                        <span style={{ fontSize: 10, fontWeight: 600, color: GREEN, padding: "2px 4px" }}>+{dayJobs.length - 3} more</span>
                      ) : null}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <>
              <div style={{ display: "flex", gap: 6, marginBottom: 16, flexWrap: "wrap", alignItems: "center" }}>
                {STATUS_TABS.map((s) => (
                  <button key={s} style={TAB(listTab === s)} onClick={() => setListTab(s)}>
                    {s === "in_progress" ? "In progress" : s === "all" ? "All" : s.charAt(0).toUpperCase() + s.slice(1)}
                    &nbsp;({counts[s] ?? 0})
                  </button>
                ))}
                <span style={{ marginLeft: "auto", fontSize: 13, color: "#64748b" }}>{sorted.length} job{sorted.length !== 1 ? "s" : ""}</span>
              </div>

              {sorted.length === 0 ? (
                <div style={{ padding: 40, textAlign: "center", color: "#64748b", fontSize: 14 }}>
                  No {listTab === "all" ? "" : listTab.replace("_", " ")} jobs found.
                </div>
              ) : (
                <div style={TBODY}>
                  {(() => {
                    const now = new Date();
                    const nextJob = sorted.find((j) => new Date(j.job_date) >= new Date(now.getFullYear(), now.getMonth(), now.getDate()) && (j.status === "scheduled" || j.status === "in_progress"));
                    return nextJob ? (
                      <div style={{ background: "#eff6ff", borderRadius: 8, padding: "12px 16px", marginBottom: 12, borderLeft: "4px solid #3b82f6", display: "flex", alignItems: "center", gap: 12 }}>
                        <span style={{ fontSize: 13, fontWeight: 700, color: "#3b82f6" }}>▶ Your Next Job</span>
                        <span style={{ flex: 1, fontSize: 14, fontWeight: 600, color: "#1e40af", cursor: "pointer" }} onClick={() => setSelectedJob(nextJob)}>{nextJob.job_title}</span>
                        <span style={{ fontSize: 13, color: "#64748b" }}>{nextJob.job_date} {nextJob.start_time?.slice(0, 5)}</span>
                      </div>
                    ) : null;
                  })()}
                  <div style={THEAD}>
                    <span style={{ width: 100 }}>Date</span>
                    <span style={{ width: 55 }}>Time</span>
                    <span style={{ flex: 1 }}>Job</span>
                    <span style={{ width: 140 }}>Customer</span>
                    <span style={{ width: 110, textAlign: "center" as const }}>Status</span>
                    <span style={{ width: 60 }}></span>
                  </div>
                  {sorted.map((j) => {
                    const sc = STATUS_COLORS[j.status] ?? { bg: "#f1f5f9", fg: "#334155", label: j.status };
                    const canArchive = (j.status === "completed" || j.status === "cancelled") && !j.archived;
                    return (
                      <div key={j.id} style={{ ...TROW, cursor: "pointer" }}
                        onMouseEnter={(e) => (e.currentTarget.style.background = "#f8fafc")}
                        onMouseLeave={(e) => (e.currentTarget.style.background = "#fff")}
                        onClick={() => setSelectedJob(j)}
                      >
                        <span style={{ width: 100, fontWeight: 700, color: "#334155" }}>{j.job_date}</span>
                        <span style={{ width: 55, color: "#64748b" }}>{j.start_time?.slice(0, 5)}</span>
                        <span style={{ flex: 1, fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{j.job_title}</span>
                        <span style={{ width: 140, color: "#64748b", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{j.customer_name || "—"}</span>
                        <span style={{ width: 110, textAlign: "center" }}>
                          <select
                            value={j.status}
                            onChange={(e) => handleStatusChange(j.id, e.target.value)}
                            onClick={(e) => e.stopPropagation()}
                            style={{
                              fontSize: 11, fontWeight: 600, color: sc.fg, background: sc.bg,
                              padding: "4px 8px", borderRadius: 10, border: "none", cursor: "pointer",
                              outline: "none", textTransform: "capitalize",
                            }}
                          >
                            <option value="scheduled">Scheduled</option>
                            <option value="in_progress">In progress</option>
                            <option value="completed">Completed</option>
                            <option value="cancelled">Cancelled</option>
                          </select>
                        </span>
                        <span style={{ width: 60, textAlign: "center" }}>
                          {canArchive ? (
                            <button
                              style={{ fontSize: 11, fontWeight: 600, border: "none", background: "#f1f5f9", color: "#64748b", borderRadius: 4, cursor: "pointer", padding: "2px 8px" }}
                              onClick={(e) => { e.stopPropagation(); handleArchive(j.id); }}
                            >
                              Archive
                            </button>
                          ) : j.archived ? (
                            <span style={{ fontSize: 10, color: "#94a3b8" }}>✓</span>
                          ) : null}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </>
          )}

          {planTier === "solo" || planTier === "free" ? (
            <div style={{ marginTop: 20, padding: "16px 20px", background: "#f8fafc", border: `1px solid ${BORDER}`, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <span style={{ fontSize: 14, color: "#64748b" }}>Upgrade to schedule jobs and export .ics files.</span>
              <Link href="/settings" style={{ padding: "8px 16px", background: GREEN, color: "#fff", borderRadius: 6, fontSize: 13, fontWeight: 700 }}>Upgrade</Link>
            </div>
          ) : null}
        </>
      )}

      {selectedJob ? (
        <DetailModal
          job={selectedJob}
          onClose={() => setSelectedJob(null)}
          onEdit={() => { setEditJob(selectedJob); setSelectedJob(null); }}
          onExport={() => window.open(`/api/jobs/${selectedJob.id}/pdf`)}
        />
      ) : null}

      {(showNew || editJob) ? (
        <JobModal
          job={editJob}
          onClose={() => { setShowNew(false); setEditJob(null); }}
          onSaved={() => setRefreshKey((k) => k + 1)}
        />
      ) : null}
    </section>
  );
}
