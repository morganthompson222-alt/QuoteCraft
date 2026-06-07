"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useRegion } from "../../hooks/useRegion";

type Customer = {
  id: string;
  name: string;
  email: string;
};

type LineItem = {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
};

type AiMaterial = {
  name: string;
  quantity: number;
  unitPrice: number;
};

type AiResult = {
  description: string;
  materials: AiMaterial[];
  labourCost: number;
  total: number;
};

type FormErrors = {
  customerId?: string;
  items?: string;
  [key: `item_${string}_description`]: string | undefined;
  [key: `item_${string}_quantity`]: string | undefined;
  [key: `item_${string}_unitPrice`]: string | undefined;
};

type AiState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "error"; error: string }
  | { status: "success"; data: AiResult };

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

function generateId() {
  return Math.random().toString(36).substring(2, 9);
}

export function QuoteBuilderPage() {
  const router = useRouter();
  const { formatCurrency } = useRegion();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [customersLoading, setCustomersLoading] = useState(true);
  const [customerId, setCustomerId] = useState("");
  const [items, setItems] = useState<LineItem[]>([
    { id: generateId(), description: "", quantity: 1, unitPrice: 0 },
  ]);
  const [taxRate, setTaxRate] = useState(0);
  const [notes, setNotes] = useState("");
  const [validUntil, setValidUntil] = useState("");
  const [errors, setErrors] = useState<FormErrors>({});
  const [apiError, setApiError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [aiInput, setAiInput] = useState("");
  const [aiState, setAiState] = useState<AiState>({ status: "idle" });

  useEffect(() => {
    let isCurrent = true;

    async function loadCustomers() {
      setCustomersLoading(true);
      try {
        const token = window.localStorage.getItem("quotecraft_token");
        const response = await fetch("/api/customers/list?page=1&limit=100", {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });

        if (response.ok) {
          const data = (await response.json()) as { customers: Customer[] };
          if (isCurrent) setCustomers(data.customers);
        }
      } catch {
        // silently fail
      } finally {
        if (isCurrent) setCustomersLoading(false);
      }
    }

    loadCustomers();
    return () => { isCurrent = false; };
  }, []);

  function addItem() {
    setItems((prev) => [
      ...prev,
      { id: generateId(), description: "", quantity: 1, unitPrice: 0 },
    ]);
  }

  function removeItem(id: string) {
    if (items.length <= 1) return;
    setItems((prev) => prev.filter((item) => item.id !== id));
  }

  function updateItem(id: string, field: keyof LineItem, value: string | number) {
    setItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, [field]: field === "description" ? (value as string) : Number(value) || 0 } : item,
      ),
    );
  }

  const subtotal = items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
  const taxAmount = subtotal * (taxRate / 100);
  const totalAmt = subtotal + taxAmount;

  function validate(): boolean {
    const nextErrors: FormErrors = {};

    if (!customerId) {
      nextErrors.customerId = "Select a customer.";
    }

    const hasItem = items.some((item) => item.description.trim().length > 0);
    if (!hasItem) {
      nextErrors.items = "Add at least one line item with a description.";
    }

    for (const item of items) {
      if (item.description.trim() && (item.quantity <= 0 || item.unitPrice <= 0)) {
        if (item.quantity <= 0) {
          (nextErrors as Record<string, string>)[`item_${item.id}_quantity`] = "Must be > 0";
        }
        if (item.unitPrice <= 0) {
          (nextErrors as Record<string, string>)[`item_${item.id}_unitPrice`] = "Must be > 0";
        }
      }
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setApiError("");

    if (!validate()) return;

    setIsSubmitting(true);

    try {
      const token = window.localStorage.getItem("quotecraft_token");
      const body = {
        customerId,
        items: items
          .filter((item) => item.description.trim())
          .map((item) => ({
            description: item.description.trim(),
            quantity: item.quantity,
            unitPrice: item.unitPrice,
          })),
        taxRate: taxRate || undefined,
        notes: notes.trim() || undefined,
        validUntil: validUntil || undefined,
      };

      const response = await fetch("/api/quotes/create", {
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

      const result = (await response.json()) as { id: string };
      router.push(`/quotes/${result.id}`);
    } catch (error) {
      setApiError(
        error instanceof Error ? error.message : "Unable to create quote.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleAiGenerate() {
    if (!aiInput.trim()) return;

    setAiState({ status: "loading" });

    try {
      const token = window.localStorage.getItem("quotecraft_token");
      const response = await fetch("/api/ai/generate-quote", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ input: aiInput.trim() }),
      });

      if (response.status === 429) {
        const retryAfter = response.headers.get("Retry-After");
        const msg = retryAfter
          ? `Rate limit reached. Try again in ${retryAfter} second${retryAfter === "1" ? "" : "s"}.`
          : "Rate limit reached. Please wait before generating another quote.";
        setAiState({ status: "error", error: msg });
        return;
      }

      if (!response.ok) {
        throw new Error(await readErrorMessage(response));
      }

      const data = (await response.json()) as AiResult;
      setAiState({ status: "success", data });
    } catch (error) {
      setAiState({
        status: "error",
        error: error instanceof Error ? error.message : "AI generation failed.",
      });
    }
  }

  function applyAiResult() {
    if (aiState.status !== "success") return;

    const aiItems: LineItem[] = aiState.data.materials.map((m) => ({
      id: generateId(),
      description: m.name,
      quantity: m.quantity,
      unitPrice: m.unitPrice,
    }));

    if (aiState.data.labourCost > 0) {
      aiItems.push({
        id: generateId(),
        description: "Labour",
        quantity: 1,
        unitPrice: aiState.data.labourCost,
      });
    }

    if (aiItems.length > 0) {
      setItems(aiItems);
    }

    setNotes((prev) =>
      [aiState.data.description, prev].filter(Boolean).join("\n\n"),
    );

    setAiState({ status: "idle" });
    setAiInput("");
  }

  return (
    <section className="workspace-page">
      <div className="workspace-page__header">
        <div>
          <p className="workspace-page__eyebrow">Quotes</p>
          <h1>New quote</h1>
          <p>Fill in the customer details and line items to create a quote.</p>
        </div>
      </div>

      <div className="table-card">
        <h2 className="bp-section__title">
          Generate with AI
          <span style={{ color: "var(--text-muted)", fontSize: 13, fontWeight: 650 }}>
            Powered by GPT-4o
          </span>
        </h2>
        <div className="bp-section__body">
          <div className="field">
            <label htmlFor="ai-input">Describe the job in natural language</label>
            <textarea
              id="ai-input"
              className="bp-textarea"
              placeholder='e.g. "Replace a leaking hot water cylinder in a 3-bedroom house, including new copper piping and pressure relief valve install"'
              value={aiInput}
              onChange={(e) => setAiInput(e.target.value)}
              style={{ minHeight: 80 }}
            />
          </div>

          <div className="ai-toolbar">
            <button
              className="button button--primary"
              type="button"
              disabled={aiState.status === "loading" || !aiInput.trim()}
              onClick={handleAiGenerate}
            >
              {aiState.status === "loading" ? "Generating..." : "Generate quote"}
            </button>
            {aiState.status === "success" ? (
              <button
                className="button button--secondary"
                type="button"
                onClick={applyAiResult}
              >
                Apply to form
              </button>
            ) : null}
          </div>

          {aiState.status === "loading" ? (
            <div className="ai-loading" aria-busy="true">
              <div className="ai-loading__spinner" />
              <span>AI is drafting your quote...</span>
            </div>
          ) : null}

          {aiState.status === "error" ? (
            <div className="auth-form__error" role="alert" style={{ marginTop: 12 }}>
              {aiState.error}
            </div>
          ) : null}

          {aiState.status === "success" ? (
            <div className="ai-result">
              <p className="ai-result__desc">{aiState.data.description}</p>
              <div className="ai-result__items">
                <div className="ai-result__items-head">
                  <span>Item</span>
                  <span>Qty</span>
                  <span>Unit price</span>
                  <span>Amount</span>
                </div>
                {aiState.data.materials.map((m, i) => (
                  <div className="ai-result__items-row" key={i}>
                    <span>{m.name}</span>
                    <span>{m.quantity}</span>
                    <span>{formatCurrency(m.unitPrice)}</span>
                    <span>{formatCurrency(m.quantity * m.unitPrice)}</span>
                  </div>
                ))}
                {aiState.data.labourCost > 0 ? (
                  <div className="ai-result__items-row">
                    <span>Labour</span>
                    <span>1</span>
                    <span>{formatCurrency(aiState.data.labourCost)}</span>
                    <span>{formatCurrency(aiState.data.labourCost)}</span>
                  </div>
                ) : null}
              </div>
              <div className="ai-result__total">
                <span>Estimated total</span>
                <strong>{formatCurrency(aiState.data.total)}</strong>
              </div>
            </div>
          ) : null}
        </div>
      </div>

      <form className="quote-builder" onSubmit={handleSubmit} noValidate>
        <div className="table-card">
          <h2 className="bp-section__title">Customer</h2>
          <div className="bp-section__body">
            <div className="field">
              <label htmlFor="quote-customer">Customer *</label>
              {customersLoading ? (
                <p style={{ color: "var(--text-muted)", fontSize: 14, margin: "8px 0", padding: "10px 0" }}>
                  Loading customers...
                </p>
              ) : (
                <select
                  id="quote-customer"
                  className="filter-select"
                  style={{ width: "100%", maxWidth: 400 }}
                  value={customerId}
                  onChange={(e) => {
                    setCustomerId(e.target.value);
                    if (errors.customerId) {
                      setErrors((prev) => {
                        const next = { ...prev };
                        delete next.customerId;
                        return next;
                      });
                    }
                  }}
                  aria-invalid={Boolean(errors.customerId)}
                >
                  <option value="">Select a customer</option>
                  {customers.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} — {c.email}
                    </option>
                  ))}
                </select>
              )}
              {errors.customerId ? (
                <p className="field__error">{errors.customerId}</p>
              ) : null}
              {!customersLoading && customers.length === 0 ? (
                <p style={{ color: "var(--text-muted)", fontSize: 13, marginTop: 6 }}>
                  No customers found.{" "}
                  <a href="/customers" style={{ color: "var(--brand)", fontWeight: 750 }}>
                    Create one first
                  </a>.
                </p>
              ) : null}
            </div>
          </div>
        </div>

        <div className="table-card">
          <h2 className="bp-section__title">
            Line items
            <button className="button button--ghost" type="button" onClick={addItem} style={{ fontSize: 13, minHeight: 34 }}>
              + Add item
            </button>
          </h2>
          <div className="bp-section__body">
            {errors.items ? (
              <p className="field__error" style={{ marginBottom: 12 }}>{errors.items}</p>
            ) : null}
            <div className="line-items">
              <div className="line-items__head">
                <span>Description</span>
                <span>Qty</span>
                <span>Unit price</span>
                <span>Amount</span>
                <span></span>
              </div>
              {items.map((item) => (
                <div className="line-items__row" key={item.id}>
                  <input
                    className="line-items__input"
                    type="text"
                    placeholder="Item description"
                    value={item.description}
                    onChange={(e) => updateItem(item.id, "description", e.target.value)}
                    aria-invalid={Boolean(item.description.trim() && item.quantity <= 0 && errors[`item_${item.id}_quantity`])}
                  />
                  <input
                    className="line-items__input line-items__input--narrow"
                    type="number"
                    min="0"
                    step="1"
                    value={item.quantity}
                    onChange={(e) => updateItem(item.id, "quantity", e.target.value)}
                    aria-invalid={Boolean(item.description.trim() && item.quantity <= 0 && errors[`item_${item.id}_quantity`])}
                  />
                  <input
                    className="line-items__input line-items__input--narrow"
                    type="number"
                    min="0"
                    step="0.01"
                    value={item.unitPrice}
                    onChange={(e) => updateItem(item.id, "unitPrice", e.target.value)}
                    aria-invalid={Boolean(item.description.trim() && item.unitPrice <= 0 && errors[`item_${item.id}_unitPrice`])}
                  />
                  <span className="line-items__amount">
                    {formatCurrency(item.quantity * item.unitPrice)}
                  </span>
                  <button
                    className="line-items__remove"
                    type="button"
                    disabled={items.length <= 1}
                    onClick={() => removeItem(item.id)}
                    aria-label="Remove item"
                  >
                    &times;
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="table-card">
          <h2 className="bp-section__title">Totals</h2>
          <div className="bp-section__body">
            <div className="totals-grid">
              <div className="totals-grid__row">
                <span>Subtotal</span>
                <span>{formatCurrency(subtotal)}</span>
              </div>
              <div className="totals-grid__row">
                <div className="field" style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                  <label htmlFor="tax-rate" style={{ whiteSpace: "nowrap", margin: 0 }}>Tax rate (%)</label>
                  <input
                    id="tax-rate"
                    className="line-items__input line-items__input--narrow"
                    type="number"
                    min="0"
                    max="100"
                    step="0.1"
                    value={taxRate}
                    onChange={(e) => setTaxRate(Number(e.target.value) || 0)}
                    style={{ width: 80, minHeight: 36 }}
                  />
                </div>
                <span>{formatCurrency(taxAmount)}</span>
              </div>
              <div className="totals-grid__row totals-grid__row--total">
                <span>Total</span>
                <span>{formatCurrency(totalAmt)}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="table-card">
          <h2 className="bp-section__title">Additional details</h2>
          <div className="bp-section__body bp-section__body--cols">
            <div className="field">
              <label htmlFor="quote-notes">Notes</label>
              <textarea
                id="quote-notes"
                className="bp-textarea"
                placeholder="Payment terms, scope notes, etc."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>
            <div className="field">
              <label htmlFor="quote-valid">Valid until</label>
              <input
                id="quote-valid"
                className="line-items__input"
                type="date"
                value={validUntil}
                onChange={(e) => setValidUntil(e.target.value)}
                style={{ minHeight: 42 }}
              />
            </div>
          </div>
        </div>

        {apiError ? (
          <div className="auth-form__error" role="alert">
            {apiError}
          </div>
        ) : null}

        <div className="bp-actions">
          <button className="button button--secondary" type="button" onClick={() => router.push("/quotes")}>
            Cancel
          </button>
          <button className="button button--primary" type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Creating..." : "Create quote"}
          </button>
        </div>
      </form>
    </section>
  );
}
