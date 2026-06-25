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
  {
    id: "welcome",
    title: "Welcome to JobStacker",
    description:
      "You're all set up. Let's get you started with your first customer and quote.",
  },
  {
    id: "customer",
    title: "Add your first customer",
    description:
      "Create a customer record so you can start drafting quotes. You'll need their name and email to begin.",
    action: { label: "New customer", href: "/customers" },
  },
  {
    id: "quote",
    title: "Create your first quote",
    description:
      "Draft a professional quote for your customer. You can add line items, set tax rates, and preview before sending.",
    action: { label: "New quote", href: "/quotes/new" },
  },
  {
    id: "profile",
    title: "Set up your company profile",
    description:
      "Add your company details so they appear on every quote PDF you send to customers.",
    action: { label: "Go to settings", href: "/settings" },
  },
  {
    id: "done",
    title: "You're ready to go",
    description:
      "You've completed the setup. Explore the dashboard to track customers, quotes, and manage your workflow.",
  },
];

export function OnboardingWizard({
  open,
  onComplete,
  onDismiss,
}: OnboardingWizardProps) {
  const { postalLabel } = useRegion();
  const [currentStep, setCurrentStep] = useState(0);
  const [saving, setSaving] = useState(false);
  const [companyForm, setCompanyForm] = useState({
    companyName: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    zip: "",
  });

  const step = steps[currentStep];
  const isLast = currentStep === steps.length - 1;
  const isProfileStep = step.id === "profile";

  function handleNext() {
    if (isLast) {
      onComplete();
    } else {
      setCurrentStep((prev) => prev + 1);
    }
  }

  function handleSkip() {
    onDismiss();
  }

  async function handleSaveProfile() {
    setSaving(true);
    try {
      const token = window.localStorage.getItem("jobstacker_token");
      const body: Record<string, string> = {};
      for (const [key, value] of Object.entries(companyForm)) {
        if (value.trim()) body[key] = value.trim();
      }
      if (Object.keys(body).length > 0) {
        await fetch("/api/profile", {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          body: JSON.stringify(body),
        });
      }
      handleNext();
    } catch {
      handleNext();
    } finally {
      setSaving(false);
    }
  }

  if (!open) return null;

  return (
    <Modal open={open} onClose={handleSkip} title="">
      <div className="onboarding">
        <div className="onboarding__steps">
          {steps.map((s, i) => (
            <div
              key={s.id}
              className={`onboarding__dot ${i === currentStep ? "onboarding__dot--active" : ""} ${i < currentStep ? "onboarding__dot--done" : ""}`}
            />
          ))}
        </div>

        <div className="onboarding__body">
          <h2 className="onboarding__title">{step.title}</h2>
          <p className="onboarding__desc">{step.description}</p>

          {isProfileStep ? (
            <div style={{ marginTop: 20 }}>
              <div className="field" style={{ marginBottom: 12 }}>
                <label htmlFor="wiz-company">Company name</label>
                <input
                  id="wiz-company"
                  type="text"
                  autoComplete="organization"
                  value={companyForm.companyName}
                  onChange={(e) => setCompanyForm((p) => ({ ...p, companyName: e.target.value }))}
                  className="line-items__input"
                  style={{ minHeight: 42 }}
                  placeholder="Your business name"
                />
              </div>
              <div className="field" style={{ marginBottom: 12 }}>
                <label htmlFor="wiz-phone">Phone</label>
                <input
                  id="wiz-phone"
                  type="tel"
                  autoComplete="tel"
                  value={companyForm.phone}
                  onChange={(e) => setCompanyForm((p) => ({ ...p, phone: e.target.value }))}
                  className="line-items__input"
                  style={{ minHeight: 42 }}
                />
              </div>
              <div className="field" style={{ marginBottom: 12 }}>
                <label htmlFor="wiz-address">Address</label>
                <input
                  id="wiz-address"
                  type="text"
                  autoComplete="street-address"
                  value={companyForm.address}
                  onChange={(e) => setCompanyForm((p) => ({ ...p, address: e.target.value }))}
                  className="line-items__input"
                  style={{ minHeight: 42 }}
                />
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div className="field">
                  <label htmlFor="wiz-city">City</label>
                  <input
                    id="wiz-city"
                    type="text"
                    autoComplete="address-level2"
                    value={companyForm.city}
                    onChange={(e) => setCompanyForm((p) => ({ ...p, city: e.target.value }))}
                    className="line-items__input"
                    style={{ minHeight: 42 }}
                  />
                </div>
                <div className="field">
                  <label htmlFor="wiz-state">State/Province</label>
                  <input
                    id="wiz-state"
                    type="text"
                    autoComplete="address-level1"
                    value={companyForm.state}
                    onChange={(e) => setCompanyForm((p) => ({ ...p, state: e.target.value }))}
                    className="line-items__input"
                    style={{ minHeight: 42 }}
                  />
                </div>
              </div>
              <div className="field" style={{ marginBottom: 12 }}>
                <label htmlFor="wiz-zip">{postalLabel}</label>
                <input
                  id="wiz-zip"
                  type="text"
                  autoComplete="postal-code"
                  value={companyForm.zip}
                  onChange={(e) => setCompanyForm((p) => ({ ...p, zip: e.target.value }))}
                  className="line-items__input"
                  style={{ minHeight: 42 }}
                />
              </div>
            </div>
          ) : null}
        </div>

        {isProfileStep ? (
          <>
            <button
              className="button button--primary"
              type="button"
              onClick={handleSaveProfile}
              disabled={saving}
              style={{ width: "100%", justifyContent: "center" }}
            >
              {saving ? "Saving..." : "Save & continue"}
            </button>
            <button
              className="onboarding__skip"
              type="button"
              onClick={handleNext}
            >
              Skip for now
            </button>
          </>
        ) : "action" in step && step.action ? (
          <Link
            className="button button--primary"
            href={step.action.href}
            onClick={handleNext}
            style={{ width: "100%", justifyContent: "center" }}
          >
            {step.action.label}
          </Link>
        ) : isLast ? (
          <button
            className="button button--primary"
            type="button"
            onClick={handleNext}
            style={{ width: "100%", justifyContent: "center" }}
          >
            Go to dashboard
          </button>
        ) : (
          <button
            className="button button--primary"
            type="button"
            onClick={handleNext}
            style={{ width: "100%", justifyContent: "center" }}
          >
            Next
          </button>
        )}

        {!isProfileStep ? (
          <button
            className="onboarding__skip"
            type="button"
            onClick={handleSkip}
          >
            Skip setup
          </button>
        ) : null}
      </div>
    </Modal>
  );
}
