"use client";

import Link from "next/link";
import { useState } from "react";
import { Modal } from "./Modal";

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
      "Add your company name, phone, and address so quotes look professional when you send them.",
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
  const [currentStep, setCurrentStep] = useState(0);
  const step = steps[currentStep];
  const isLast = currentStep === steps.length - 1;

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
        </div>

        {"action" in step && step.action ? (
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

        <button
          className="onboarding__skip"
          type="button"
          onClick={handleSkip}
        >
          Skip setup
        </button>
      </div>
    </Modal>
  );
}
