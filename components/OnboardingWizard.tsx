"use client";

import Link from "next/link";
import { useState } from "react";
import { Modal } from "./Modal";
import { useRegion } from "../hooks/useRegion";

type OnboardingWizardProps = {
  open: boolean;
  onComplete: () => void;
  onDismiss: () => void;
};

const steps = [
  { id: "welcome", title: "Welcome to JobStacker", description: "You're all set up. Let's get you started with your first customer and quote." },
  { id: "customer", title: "Add your first customer", description: "Create a customer record so you can start drafting quotes.", action: { label: "New customer", href: "/customers" } },
  { id: "quote", title: "Create your first quote", description: "Draft a professional quote with line items, tax, and AI pricing.", action: { label: "New quote", href: "/quotes/new" } },
  { id: "services", title: "Describe your services", description: "Tell us what services you offer. The AI uses this to generate accurate quotes for you." },
  { id: "tax", title: "Set your default tax rate", description: "This percentage gets applied to every new quote. You can change it per quote." },
  { id: "profile", title: "Set up your company profile", description: "Your company details appear on every quote PDF you send to customers." },
  { id: "done", title: "You're ready to go", description: "You've completed the setup. Explore the dashboard to manage your workflow." },
];

export function OnboardingWizard({ open, onComplete, onDismiss }: OnboardingWizardProps) {
  const { postalLabel } = useRegion();
  const [currentStep, setCurrentStep] = useState(0);
  const [saving, setSaving] = useState(false);
  const [serviceText, setServiceText] = useState("");
  const [defaultTaxRate, setDefaultTaxRate] = useState(0);
  const [companyForm, setCompanyForm] = useState({ companyName: "", phone: "", address: "", city: "", state: "", zip: "" });

  const step = steps[currentStep];
  const isLast = currentStep === steps.length - 1;
  const isFormStep = step.id === "profile" || step.id === "services" || step.id === "tax";

  async function handleSave() {
    setSaving(true);
    try {
      const token = window.localStorage.getItem("jobstacker_token");
      const body: Record<string, string | number> = {};

      if (step.id === "profile") {
        for (const [key, value] of Object.entries(companyForm)) {
          if (value.trim()) body[key] = value.trim();
        }
      } else if (step.id === "services") {
        if (serviceText.trim()) body.customAiInstructions = serviceText.trim();
      } else if (step.id === "tax") {
        if (defaultTaxRate > 0 && defaultTaxRate <= 100) body.defaultTaxRate = defaultTaxRate;
      }

      if (Object.keys(body).length > 0) {
        await fetch("/api/profile", {
          method: "PUT", headers: { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}) },
          body: JSON.stringify(body),
        });
      }
      setCurrentStep((s) => s + 1);
    } catch {
      setCurrentStep((s) => s + 1);
    } finally {
      setSaving(false);
    }
  }

  function handleNext() { setCurrentStep((s) => s + 1); }
  function handleSkip() { onDismiss(); }
  function handleFinish() { onComplete(); }

  if (!open) return null;

  return (
    <Modal open={open} onClose={handleSkip} title="">
      <div className="onboarding">
        <div className="onboarding__steps">
          {steps.map((s, i) => (
            <div key={s.id} className={`onboarding__dot ${i === currentStep ? "onboarding__dot--active" : ""} ${i < currentStep ? "onboarding__dot--done" : ""}`} />
          ))}
        </div>

        <div className="onboarding__body">
          <h2 className="onboarding__title">{step.title}</h2>
          <p className="onboarding__desc">{step.description}</p>

          {isFormStep ? (
            <div style={{ marginTop: 20 }}>
              {step.id === "services" ? (
                <div className="field" style={{ marginBottom: 12 }}>
                  <label htmlFor="wiz-services">Describe your services (one per line)</label>
                  <textarea id="wiz-services" value={serviceText} onChange={(e) => setServiceText(e.target.value)}
                    placeholder={"Landscaping — £450 per garden\nTree trimming — £150 per hour\nPatio cleaning — £5 per m²"}
                    style={{ border: "1px solid var(--border-strong)", borderRadius: 8, color: "var(--text)", minHeight: 120, outline: "none", padding: "10px 12px", width: "100%", font: "inherit", resize: "vertical" }} />
                </div>
              ) : null}

              {step.id === "tax" ? (
                <div className="field" style={{ marginBottom: 12 }}>
                  <label htmlFor="wiz-tax">Default tax rate (%)</label>
                  <input id="wiz-tax" type="number" min="0" max="100" step="0.1" value={defaultTaxRate}
                    onChange={(e) => setDefaultTaxRate(Number(e.target.value) || 0)} className="line-items__input" style={{ minHeight: 42, width: 120 }} />
                </div>
              ) : null}

              {step.id === "profile" ? (
                <>
                  <div className="field" style={{ marginBottom: 12 }}>
                    <label htmlFor="wiz-company">Company name</label>
                    <input id="wiz-company" type="text" autoComplete="organization" value={companyForm.companyName}
                      onChange={(e) => setCompanyForm((p) => ({ ...p, companyName: e.target.value }))} className="line-items__input" style={{ minHeight: 42 }} placeholder="Your business name" />
                  </div>
                  <div className="field" style={{ marginBottom: 12 }}>
                    <label htmlFor="wiz-phone">Phone</label>
                    <input id="wiz-phone" type="tel" autoComplete="tel" value={companyForm.phone}
                      onChange={(e) => setCompanyForm((p) => ({ ...p, phone: e.target.value }))} className="line-items__input" style={{ minHeight: 42 }} />
                  </div>
                  <div className="field" style={{ marginBottom: 12 }}>
                    <label htmlFor="wiz-address">Address</label>
                    <input id="wiz-address" type="text" autoComplete="street-address" value={companyForm.address}
                      onChange={(e) => setCompanyForm((p) => ({ ...p, address: e.target.value }))} className="line-items__input" style={{ minHeight: 42 }} />
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                    <div className="field">
                      <label htmlFor="wiz-city">City</label>
                      <input id="wiz-city" type="text" autoComplete="address-level2" value={companyForm.city}
                        onChange={(e) => setCompanyForm((p) => ({ ...p, city: e.target.value }))} className="line-items__input" style={{ minHeight: 42 }} />
                    </div>
                    <div className="field">
                      <label htmlFor="wiz-state">State/Province</label>
                      <input id="wiz-state" type="text" autoComplete="address-level1" value={companyForm.state}
                        onChange={(e) => setCompanyForm((p) => ({ ...p, state: e.target.value }))} className="line-items__input" style={{ minHeight: 42 }} />
                    </div>
                  </div>
                  <div className="field" style={{ marginBottom: 12 }}>
                    <label htmlFor="wiz-zip">{postalLabel}</label>
                    <input id="wiz-zip" type="text" autoComplete="postal-code" value={companyForm.zip}
                      onChange={(e) => setCompanyForm((p) => ({ ...p, zip: e.target.value }))} className="line-items__input" style={{ minHeight: 42 }} />
                  </div>
                </>
              ) : null}
            </div>
          ) : null}
        </div>

        {isFormStep ? (
          <>
            <button className="button button--primary" type="button" onClick={handleSave} disabled={saving} style={{ width: "100%", justifyContent: "center" }}>
              {saving ? "Saving..." : "Save & continue"}
            </button>
            <button className="onboarding__skip" type="button" onClick={handleNext}>Skip for now</button>
          </>
        ) : "action" in step && step.action ? (
          <Link className="button button--primary" href={step.action.href} onClick={handleNext} style={{ width: "100%", justifyContent: "center" }}>
            {step.action.label}
          </Link>
        ) : isLast ? (
          <button className="button button--primary" type="button" onClick={handleFinish} style={{ width: "100%", justifyContent: "center" }}>
            Go to dashboard
          </button>
        ) : (
          <button className="button button--primary" type="button" onClick={handleNext} style={{ width: "100%", justifyContent: "center" }}>
            Next
          </button>
        )}

        {!isFormStep ? (
          <button className="onboarding__skip" type="button" onClick={handleSkip}>Skip setup</button>
        ) : null}
      </div>
    </Modal>
  );
}
