"use client";

import { usePathname, useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

type TourStep = {
  path: string;
  selector: string;
  title: string;
  text: string;
};

const STEPS: TourStep[] = [
  { path: "/dashboard", selector: ".stat-card:first-child", title: "Your Dashboard", text: "Overview of your customers, open quotes, and revenue. Upcoming jobs appear in the mini-calendar below." },
  { path: "/dashboard", selector: ".dashboard__actions a.button--primary", title: "Create a Quote", text: "Click 'New quote' to create an estimate. Add line items, set tax, and use AI pricing." },
  { path: "/customers", selector: ".workspace-page", title: "Your Customers", text: "Add customers with phone number, email, or both. Click any customer to see their full quote history." },
  { path: "/quotes", selector: ".workspace-page", title: "Your Quotes", text: "Every quote in one place. Preview, change status (Draft → Sent → Accepted), download PDF, or share as a public link." },
  { path: "/jobs", selector: ".workspace-page", title: "Your Jobs", text: "Accepted quotes become jobs here. Track progress, mark complete, and view all scheduled work — each linked back to its quote." },
  { path: "/calendar", selector: ".workspace-page", title: "Your Schedule", text: "Calendar view shows all jobs by date. Switch between Grid and List view. Change job status inline. Export to Apple Calendar." },
  { path: "/finance", selector: ".workspace-page", title: "Finance Overview", text: "Track earnings, estimated tax, and financial summaries. AI finance tool gives insights on your business performance." },
  { path: "/revenue", selector: ".workspace-page", title: "Revenue Dashboard", text: "Visualise revenue trends with line/bar charts. Filter by 3, 6, or 12 months. Export CSV on paid plans." },
  { path: "/settings", selector: "#profile-companyName", title: "Company Profile", text: "Set company name, phone, address, tax rate, and upload your logo. This info appears on every quote PDF you send." },
  { path: "/settings", selector: "#profile-customAiInstructions", title: "AI Pricing Rules", text: "Tell the AI your rates: '£80/hr for tree cutting' or '£5 per m² for patio cleaning'. AI uses these when generating quotes." },
];

const TOUR_KEY = "jobstacker_tour_done";

export function GuidedTour({ onDone }: { onDone: () => void }) {
  const [step, setStep] = useState(0);
  const [target, setTarget] = useState<DOMRect | null>(null);
  const [ready, setReady] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  const findTarget = useCallback(() => {
    const current = STEPS[step];
    if (!current) return null;
    const el = document.querySelector(current.selector);
    if (el) {
      const prev = document.querySelectorAll("[data-tour]");
      prev.forEach((p) => {
        (p as HTMLElement).style.outline = "";
        p.removeAttribute("data-tour");
      });
      (el as HTMLElement).style.outline = "3px solid #1F6B4F";
      (el as HTMLElement).style.outlineOffset = "3px";
      (el as HTMLElement).style.borderRadius = "6px";
      (el as HTMLElement).setAttribute("data-tour", "true");
      return el.getBoundingClientRect();
    }
    return null;
  }, [step]);

  useEffect(() => {
    const current = STEPS[step];
    if (!current) return;

    if (pathname !== current.path) {
      router.push(current.path);
      setReady(false);
      return;
    }

    let attempts = 0;
    const interval = setInterval(() => {
      const rect = findTarget();
      attempts++;
      if (rect) {
        const ins = 8;
        setTarget(new DOMRect(rect.left - ins, rect.top - ins, rect.width + ins * 2, rect.height + ins * 2));
        setReady(true);
        clearInterval(interval);
      } else if (attempts > 40) {
        setTarget(null);
        setReady(true);
        clearInterval(interval);
      }
    }, 100);

    return () => {
      clearInterval(interval);
      document.querySelectorAll("[data-tour]").forEach((p) => {
        (p as HTMLElement).style.outline = "";
        p.removeAttribute("data-tour");
      });
    };
  }, [step, pathname, router, findTarget]);

  function next() {
    clearHighlights();
    if (step >= STEPS.length - 1) {
      onDone();
    } else {
      setStep((s) => s + 1);
      setReady(false);
      setTarget(null);
    }
  }

  function prev() {
    if (step > 0) {
      clearHighlights();
      setStep((s) => s - 1);
      setReady(false);
      setTarget(null);
    }
  }

  function skip() {
    clearHighlights();
    onDone();
  }

  function clearHighlights() {
    document.querySelectorAll("[data-tour]").forEach((p) => {
      (p as HTMLElement).style.outline = "";
      p.removeAttribute("data-tour");
    });
  }

  const isLast = step === STEPS.length - 1;
  const current = STEPS[step];
  if (!current) return null;

  const t = target;
  const ww = typeof window !== "undefined" ? window.innerWidth : 400;
  const wh = typeof window !== "undefined" ? window.innerHeight : 600;
  const tooltipW = Math.min(340, ww - 20);
  const tooltipH = 240;

  // Position tooltip: below target if space, otherwise above, centered if neither fits
  let tooltipLeft = Math.max(10, Math.min(ww / 2 - tooltipW / 2, ww - tooltipW - 10));
  let tooltipTop: number;
  if (t && t.bottom + tooltipH + 20 < wh) {
    tooltipTop = t.bottom + 16; // below
  } else if (t && t.top - tooltipH - 20 > 0) {
    tooltipTop = t.top - tooltipH - 16; // above
  } else {
    tooltipTop = Math.max(20, (wh - tooltipH) / 2); // center
  }
  tooltipTop = Math.max(12, Math.min(tooltipTop, wh - tooltipH - 12));

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 3000 }}>
      {/* Blocking overlay: prevents clicks on anything behind */}
      {t ? (
        <>
          <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: t.top, background: "rgba(0,0,0,0.5)" }} />
          <div style={{ position: "absolute", top: t.top, left: 0, width: t.left, height: t.height, background: "rgba(0,0,0,0.5)" }} />
          <div style={{ position: "absolute", top: t.top, left: t.right, right: 0, height: t.height, background: "rgba(0,0,0,0.5)" }} />
          <div style={{ position: "absolute", top: t.bottom, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.5)" }} />
        </>
      ) : (
        <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.5)" }} />
      )}

      {/* Tooltip — only interactive area */}
      {ready ? (
        <div
          style={{
            position: "fixed",
            left: tooltipLeft,
            top: tooltipTop,
            width: tooltipW,
            background: "#fff",
            borderRadius: 12,
            boxShadow: "0 16px 48px rgba(0,0,0,0.3)",
            padding: ww < 400 ? "16px" : "20px 24px",
            zIndex: 3001,
          }}
        >
          <div style={{ fontSize: 12, fontWeight: 700, color: "#1F6B4F", marginBottom: 4, textTransform: "uppercase", letterSpacing: "0.04em" }}>
            Step {step + 1} of {STEPS.length}
          </div>
          <div style={{ fontSize: ww < 400 ? 16 : 18, fontWeight: 800, color: "#0f172a", marginBottom: 8 }}>
            {current.title}
          </div>
          <div style={{ fontSize: ww < 400 ? 13 : 14, color: "#475569", lineHeight: 1.6, marginBottom: 20 }}>
            {current.text}
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div style={{ display: "flex", gap: 6 }}>
              {STEPS.map((_, i) => (
                <div key={i} style={{
                  width: i === step ? 20 : 8, height: 8, borderRadius: 4,
                  background: i === step ? "#1F6B4F" : i < step ? "#10b981" : "#e5e7eb",
                  transition: "all 0.2s",
                }} />
              ))}
            </div>
            <div style={{ display: "flex", gap: 6 }}>
              <button onClick={skip}
                style={{ padding: "8px 14px", borderRadius: 6, fontSize: 13, fontWeight: 600,
                  border: "none", background: "#f1f5f9", color: "#64748b", cursor: "pointer", minHeight: 36 }}>
                Skip
              </button>
              <button onClick={next}
                style={{ padding: "8px 20px", borderRadius: 6, fontSize: 14, fontWeight: 700,
                  border: "none", background: "#1F6B4F", color: "#fff", cursor: "pointer", minHeight: 36 }}>
                {isLast ? "Done" : "Next"}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

export function isTourDone(): boolean {
  if (typeof window === "undefined") return false;
  return localStorage.getItem(TOUR_KEY) === "true";
}

export function markTourDone(): void {
  localStorage.setItem(TOUR_KEY, "true");
}

export function resetTour(): void {
  localStorage.removeItem(TOUR_KEY);
}
