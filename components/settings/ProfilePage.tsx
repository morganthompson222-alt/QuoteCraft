"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
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
  customAiInstructions: string | null;
};

const COLOUR_SWATCHES: Record<string, string> = {
  "1F6B4F": "Green", "2563EB": "Blue", "DC2626": "Red", "7C3AED": "Purple",
  "EA580C": "Orange", "0D9488": "Teal", "DB2777": "Pink", "1E3A5F": "Navy",
  "0891B2": "Cyan", "D97706": "Amber", "059669": "Emerald", "BE123C": "Rose",
  "6D28D9": "Violet", "0F766E": "Dark Teal", "B45309": "Brown", "4338CA": "Indigo",
  "166534": "Forest", "9D174D": "Magenta", "92400E": "Sienna", "3730A3": "Royal Blue",
};
const COLOUR_NAMES = COLOUR_SWATCHES;

function TemplatePreview({ template, colour }: { template: string; colour: string }) {
  const hex = `#${colour}`;
  const light = `${hex}18`;
  const s = (x: number) => `${x}px`;
  const pre: Record<string, { header: boolean; bar: boolean; lines: boolean; accent: boolean; thick: boolean }> = {
    classic: { header: true, bar: false, lines: false, accent: false, thick: false },
    modern: { header: false, bar: true, lines: false, accent: true, thick: true },
    professional: { header: false, bar: false, lines: true, accent: false, thick: false },
    creative: { header: true, bar: true, lines: false, accent: true, thick: true },
    minimal: { header: false, bar: false, lines: false, accent: false, thick: false },
    bold: { header: true, bar: true, lines: true, accent: false, thick: true },
    elegant: { header: false, bar: true, lines: true, accent: false, thick: false },
    natural: { header: true, bar: false, lines: false, accent: true, thick: false },
  };
  const p = pre[template] ?? pre.classic;
  return (
    <div style={{ width: 220, height: 100, border: "1px solid #e5e7eb", borderRadius: 6, overflow: "hidden", marginTop: 8, background: "#fff", position: "relative" }}>
      {p.bar && <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 3, background: hex }} />}
      {p.header && <div style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 75, background: light }} />}
      <div style={{ position: "absolute", top: p.header ? 4 : 4, left: 8, fontWeight: 700, fontSize: 9, color: p.thick ? hex : "#0f172a" }}>
        Company Name
      </div>
      <div style={{ position: "absolute", top: p.header ? 16 : 14, left: 8, fontSize: 7, color: hex }}>
        {p.accent && <span style={{ display: "inline-block", width: 20, height: 1, background: hex, marginRight: 4, verticalAlign: "middle" }} />}
        Service Catalogue
      </div>
      {p.lines && <div style={{ position: "absolute", top: 24, left: 8, right: 8, height: 0.5, background: hex }} />}
      <div style={{ position: "absolute", top: p.lines ? 28 : 24, left: 8, right: 8 }}>
        <div style={{ display: "flex", justifyContent: "space-between", borderBottom: p.lines ? "0.5px solid #e5e7eb" : "none", padding: "1px 0", fontSize: 6, color: "#64748b" }}>
          <span>Service</span><span>Price</span>
        </div>
        {["Hedge trimming","Patio cleaning","Tree surgery"].slice(0, 3).map((svc, i) => (
          <div key={i} style={{ display: "flex", justifyContent: "space-between", fontSize: 5.5, color: "#334155", padding: "1px 0" }}>
            <span>{svc}</span><span style={{ fontWeight: 600 }}>£X</span>
          </div>
        ))}
      </div>
      {p.accent && <div style={{ position: "absolute", bottom: 4, left: 8, height: 1.5, width: 30, background: hex }} />}
    </div>
  );
}

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

function toBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(new Error("Failed to read file"));
    reader.readAsDataURL(file);
  });
}

export function ProfilePage() {
  const { postalLabel, regionCode, currencyCode } = useRegion();
  const [state, setState] = useState<ProfileState>({ status: "loading" });
  const [form, setForm] = useState({
    name: "", companyName: "", phone: "", address: "", city: "", state: "", zip: "",
    defaultTaxRate: 0, quotePrefix: "Q-", customAiInstructions: "",
  });
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [logoLoading, setLogoLoading] = useState(false);
  const [logoError, setLogoError] = useState("");
  const [dragOver, setDragOver] = useState(false);
  const [cleanupLoading, setCleanupLoading] = useState(false);
  const [catalogueLoading, setCatalogueLoading] = useState(false);
  const [catalogueText, setCatalogueText] = useState("");
  const [catalogueTemplate, setCatalogueTemplate] = useState("classic");
  const [catalogueColour, setCatalogueColour] = useState("1F6B4F");
  const fileRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const isPaid = state.status === "loaded" && state.data.planTier !== "solo" && state.data.planTier !== "free";

  useEffect(() => {
    let isCurrent = true;
    async function loadProfile() {
      setState({ status: "loading" });
      try {
        const token = window.localStorage.getItem("quotecraft_token");
        const response = await fetch("/api/profile", { headers: token ? { Authorization: `Bearer ${token}` } : {} });
        if (!response.ok) throw new Error(await readErrorMessage(response));
        const data = (await response.json()) as Profile;
        if (isCurrent) {
          setForm({
            name: data.name ?? "", companyName: data.companyName ?? "", phone: data.phone ?? "",
            address: data.address ?? "", city: data.city ?? "", state: data.state ?? "", zip: data.zip ?? "",
            defaultTaxRate: data.defaultTaxRate ?? 0, quotePrefix: data.quotePrefix ?? "Q-",
            customAiInstructions: data.customAiInstructions ?? "",
          });
          setLogoUrl(data.logoUrl ?? null);
          setState({ status: "loaded", data });
        }
      } catch (error) {
        if (isCurrent) setState({ status: "error", error: error instanceof Error ? error.message : "Unable to load profile." });
      }
    }
    loadProfile();
    return () => { isCurrent = false; };
  }, []);

  async function handleFile(f: File) {
    if (f.size > 3.5 * 1024 * 1024) { setLogoError("Logo must be under 3.5 MB."); return; }
    if (!f.type.startsWith("image/")) { setLogoError("Only image files are accepted."); return; }
    setLogoError("");
    setLogoLoading(true);
    try {
      const b64 = await toBase64(f);
      const tk = localStorage.getItem("quotecraft_token");
      const r = await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json", ...(tk ? { Authorization: `Bearer ${tk}` } : {}) },
        body: JSON.stringify({ logoUrl: b64 }),
      });
      if (!r.ok) throw new Error(await readErrorMessage(r));
      const d = (await r.json()) as Profile;
      setLogoUrl(d.logoUrl ?? null);
      setState((prev) => prev.status === "loaded" ? { ...prev, data: { ...prev.data, logoUrl: d.logoUrl } } : prev);
      toast("Logo updated.", "success");
    } catch (x) { setLogoError(x instanceof Error ? x.message : "Failed"); }
    finally { setLogoLoading(false); }
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault(); setDragOver(false);
    const f = e.dataTransfer.files?.[0];
    if (f) handleFile(f);
  }

  async function handleSave(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaveError(""); setIsSaving(true);
    try {
      const token = window.localStorage.getItem("quotecraft_token");
      const body: Record<string, string | number> = {};
      for (const [key, value] of Object.entries(form)) {
        if (key === "customAiInstructions") body[key] = typeof value === "string" ? value : "";
        else if (key === "defaultTaxRate" && value !== 0) body[key] = Number(value);
        else if (typeof value === "string" && value.trim()) body[key] = value.trim();
      }
      const response = await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {} ) },
        body: JSON.stringify(body),
      });
      if (!response.ok) throw new Error(await readErrorMessage(response));
      const data = (await response.json()) as Profile;
      setState({ status: "loaded", data });
      setIsEditing(false);
      toast("Profile updated.", "success");
    } catch (error) { setSaveError(error instanceof Error ? error.message : "Failed to save."); }
    finally { setIsSaving(false); }
  }

  async function handleCleanup() {
    if (!form.customAiInstructions.trim()) return;
    setCleanupLoading(true);
    try {
      const tk = localStorage.getItem("quotecraft_token");
      const r = await fetch("/api/ai/cleanup-instructions", {
        method: "POST",
        headers: { "Content-Type": "application/json", ...(tk ? { Authorization: `Bearer ${tk}` } : {}) },
        body: JSON.stringify({ instructions: form.customAiInstructions }),
      });
      if (!r.ok) { const j = await r.json().catch(() => ({})); throw new Error(j?.error?.message ?? "Failed"); }
      const d = await r.json();
      setForm((prev) => ({ ...prev, customAiInstructions: d.cleaned }));
      toast("Instructions cleaned.", "success");
    } catch (x) {
      setSaveError(x instanceof Error ? x.message : "Failed to clean");
    } finally {
      setCleanupLoading(false);
    }
  }

  async function handleGenerateCatalogue() {
    setCatalogueLoading(true);
    setCatalogueText("");
    try {
      const tk = localStorage.getItem("quotecraft_token");
      const r = await fetch("/api/ai/service-catalogue", {
        headers: tk ? { Authorization: `Bearer ${tk}` } : {},
      });
      if (!r.ok) { const j = await r.json().catch(() => ({})); throw new Error(j?.error?.message ?? "Failed"); }
      const d = await r.json();
      setCatalogueText(d.catalogue);
      toast("Service catalogue generated from your history.", "success");
    } catch (x) {
      setSaveError(x instanceof Error ? x.message : "Failed to generate catalogue");
    } finally {
      setCatalogueLoading(false);
    }
  }

  async function handleDownloadCatalogue() {
    try {
      const tk = localStorage.getItem("quotecraft_token");
      const url = `/api/ai/service-catalogue/pdf?template=${catalogueTemplate}&colour=${catalogueColour}`;
      const r = await fetch(url, { headers: tk ? { Authorization: `Bearer ${tk}` } : {} });
      if (!r.ok) {
        const j = await r.json().catch(() => ({}));
        throw new Error(j?.error?.message ?? "Failed");
      }
      const blob = await r.blob();
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = "service-catalogue.pdf";
      a.click();
    } catch (x) {
      setSaveError(x instanceof Error ? x.message : "Download failed");
    }
  }

  function handleCancel() {
    if (state.status !== "loaded") return;
    const d = state.data;
    setForm({
      name: d.name ?? "", companyName: d.companyName ?? "", phone: d.phone ?? "",
      address: d.address ?? "", city: d.city ?? "", state: d.state ?? "", zip: d.zip ?? "",
      defaultTaxRate: d.defaultTaxRate ?? 0, quotePrefix: d.quotePrefix ?? "Q-",
      customAiInstructions: d.customAiInstructions ?? "",
    });
    setIsEditing(false); setSaveError("");
  }

  if (state.status === "loading") return (
    <div className="table-card" aria-busy="true">
      <div className="table-skeleton table-skeleton--header" />
      {Array.from({ length: 4 }).map((_, i) => <div className="table-skeleton" key={i} />)}
    </div>
  );

  if (state.status === "error") return (
    <div className="state-panel state-panel--error" role="alert">
      <h2>Profile could not be loaded</h2><p>{state.error}</p>
    </div>
  );

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
    <>
      {/* Logo section */}
      <div className="table-card" style={{ marginBottom: 20 }}>
        <div className="bp-section__title">
          <h2 style={{ fontSize: 15, margin: 0 }}>Company logo</h2>
        </div>
        <div className="bp-section__body">
          {!isPaid ? (
            <p style={{ fontSize: 14, color: "var(--text-muted)", margin: 0 }}>
              Logo upload is available on paid plans (Solo Pro and above). Upgrade to add your logo to PDF invoices.
            </p>
          ) : (
            <div
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleDrop}
              onClick={() => fileRef.current?.click()}
              style={{
                border: `2px dashed ${dragOver ? "#1F6B4F" : "var(--border)"}`,
                borderRadius: 8, padding: "24px 20px", textAlign: "center",
                cursor: "pointer", background: dragOver ? "#eefaf4" : "#fafafa",
                transition: "all 0.15s",
              }}
            >
              <input ref={fileRef} type="file" accept="image/*" style={{ display: "none" }}
                onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }}
              />
              {logoUrl ? (
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}>
                  <img src={logoUrl} alt="Logo preview" style={{ maxHeight: 80, maxWidth: 200, objectFit: "contain" }} />
                  <span style={{ fontSize: 13, color: "var(--text-muted)" }}>Click or drag to replace</span>
                </div>
              ) : logoLoading ? (
                <span style={{ fontSize: 14, color: "var(--text-muted)" }}>Uploading...</span>
              ) : (
                <div>
                  <span style={{ fontSize: 20 }}>⬆</span>
                  <p style={{ fontSize: 14, color: "var(--text-muted)", margin: "8px 0 0" }}>
                    Drag &amp; drop your logo here, or click to browse
                  </p>
                  <p style={{ fontSize: 12, color: "var(--text-soft)", margin: "4px 0 0" }}>
                    PNG or JPG, max 3.5 MB
                  </p>
                </div>
              )}
            </div>
          )}
          {logoError ? <p style={{ fontSize: 13, color: "#b91c1c", margin: "8px 0 0" }}>{logoError}</p> : null}
        </div>
      </div>

      {/* Profile fields */}
      <div className="table-card">
        <div className="bp-section__title">
          <h2 style={{ fontSize: 15, margin: 0 }}>Profile</h2>
          {!isEditing ? (
            <button className="button button--ghost" type="button" onClick={() => setIsEditing(true)} style={{ fontSize: 13, minHeight: 34 }}>Edit</button>
          ) : null}
        </div>

        {!isEditing ? (
          <div className="bp-section__body">
            <dl className="detail-list">
              <div className="detail-list__row"><dt>Email</dt><dd>{profile.email}</dd></div>
              <div className="detail-list__row"><dt>Name</dt><dd>{profile.name ?? "—"}</dd></div>
              <div className="detail-list__row"><dt>Company</dt><dd>{profile.companyName ?? "—"}</dd></div>
              <div className="detail-list__row"><dt>Phone</dt><dd>{profile.phone ?? "—"}</dd></div>
              <div className="detail-list__row"><dt>Address</dt><dd>{[profile.address, profile.city, profile.state, profile.zip].filter(Boolean).join(", ") || "—"}</dd></div>
              <div className="detail-list__row"><dt>Region</dt><dd>{regionCode} ({currencyCode})</dd></div>
              <div className="detail-list__row"><dt>Default tax</dt><dd>{profile.defaultTaxRate}%</dd></div>
              <div className="detail-list__row"><dt>Quote prefix</dt><dd>{profile.quotePrefix}</dd></div>
              <div className="detail-list__row">
                <dt>AI instructions</dt>
                <dd style={{ whiteSpace: "pre-wrap", fontSize: 13 }}>{profile.customAiInstructions || "—"}</dd>
              </div>
              <div className="detail-list__row" style={{ alignItems: "flex-start" }}>
                <dt>Service catalogue</dt>
                <dd>
                  {!catalogueText ? (
                    <button
                      type="button"
                      onClick={handleGenerateCatalogue}
                      disabled={catalogueLoading}
                      style={{
                        padding: "6px 14px", borderRadius: 6, fontSize: 12, fontWeight: 600, cursor: "pointer",
                        border: "1px solid var(--border)", background: "#fff", color: "#0f172a",
                      }}
                    >
                      {catalogueLoading ? "Generating..." : "Generate from history ✨"}
                    </button>
                  ) : (
                    <div>
                      <div style={{ whiteSpace: "pre-wrap", fontSize: 13, color: "#334155", lineHeight: 1.7, marginBottom: 12 }}>
                        {catalogueText}
                      </div>
                      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "flex-end" }}>
                        <div>
                          <label style={{ fontSize: 11, fontWeight: 600, color: "#64748b", display: "block", marginBottom: 4 }}>Template</label>
                          <select value={catalogueTemplate} onChange={(e) => setCatalogueTemplate(e.target.value)}
                            style={{ padding: "6px 10px", borderRadius: 6, border: "1px solid var(--border)", fontSize: 13, background: "#fff" }}>
                            {["classic","modern","professional","creative","minimal","bold","elegant","natural"].map(t => (
                              <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>
                            ))}
                          </select>
                          <TemplatePreview template={catalogueTemplate} colour={catalogueColour} />
                        </div>
                        <div>
                          <label style={{ fontSize: 11, fontWeight: 600, color: "#64748b", display: "block", marginBottom: 4 }}>Colour</label>
                          <div style={{ display: "flex", flexWrap: "wrap", gap: 4, maxWidth: 220 }}>
                            {Object.keys(COLOUR_SWATCHES).map(c => (
                              <div key={c} onClick={() => setCatalogueColour(c)} title={COLOUR_NAMES[c]}
                                style={{ width: 18, height: 18, borderRadius: "50%", cursor: "pointer", background: `#${c}`, border: catalogueColour === c ? "2px solid #0f172a" : "1px solid #e5e7eb" }} />
                            ))}
                          </div>
                        </div>
                        <button type="button" onClick={handleDownloadCatalogue}
                          style={{ padding: "7px 16px", borderRadius: 6, fontSize: 12, fontWeight: 700, border: "none", background: "#1F6B4F", color: "#fff", cursor: "pointer" }}>
                          Download PDF
                        </button>
                      </div>
                    </div>
                  )}
                </dd>
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
                    id={`profile-${field.key}`} name={field.key} type={field.type}
                    value={form[field.key]}
                    onChange={(e) => setForm((prev) => ({ ...prev, [field.key]: field.type === "number" ? Number(e.target.value) || 0 : e.target.value }))}
                    className="line-items__input" style={{ minHeight: 42 }}
                  />
                </div>
              ))}
              <div className="field" style={{ gridColumn: "1 / -1" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
                  <label htmlFor="profile-customAiInstructions">AI pricing instructions</label>
                  <button
                    type="button"
                    onClick={handleCleanup}
                    disabled={cleanupLoading || !form.customAiInstructions.trim()}
                    style={{
                      padding: "4px 10px", borderRadius: 6, fontSize: 11, fontWeight: 600, cursor: "pointer",
                      border: "1px solid var(--border)", background: "#fff", color: "#1F6B4F",
                      opacity: cleanupLoading ? 0.5 : 1,
                    }}
                  >
                    {cleanupLoading ? "Cleaning..." : "AI Clean ✨"}
                  </button>
                </div>
                <textarea
                  id="profile-customAiInstructions"
                  value={form.customAiInstructions}
                  onChange={(e) => setForm((prev) => ({ ...prev, customAiInstructions: e.target.value }))}
                  className="bp-textarea"
                  rows={5}
                  placeholder={'e.g. I charge £80/hr for tree cutting\n£50/hr for patio cleaning\nBricks cost £150 per ton'}
                  style={{ minHeight: 100 }}
                />
                <span style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 4, display: "block" }}>
                  AI will use these rates exactly. Keep it specific: item + price + unit (per hour, per sqm, etc).
                </span>
                <div style={{ display: "flex", gap: 8, marginTop: 10, alignItems: "center", flexWrap: "wrap" }}>
                  <button
                    type="button"
                    onClick={handleGenerateCatalogue}
                    disabled={catalogueLoading}
                    style={{
                      padding: "6px 14px", borderRadius: 6, fontSize: 12, fontWeight: 600, cursor: "pointer",
                      border: "1px solid var(--border)", background: "#fff", color: "#0f172a",
                      opacity: catalogueLoading ? 0.5 : 1,
                    }}
                  >
                    {catalogueLoading ? "Generating..." : "Generate service catalogue"}
                  </button>
                </div>
                {catalogueText ? (
                  <div style={{
                    marginTop: 12, padding: "14px 18px", background: "#f8fafc", border: "1px solid var(--border)",
                    borderRadius: 8, whiteSpace: "pre-wrap", fontSize: 13, color: "#334155", lineHeight: 1.7,
                    maxHeight: 300, overflow: "auto", marginBottom: 12,
                  }}>
                    {catalogueText}
                  </div>
                ) : null}
                <div style={{ display: "flex", gap: 12, flexWrap: "wrap", alignItems: "flex-end", marginTop: 8 }}>
                  <div>
                    <label style={{ fontSize: 11, fontWeight: 600, color: "#64748b", display: "block", marginBottom: 4 }}>Template</label>
                    <select
                      value={catalogueTemplate}
                      onChange={(e) => setCatalogueTemplate(e.target.value)}
                      style={{ padding: "6px 10px", borderRadius: 6, border: "1px solid var(--border)", fontSize: 13, background: "#fff" }}
                    >
                      {["classic","modern","professional","creative","minimal","bold","elegant","natural"].map(t => (
                        <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>
                      ))}
                    </select>
                  </div>
                  <TemplatePreview template={catalogueTemplate} colour={catalogueColour} />
                  <div>
                    <label style={{ fontSize: 11, fontWeight: 600, color: "#64748b", display: "block", marginBottom: 4 }}>Colour</label>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 4, maxWidth: 280 }}>
                      {Object.keys(COLOUR_SWATCHES).map(c => (
                        <div
                          key={c}
                          onClick={() => setCatalogueColour(c)}
                          title={COLOUR_NAMES[c] ?? c}
                          style={{
                            width: 20, height: 20, borderRadius: "50%", cursor: "pointer",
                            background: `#${c}`, border: catalogueColour === c ? "2px solid #0f172a" : "1px solid #e5e7eb",
                          }}
                        />
                      ))}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={handleDownloadCatalogue}
                    style={{
                      padding: "7px 16px", borderRadius: 6, fontSize: 12, fontWeight: 700, cursor: "pointer",
                      border: "none", background: "#1F6B4F", color: "#fff",
                    }}
                  >
                    Download PDF
                  </button>
                </div>
              </div>
            </div>
            {saveError ? <div className="auth-form__error" role="alert" style={{ marginTop: 16 }}>{saveError}</div> : null}
            <div className="modal-dialog__actions" style={{ marginTop: 20 }}>
              <button className="button button--secondary" type="button" onClick={handleCancel} disabled={isSaving}>Cancel</button>
              <button className="button button--primary" type="submit" disabled={isSaving}>{isSaving ? "Saving..." : "Save changes"}</button>
            </div>
          </form>
        )}
      </div>
    </>
  );
}
