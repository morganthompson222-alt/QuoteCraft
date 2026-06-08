"use client";

import { FormEvent, useEffect, useState } from "react";
import { Modal } from "../Modal";
import { useRegion } from "../../hooks/useRegion";

type CustomerEditModalProps = {
  open: boolean;
  customerId: string | null;
  onClose: () => void;
  onUpdated: () => void;
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
  notes: string;
};

type FormErrors = Partial<Record<keyof FormData, string>>;

type LoadState =
  | { status: "loading" }
  | { status: "error"; error: string }
  | { status: "loaded" };

const initialForm: FormData = {
  name: "",
  email: "",
  phone: "",
  company: "",
  address: "",
  city: "",
  state: "",
  zip: "",
  notes: "",
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
    return "Operation failed.";
  } catch {
    return "Operation failed.";
  }
}

export function CustomerEditModal({
  open,
  customerId,
  onClose,
  onUpdated,
}: CustomerEditModalProps) {
  const { postalLabel } = useRegion();
  const [form, setForm] = useState<FormData>(initialForm);
  const [loadState, setLoadState] = useState<LoadState>({ status: "loading" });
  const [errors, setErrors] = useState<FormErrors>({});
  const [apiError, setApiError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!open || !customerId) return;

    let isCurrent = true;

    async function loadCustomer() {
      setLoadState({ status: "loading" });
      setErrors({});
      setApiError("");

      try {
        const token = window.localStorage.getItem("jobstacker_token");
        const response = await fetch(`/api/customers/${customerId}`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });

        if (!response.ok) {
          throw new Error(await readErrorMessage(response));
        }

        const data = (await response.json()) as FormData & {
          id: string;
          createdAt: string;
        };

        if (isCurrent) {
          setForm({
            name: data.name ?? "",
            email: data.email ?? "",
            phone: data.phone ?? "",
            company: data.company ?? "",
            address: data.address ?? "",
            city: data.city ?? "",
            state: data.state ?? "",
            zip: data.zip ?? "",
            notes: data.notes ?? "",
          });
          setLoadState({ status: "loaded" });
        }
      } catch (error) {
        if (isCurrent) {
          setLoadState({
            status: "error",
            error:
              error instanceof Error
                ? error.message
                : "Unable to load customer.",
          });
        }
      }
    }

    loadCustomer();

    return () => {
      isCurrent = false;
    };
  }, [open, customerId]);

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
      const token = window.localStorage.getItem("jobstacker_token");
      const body: Record<string, string> = {};

      for (const [key, value] of Object.entries(form)) {
        if (value.trim()) {
          body[key] = value.trim();
        }
      }

      const response = await fetch(`/api/customers/${customerId}/update`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        throw new Error(await readErrorMessage(response));
      }

      onUpdated();
      handleClose();
    } catch (error) {
      setApiError(
        error instanceof Error
          ? error.message
          : "Unable to update customer.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  function handleClose() {
    setForm(initialForm);
    setErrors({});
    setApiError("");
    setLoadState({ status: "loading" });
    onClose();
  }

  const fields: { key: keyof FormData; label: string; type: string; required?: boolean; autoComplete?: string }[] = [
    { key: "name", label: "Name", type: "text", required: true, autoComplete: "name" },
    { key: "email", label: "Email", type: "email", autoComplete: "email" },
    { key: "phone", label: "Phone", type: "tel", autoComplete: "tel" },
    { key: "company", label: "Company", type: "text", autoComplete: "organization" },
    { key: "address", label: "Address", type: "text", autoComplete: "street-address" },
    { key: "city", label: "City", type: "text", autoComplete: "address-level2" },
    { key: "state", label: "State", type: "text", autoComplete: "address-level1" },
    { key: "zip", label: "ZIP code", type: "text", autoComplete: "postal-code" },
    { key: "notes", label: "Notes", type: "text" },
  ];

  return (
    <Modal open={open} onClose={handleClose} title="Edit customer">
      {loadState.status === "loading" ? (
        <div className="modal-dialog__form">
          <p style={{ color: "var(--text-muted)", textAlign: "center", padding: "32px 0" }}>
            Loading customer details...
          </p>
        </div>
      ) : loadState.status === "error" ? (
        <div className="modal-dialog__form">
          <div className="auth-form__error" role="alert">
            {loadState.error}
          </div>
          <div className="modal-dialog__actions">
            <button className="button button--secondary" type="button" onClick={handleClose}>
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <form className="modal-dialog__form" onSubmit={handleSubmit} noValidate>
          <div className="modal-dialog__fields">
            {fields.map((field) => (
              <div className="field" key={field.key}>
                <label htmlFor={`edit-${field.key}`}>
                  {field.key === "zip" ? postalLabel : field.key === "state" ? "State/Province" : field.label}
                  {field.required ? " *" : null}
                </label>
                {field.key === "notes" ? (
                  <textarea
                    id={`edit-${field.key}`}
                    name={field.key}
                    value={form[field.key]}
                    onChange={(e) => handleChange(field.key, e.target.value)}
                    style={{
                      border: "1px solid var(--border-strong)",
                      borderRadius: 8,
                      color: "var(--text)",
                      minHeight: 80,
                      outline: "none",
                      padding: "10px 12px",
                      width: "100%",
                      font: "inherit",
                      resize: "vertical",
                    }}
                  />
                ) : (
                  <input
                    id={`edit-${field.key}`}
                    name={field.key}
                    type={field.type}
                    autoComplete={field.autoComplete ?? "off"}
                    value={form[field.key]}
                    onChange={(e) => handleChange(field.key, e.target.value)}
                    aria-invalid={Boolean(errors[field.key])}
                    aria-describedby={
                      errors[field.key] ? `edit-${field.key}-error` : undefined
                    }
                  />
                )}
                {errors[field.key] ? (
                  <p className="field__error" id={`edit-${field.key}-error`}>
                    {errors[field.key]}
                  </p>
                ) : null}
              </div>
            ))}
          </div>

          {apiError ? (
            <div className="auth-form__error" role="alert" style={{ marginTop: 16 }}>
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
              {isSubmitting ? "Saving..." : "Save changes"}
            </button>
          </div>
        </form>
      )}
    </Modal>
  );
}
