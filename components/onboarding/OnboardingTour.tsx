"use client";

import { useState } from "react";

const STEPS = [
  {
    title: "Welcome to JobStacker",
    body: "Create professional quotes, schedule jobs, and manage customers — all from one place. This quick tour will show you around.",
    icon: "📋",
  },
  {
    title: "Customers",
    body: "Add your clients here. Phone-only customers work too — no email required. Each customer's quotes and jobs are linked automatically.",
    icon: "👥",
  },
  {
    title: "Quotes",
    body: "Create quotes with line items, tax rates, and notes. Send them to customers, mark them accepted, download PDFs, and track payment status.",
    icon: "📄",
  },
  {
    title: "Schedule",
    body: "Your calendar and job list live here. Once a quote is accepted, schedule it on the calendar. Mark jobs complete as you finish them.",
    icon: "📅",
  },
  {
    title: "Documents & Payments",
    body: "Download professional PDF quotes anytime. Send reminders for unpaid quotes. Once paid, download a receipt. Pro plans can also export to Apple Calendar.",
    icon: "✅",
  },
];

export function OnboardingTour({ onDone }: { onDone: () => void }) {
  const [step, setStep] = useState(0);
  const isLast = step === STEPS.length - 1;

  function next() {
    if (isLast) onDone();
    else setStep((s) => s + 1);
  }

  const S = {
    overlay: {
      position: "fixed" as const, inset: 0, background: "rgba(15, 23, 42, 0.5)",
      zIndex: 2000, display: "flex", alignItems: "center", justifyContent: "center",
    },
    card: {
      background: "#fff", borderRadius: 16, width: "100%", maxWidth: 440,
      boxShadow: "0 24px 64px rgba(15, 23, 42, 0.2)", overflow: "hidden",
    },
    top: {
      padding: "28px 28px 0", textAlign: "center" as const,
    },
    icon: {
      fontSize: 40, marginBottom: 8, lineHeight: 1,
    },
    title: {
      fontSize: 20, fontWeight: 800, margin: "0 0 8px", color: "#0f172a",
    },
    body: {
      fontSize: 14, color: "#475569", lineHeight: 1.6, padding: "0 28px 28px", textAlign: "center" as const,
    },
    dots: {
      display: "flex", justifyContent: "center", gap: 6, padding: "0 28px 20px",
    },
    dot: (active: boolean) => ({
      width: 8, height: 8, borderRadius: "50%",
      background: active ? "#1F6B4F" : "#e5e7eb",
      border: "none",
    }),
    actions: {
      display: "flex", justifyContent: "space-between", alignItems: "center",
      padding: "0 28px 24px",
    },
    skip: {
      background: "none", border: "none", fontSize: 13, color: "#94a3b8",
      cursor: "pointer", fontWeight: 600,
    },
    next: {
      padding: "10px 24px", borderRadius: 8, fontSize: 14, fontWeight: 700,
      border: "none", cursor: "pointer",
      background: "#1F6B4F", color: "#fff",
    },
  };

  return (
    <div style={S.overlay} onClick={onDone}>
      <div style={S.card} onClick={(e) => e.stopPropagation()}>
        <div style={S.top}>
          <div style={S.icon}>{STEPS[step].icon}</div>
          <h2 style={S.title}>{STEPS[step].title}</h2>
        </div>
        <div style={S.body}>
          {STEPS[step].body}
        </div>
        <div style={S.dots}>
          {STEPS.map((_, i) => (
            <div key={i} style={S.dot(i === step)} />
          ))}
        </div>
        <div style={S.actions}>
          <button style={S.skip} onClick={onDone}>Skip tour</button>
          <button style={S.next} onClick={next}>
            {isLast ? "Get started" : "Next"}
          </button>
        </div>
      </div>
    </div>
  );
}
