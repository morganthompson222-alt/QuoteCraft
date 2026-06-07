"use client";

import { FormEvent, useEffect, useState } from "react";
import { useToast } from "../Toast";
import { useRegion } from "../../hooks/useRegion";

type Profile = {
  id: string;
  email: string;
  name: string | null;
  avatarUrl: string | null;
  companyName: string | null;
  logoUrl: string | null;
  phone: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  zip: string | null;
  defaultTaxRate: number;
  quotePrefix: string;
  planTier: string;
};

type ProfileState =
  | { status: "loading" }
  | { status: "error"; error: string }
  | { status: "loaded"; data: Profile };

async function readErrorMessage(response: Response) {
  try {
    const json = (await response.json()) as { error?: { message?: string } };
    return json.error?.message ?? "Operation failed.";
  } catch {
    return "Operation failed.";
  }
}

export function ProfilePage() {
  const { postalLabel, regionCode, currencyCode } = useRegion();
  const [state, setState] = useState<ProfileState>({ status: "loading" });
  const [form, setForm] = useState({
    name: "",
    companyName: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    zip: "",
    defaultTaxRate: 0,
    quotePrefix: "Q-",
  });
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState("");
  const { toast } = useToast();

  useEffect(() => {
    let isCurrent = true;

    async function loadProfile() {
      setState({ status: "loading" });

      try {
        const token = window.localStorage.getItem("quotecraft_token");
        const response = await fetch("/api/profile", {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });

        if (!response.ok) {
          throw new Error(await readErrorMessage(response));
        }

        const data = (await response.json()) as Profile;

        if (isCurrent) {
          setForm({
            name: data.name ?? "",
            companyName: data.companyName ?? "",
            phone: data.phone ?? "",
            address: data.address ?? "",
            city: data.city ?? "",
            state: data.state ?? "",
            zip: data.zip ?? "",
            defaultTaxRate: data.defaultTaxRate ?? 0,
            quotePrefix: data.quotePrefix ?? "Q-",
          });
          setState({ status: "loaded", data });
        }
      } catch (error) {
        if (isCurrent) {
          setState({
            status: "error",
            error: error instanceof Error ? error.message : "Unable to load profile.",
          });
        }
      }
    }

    loadProfile();
    return () => { isCurrent = false; };
  }, []);

  async function handleSave(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaveError("");
    setIsSaving(true);

    try {
      const token = window.localStorage.getItem("quotecraft_token");
      const body: Record<string, string | number> = {};

      for (const [key, value] of Object.entries(form)) {
        if (key === "defaultTaxRate" && value !== 0) {
          body[key] = Number(value);
        } else if (typeof value === "string" && value.trim()) {
          body[key] = value.trim();
        }
      }

      const response = await fetch("/api/profile", {
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

      const data = (await response.json()) as Profile;
      setState({ status: "loaded", data });
      setIsEditing(false);
      toast("Profile updated.", "success");
    } catch (error) {
      setSaveError(error instanceof Error ? error.message : "Failed to save.");
    } finally {
      setIsSaving(false);
    }
  }

  function handleCancel() {
    if (state.status !== "loaded") return;
    const d = state.data;
    setForm({
      name: d.name ?? "",
      companyName: d.companyName ?? "",
      phone: d.phone ?? "",
      address: d.address ?? "",
      city: d.city ?? "",
      state: d.state ?? "",
      zip: d.zip ?? "",
      defaultTaxRate: d.defaultTaxRate ?? 0,
      quotePrefix: d.quotePrefix ?? "Q-",
    });
    setIsEditing(false);
    setSaveError("");
  }

  if (state.status === "loading") {
    return (
      <div className="table-card" aria-busy="true">
        <div className="table-skeleton table-skeleton--header" />
        {Array.from({ length: 4 }).map((_, i) => (
          <div className="table-skeleton" key={i} />
        ))}
      </div>
    );
  }

  if (state.status === "error") {
    return (
      <div className="state-panel state-panel--error" role="alert">
        <h2>Profile could not be loaded</h2>
        <p>{state.error}</p>
      </div>
    );
  }

  const profile = state.data;

  const fields: { key: keyof typeof form; label: string; type: string }[] = [
    { key: "name", label: "Name", type: "text" },
    { key: "companyName", label: "Company name", type: "text" },
    { key: "phone", label: "Phone", type: "tel" },
    { key: "address", label: "Address", type: "text" },
    { key: "city", label: "City", type: "text" },
    { key: "state", label: "State/Province", type: "text" },
    { key: "zip", label: postalLabel, type: "text" },
    { key: "defaultTaxRate", label: "Default tax rate (%)", type: "number" },
    { key: "quotePrefix", label: "Quote number prefix", type: "text" },
  ];

  return (
    <div className="table-card">
      <div className="bp-section__title">
        <h2 style={{ fontSize: 15, margin: 0 }}>Profile</h2>
        {!isEditing ? (
          <button className="button button--ghost" type="button" onClick={() => setIsEditing(true)} style={{ fontSize: 13, minHeight: 34 }}>
            Edit
          </button>
        ) : null}
      </div>

      {!isEditing ? (
        <div className="bp-section__body">
          <dl className="detail-list">
            <div className="detail-list__row">
              <dt>Email</dt>
              <dd>{profile.email}</dd>
            </div>
            <div className="detail-list__row">
              <dt>Name</dt>
              <dd>{profile.name ?? "—"}</dd>
            </div>
            <div className="detail-list__row">
              <dt>Company</dt>
              <dd>{profile.companyName ?? "—"}</dd>
            </div>
            <div className="detail-list__row">
              <dt>Phone</dt>
              <dd>{profile.phone ?? "—"}</dd>
            </div>
            <div className="detail-list__row">
              <dt>Address</dt>
              <dd>
                {[profile.address, profile.city, profile.state, profile.zip]
                  .filter(Boolean)
                  .join(", ") || "—"}
              </dd>
            </div>
            <div className="detail-list__row">
              <dt>Region</dt>
              <dd>{regionCode} ({currencyCode})</dd>
            </div>
            <div className="detail-list__row">
              <dt>Default tax</dt>
              <dd>{profile.defaultTaxRate}%</dd>
            </div>
            <div className="detail-list__row">
              <dt>Quote prefix</dt>
              <dd>{profile.quotePrefix}</dd>
            </div>
          </dl>
        </div>
      ) : (
        <form className="bp-section__body" onSubmit={handleSave} noValidate>
          <div className="profile-edit-fields">
            {fields.map((field) => (
              <div className="field" key={field.key}>
                <label htmlFor={`profile-${field.key}`}>{field.label}</label>
                <input
                  id={`profile-${field.key}`}
                  name={field.key}
                  type={field.type}
                  value={form[field.key]}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      [field.key]: field.type === "number" ? Number(e.target.value) || 0 : e.target.value,
                    }))
                  }
                  className="line-items__input"
                  style={{ minHeight: 42 }}
                />
              </div>
            ))}
          </div>

          {saveError ? (
            <div className="auth-form__error" role="alert" style={{ marginTop: 16 }}>{saveError}</div>
          ) : null}

          <div className="modal-dialog__actions" style={{ marginTop: 20 }}>
            <button className="button button--secondary" type="button" onClick={handleCancel} disabled={isSaving}>
              Cancel
            </button>
            <button className="button button--primary" type="submit" disabled={isSaving}>
              {isSaving ? "Saving..." : "Save changes"}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
