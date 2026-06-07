"use client";

import { FormEvent, useState } from "react";
import { Modal } from "../Modal";
import { useRegion } from "../../hooks/useRegion";

type CustomerCreateModalProps = {
  open: boolean;
  onClose: () => void;
  onCreated: () => void;
};

type FormData = {
  name: string;
  email: string;
  phone: string;
  company: string;
  address: string;
  city: string;
  state: string;
  zip: string;
};

type FormErrors = Partial<Record<keyof FormData, string>>;

const initialForm: FormData = {
  name: "",
  email: "",
  phone: "",
  company: "",
  address: "",
  city: "",
  state: "",
  zip: "",
};

function validate(data: FormData): FormErrors {
  const errors: FormErrors = {};

  if (!data.name.trim()) {
    errors.name = "Name is required.";
  }

  if (!data.email.trim() && !data.phone.trim()) {
    errors.email = "Email or phone is required.";
  } else if (data.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
    errors.email = "Enter a valid email address.";
  }

  return errors;
}

async function readErrorMessage(response: Response) {
  try {
    const json = await response.json();
    const error = json?.error;
    if (typeof error === "string") return error;
    if (error && typeof error.message === "string") return error.message;
    if (typeof json?.message === "string") return json.message;
    return "Failed to create customer.";
  } catch {
    return "Failed to create customer.";
  }
}

export function CustomerCreateModal({
  open,
  onClose,
  onCreated,
}: CustomerCreateModalProps) {
  const { postalLabel } = useRegion();
  const [form, setForm] = useState<FormData>(initialForm);
  const [errors, setErrors] = useState<FormErrors>({});
  const [apiError, setApiError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  function handleChange(field: keyof FormData, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setApiError("");

    const nextErrors = validate(form);
    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) return;

    setIsSubmitting(true);

    try {
      const token = window.localStorage.getItem("quotecraft_token");
      const body: Record<string, string> = {};

      for (const [key, value] of Object.entries(form)) {
        if (value.trim()) {
          body[key] = value.trim();
        }
      }

      const response = await fetch("/api/customers/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        throw new Error(await readErrorMessage(response));
      }

      setForm(initialForm);
      onCreated();
      onClose();
    } catch (error) {
      setApiError(
        error instanceof Error
          ? error.message
          : "Unable to create customer.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  function handleClose() {
    setForm(initialForm);
    setErrors({});
    setApiError("");
    onClose();
  }

  const fields: { key: keyof FormData; label: string; type: string; required?: boolean; autoComplete?: string; hint?: string; large?: boolean }[] = [
    { key: "name", label: "Name", type: "text", required: true, autoComplete: "name", large: true },
    { key: "email", label: "Email", type: "email", autoComplete: "email", hint: "Email or phone required" },
    { key: "phone", label: "Phone", type: "tel", autoComplete: "tel", hint: "Email or phone required" },
    { key: "company", label: "Company", type: "text", autoComplete: "organization" },
    { key: "address", label: "Address", type: "text", autoComplete: "street-address" },
    { key: "city", label: "City", type: "text", autoComplete: "address-level2" },
    { key: "state", label: "State", type: "text", autoComplete: "address-level1" },
    { key: "zip", label: "ZIP code", type: "text", autoComplete: "postal-code" },
  ];

  return (
    <Modal open={open} onClose={handleClose} title="New customer">
      <form className="modal-dialog__form" onSubmit={handleSubmit} noValidate>
        <div className="modal-dialog__fields">
          {fields.map((field) => (
            <div className={`field${field.large ? " field--large" : ""}`} key={field.key}>
              <label htmlFor={`create-${field.key}`}>
                {field.key === "zip" ? postalLabel : field.key === "state" ? "State/Province" : field.label}
                {field.required ? " *" : field.key === "company" ? " (optional)" : null}
              </label>
              <input
                id={`create-${field.key}`}
                name={field.key}
                type={field.type}
                autoComplete={field.autoComplete ?? "off"}
                placeholder={field.hint}
                value={form[field.key]}
                onChange={(e) => handleChange(field.key, e.target.value)}
                aria-invalid={Boolean(errors[field.key])}
                aria-describedby={
                  errors[field.key] ? `create-${field.key}-error` : undefined
                }
              />
              {errors[field.key] ? (
                <p
                  className="field__error"
                  id={`create-${field.key}-error`}
                >
                  {errors[field.key]}
                </p>
              ) : null}
            </div>
          ))}
        </div>

        {apiError ? (
          <div className="auth-form__error" role="alert">
            {apiError}
          </div>
        ) : null}

        <div className="modal-dialog__actions">
          <button
            className="button button--secondary"
            type="button"
            onClick={handleClose}
          >
            Cancel
          </button>
          <button
            className="button button--primary"
            type="submit"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Creating..." : "Create customer"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
