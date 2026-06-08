"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

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
  completed_at: string | null;
};

const STATUS_COLORS: Record<string, { bg: string; fg: string; label: string }> = {
  scheduled: { bg: "#dbeafe", fg: "#1e40af", label: "Scheduled" },
  in_progress: { bg: "#fef3c7", fg: "#92400e", label: "In progress" },
  completed: { bg: "#d1fae5", fg: "#065f46", label: "Completed" },
  cancelled: { bg: "#fee2e2", fg: "#991b1b", label: "Cancelled" },
};

export function JobListPage({ view }: { view: "active" | "completed" }) {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [refreshKey, setRefreshKey] = useState(0);

  const isCompleted = view === "completed";

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError("");

    (async () => {
      try {
        const tk = localStorage.getItem("jobstacker_token");
        const r = await fetch("/api/jobs/list", {
          headers: tk ? { Authorization: `Bearer ${tk}` } : {},
        });
        if (!r.ok) {
          const j = await r.json().catch(() => ({}));
          throw new Error(j?.error?.message ?? "Failed to load jobs");
        }
        const d = await r.json();
        if (!cancelled) setJobs(d.jobs ?? []);
      } catch (x) {
        if (!cancelled) setError(x instanceof Error ? x.message : "Failed to load jobs");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => { cancelled = true; };
  }, [refreshKey]);

  const now = new Date();
  const dayAgo = new Date(now.getTime() - 24 * 3600000);

  const filtered = useMemo(() => {
    if (isCompleted) {
      return jobs.filter((j) => j.status === "completed" || j.status === "cancelled");
    }
    return jobs.filter((j) => {
      if (j.status === "completed") {
        return new Date(j.completed_at ?? j.job_date) >= dayAgo;
      }
      if (j.status === "cancelled") return false;
      return true;
    });
  }, [jobs, isCompleted, dayAgo]);

  const sorted = useMemo(() => {
    return [...filtered].sort((a, b) => {
      if (isCompleted) return b.job_date.localeCompare(a.job_date);
      return a.job_date.localeCompare(b.job_date);
    });
  }, [filtered, isCompleted]);

  const PAGE: React.CSSProperties = { padding: "32px 24px", maxWidth: 900, margin: "0 auto" };
  const GREEN = "#1F6B4F";
  const BORDER = "#e5e7eb";

  return (
    <section style={PAGE}>
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 24 }}>
        <div>
          <p style={{ fontSize: 12, fontWeight: 700, color: "#64748b", letterSpacing: "0.06em", textTransform: "uppercase", margin: "0 0 4px" }}>
            Jobs
          </p>
          <h1 style={{ fontSize: 26, fontWeight: 800, margin: 0, color: "#0f172a" }}>
            {isCompleted ? "Completed jobs" : "Active jobs"}
          </h1>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <Link
            href={isCompleted ? "/jobs" : "/jobs/completed"}
            style={{
              padding: "8px 16px", borderRadius: 6, fontSize: 13, fontWeight: 600,
              border: `1px solid ${isCompleted ? BORDER : GREEN}`,
              background: isCompleted ? "#fff" : GREEN,
              color: isCompleted ? "#334155" : "#fff",
              textDecoration: "none", cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 6,
            }}
          >
            {isCompleted ? "← Active jobs" : "View completed"}
            {!isCompleted ? <span style={{ fontSize: 11, fontWeight: 400 }}>(archived after 24h)</span> : null}
          </Link>
          <Link
            href="/calendar"
            style={{
              padding: "8px 16px", borderRadius: 6, fontSize: 13, fontWeight: 600,
              border: `1px solid ${BORDER}`, background: "#f1f5f9", color: "#334155",
              textDecoration: "none",
            }}
          >
            Calendar
          </Link>
        </div>
      </div>

      {error ? (
        <div style={{ background: "#fef2f2", color: "#991b1b", padding: "12px 16px", borderRadius: 8, marginBottom: 16, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span>{error}</span>
          <button style={{ background: "none", border: "none", color: "#991b1b", fontWeight: 700, cursor: "pointer" }} onClick={() => setRefreshKey((k) => k + 1)}>Retry</button>
        </div>
      ) : null}

      {loading ? (
        <div style={{ padding: 40, textAlign: "center", color: "#64748b" }}>Loading...</div>
      ) : sorted.length === 0 ? (
        <div style={{ padding: 60, textAlign: "center", background: "#f8fafc", borderRadius: 8, border: `1px solid ${BORDER}` }}>
          <div style={{ fontSize: 18, fontWeight: 700, color: "#334155", marginBottom: 8 }}>
            {isCompleted ? "No completed jobs" : "No active jobs"}
          </div>
          <div style={{ fontSize: 14, color: "#64748b", marginBottom: 16 }}>
            {isCompleted
              ? "Completed and cancelled jobs will appear here."
              : "Schedule a job by accepting a quote or adding one from the calendar."}
          </div>
          {isCompleted ? (
            <Link href="/jobs" style={{ padding: "8px 20px", borderRadius: 6, fontSize: 14, fontWeight: 600, background: GREEN, color: "#fff", textDecoration: "none" }}>
              View active jobs
            </Link>
          ) : (
            <Link href="/quotes" style={{ padding: "8px 20px", borderRadius: 6, fontSize: 14, fontWeight: 600, background: GREEN, color: "#fff", textDecoration: "none" }}>
              Create a quote
            </Link>
          )}
        </div>
      ) : (
        <div style={{ border: `1px solid ${BORDER}`, borderRadius: 8, overflow: "hidden" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 16px", borderBottom: `1px solid ${BORDER}`, fontSize: 11, fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.05em", background: "#fafafa" }}>
            <span style={{ width: 100 }}>Date</span>
            <span style={{ width: 50 }}>Time</span>
            <span style={{ flex: 1 }}>Job</span>
            <span style={{ width: 140 }}>Customer</span>
            <span style={{ width: 110, textAlign: "center" as const }}>Status</span>
          </div>
          {sorted.map((j) => {
            const sc = STATUS_COLORS[j.status] ?? { bg: "#f1f5f9", fg: "#334155", label: j.status };
            return (
              <div
                key={j.id}
                style={{
                  display: "flex", alignItems: "center", gap: 12, padding: "12px 16px",
                  borderBottom: `1px solid ${BORDER}`, fontSize: 13, background: "#fff",
                  cursor: "default",
                }}
              >
                <span style={{ width: 100, fontWeight: 700, color: "#334155" }}>{j.job_date}</span>
                <span style={{ width: 50, color: "#64748b" }}>{j.start_time?.slice(0, 5)}</span>
                <span style={{ flex: 1, fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {j.job_title}
                </span>
                <span style={{ width: 140, color: "#64748b", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {j.customer_name || "—"}
                </span>
                <span style={{ width: 110, textAlign: "center" }}>
                  <span style={{
                    fontSize: 11, fontWeight: 600, color: sc.fg, background: sc.bg,
                    padding: "4px 10px", borderRadius: 10, textTransform: "capitalize", whiteSpace: "nowrap",
                    display: "inline-block",
                  }}>
                    {sc.label}
                  </span>
                </span>
              </div>
            );
          })}
        </div>
      )}

      <div style={{ marginTop: 16, fontSize: 13, color: "#64748b", textAlign: "center" }}>
        {sorted.length} job{sorted.length !== 1 ? "s" : ""} {isCompleted ? "completed" : "scheduled"}
        {!isCompleted ? " · Completed jobs move here after 24 hours" : " · View the full calendar for more details"}
      </div>
    </section>
  );
}
