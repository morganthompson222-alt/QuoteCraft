"use client";

import { usePathname, useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

type TourStep = {
  path: string;
  selector: string;
  title: string;
  text: string;
  position: "below" | "above";
};

const STEPS: TourStep[] = [
  {
    path: "/dashboard",
    selector: ".stat-card:first-child",
    title: "Your Dashboard",
    text: "This is your workspace overview. See total customers, open quotes, and revenue at a glance. Upcoming jobs appear in the mini-calendar below.",
    position: "below",
  },
  {
    path: "/dashboard",
    selector: ".dashboard__actions a.button--primary",
    title: "Create a Quote",
    text: "Start here — click 'New quote' to create an estimate for your customer. Quotes can be sent as a link or downloaded as a PDF.",
    position: "below",
  },
  {
    path: "/quotes",
    selector: ".workspace-page",
    title: "Your Quotes",
    text: "All your quotes live here. Click any quote to preview it, change its status, download a PDF, or send it to your customer.",
    position: "below",
  },
  {
    path: "/customers",
    selector: ".workspace-page",
    title: "Your Customers",
    text: "Manage your customer list here. Click a customer to see their details and all the quotes you've sent them.",
    position: "below",
  },
  {
    path: "/calendar",
    selector: ".cal-add-btn, button",
    title: "Your Schedule",
    text: "Once a quote is accepted, schedule the job here. Switch between Grid view (calendar) and List view (table). Change job status directly from the list.",
    position: "below",
  },
  {
    path: "/settings",
    selector: "#profile-customAiInstructions, textarea",
    title: "AI Pricing",
    text: "Tell the AI your rates here. For example: 'I charge £80/hr for tree cutting' or '£5 per m² for patio cleaning'. The AI will use these when generating quotes.",
    position: "below",
  },
];

export function GuidedTour({ onDone }: { onDone: () => void }) {
  const [step, setStep] = useState(0);
  const [target, setTarget] = useState<DOMRect | null>(null);
  const [ready, setReady] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  const findTarget = useCallback(() => {
    const current = STEPS[step];
    if (!current) return;
    const selectors = current.selector.split(",").map((s) => s.trim());
    for (const sel of selectors) {
      const el = document.querySelector(sel);
      if (el) {
        const rect = el.getBoundingClientRect();
        // Highlight element
        const prev = document.querySelectorAll("[data-tour-highlight]");
        prev.forEach((p) => {
          (p as HTMLElement).style.outline = "";
          (p as HTMLElement).style.outlineOffset = "";
          (p as HTMLElement).style.borderRadius = "";
          p.removeAttribute("data-tour-highlight");
        });
        (el as HTMLElement).style.outline = "3px solid #1F6B4F";
        (el as HTMLElement).style.outlineOffset = "4px";
        (el as HTMLElement).style.borderRadius = "6px";
        (el as HTMLElement).setAttribute("data-tour-highlight", "true");
        return rect;
      }
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

    // Wait for page to render and element to appear
    let attempts = 0;
    const interval = setInterval(() => {
      const rect = findTarget();
      attempts++;
      if (rect) {
        setTarget(rect);
        setReady(true);
        clearInterval(interval);
      } else if (attempts > 50) {
        // Element never found — show generic centered tooltip
        setTarget(new DOMRect(window.innerWidth / 2 - 160, window.innerHeight / 3, 320, 1));
        setReady(true);
        clearInterval(interval);
      }
    }, 100);

    return () => {
      clearInterval(interval);
      const prev = document.querySelectorAll("[data-tour-highlight]");
      prev.forEach((p) => {
        (p as HTMLElement).style.outline = "";
        (p as HTMLElement).style.outlineOffset = "";
        (p as HTMLElement).style.borderRadius = "";
        p.removeAttribute("data-tour-highlight");
      });
    };
  }, [step, pathname, router, findTarget]);

  function next() {
    const prev = document.querySelectorAll("[data-tour-highlight]");
    prev.forEach((p) => {
      (p as HTMLElement).style.outline = "";
      (p as HTMLElement).style.outlineOffset = "";
      (p as HTMLElement).style.borderRadius = "";
      p.removeAttribute("data-tour-highlight");
    });
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
      setStep((s) => s - 1);
      setReady(false);
      setTarget(null);
    }
  }

  const isLast = step === STEPS.length - 1;
  const current = STEPS[step];
  if (!current) return null;

  // Calculate tooltip position
  const tooltipLeft = target
    ? Math.max(16, Math.min(target.left + target.width / 2 - 160, window.innerWidth - 336))
    : window.innerWidth / 2 - 160;
  const tooltipTop =
    current.position === "below" && target
      ? target.bottom + 12
      : current.position === "above" && target
        ? target.top - 220
        : window.innerHeight / 2 - 100;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 3000,
        pointerEvents: "none",
      }}
    >
      {/* Spotlight cutout overlay */}
      {target && (
        <>
          <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: Math.max(0, target.top - 4), background: "rgba(0,0,0,0.35)" }} />
          <div style={{ position: "absolute", top: Math.max(0, target.top - 4), left: 0, width: Math.max(0, target.left - 4), height: target.height + 8, background: "rgba(0,0,0,0.35)" }} />
          <div style={{ position: "absolute", top: Math.max(0, target.top - 4), left: target.right + 4, right: 0, height: target.height + 8, background: "rgba(0,0,0,0.35)" }} />
          <div style={{ position: "absolute", top: target.bottom + 4, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.35)" }} />
        </>
      )}

      {/* Tooltip card */}
      {ready && (
        <div
          style={{
            position: "absolute",
            left: tooltipLeft,
            top: tooltipTop,
            width: 320,
            background: "#fff",
            borderRadius: 12,
            boxShadow: "0 16px 48px rgba(0,0,0,0.2)",
            padding: "20px 24px",
            pointerEvents: "auto",
            zIndex: 3001,
          }}
        >
          <div style={{ fontSize: 18, fontWeight: 800, color: "#0f172a", marginBottom: 6 }}>
            {current.title}
          </div>
          <div style={{ fontSize: 14, color: "#475569", lineHeight: 1.6, marginBottom: 16 }}>
            {current.text}
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div style={{ display: "flex", gap: 6 }}>
              {STEPS.map((_, i) => (
                <div
                  key={i}
                  style={{
                    width: 8, height: 8, borderRadius: "50%",
                    background: i === step ? "#1F6B4F" : "#e5e7eb",
                  }}
                />
              ))}
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <button
                onClick={prev}
                disabled={step === 0}
                style={{
                  padding: "8px 16px", borderRadius: 6, fontSize: 13, fontWeight: 600,
                  border: "1px solid #e5e7eb", background: "#fff", color: step === 0 ? "#cbd5e1" : "#334155",
                  cursor: step === 0 ? "default" : "pointer",
                }}
              >
                Back
              </button>
              <button
                onClick={onDone}
                style={{
                  padding: "8px 16px", borderRadius: 6, fontSize: 13, fontWeight: 600,
                  border: "none", background: "#f1f5f9", color: "#64748b", cursor: "pointer",
                }}
              >
                Skip
              </button>
              <button
                onClick={next}
                style={{
                  padding: "8px 20px", borderRadius: 6, fontSize: 14, fontWeight: 700,
                  border: "none", background: "#1F6B4F", color: "#fff", cursor: "pointer",
                }}
              >
                {isLast ? "Finish" : "Next"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
