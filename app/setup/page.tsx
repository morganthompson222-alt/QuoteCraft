"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function SetupPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [saving, setSaving] = useState(false);

  const [company, setCompany] = useState({ companyName: "", phone: "", address: "", city: "", state: "", zip: "" });
  const [services, setServices] = useState("");
  const [taxRate, setTaxRate] = useState(0);

  const steps = [
    { title: "Your company", desc: "Tell us about your business so quotes look professional." },
    { title: "Your services", desc: "List what you charge. This trains the AI to generate accurate quotes." },
    { title: "Tax rate", desc: "Set your default tax rate. You can change it per quote later." },
  ];

  async function saveAndNext() {
    setSaving(true);
    try {
      const tk = localStorage.getItem("jobstacker_token");
      const body: Record<string, string | number> = {};
      if (step === 0) {
        for (const [k, v] of Object.entries(company)) { if (v.trim()) body[k] = v.trim(); }
      }
      if (step === 1 && services.trim()) {
        try {
          const tk = localStorage.getItem("jobstacker_token");
          const r = await fetch("/api/ai/cleanup-instructions", {
            method: "POST",
            headers: { "Content-Type": "application/json", ...(tk ? { Authorization: `Bearer ${tk}` } : {}) },
            body: JSON.stringify({ instructions: services }),
          });
          if (r.ok) {
            const d = await r.json();
            const cleaned = d.cleaned ?? services;
            setServices(cleaned);
            body.customAiInstructions = cleaned;
          } else {
            body.customAiInstructions = services;
          }
        } catch {
          body.customAiInstructions = services;
        }
      }
      if (step === 2 && taxRate > 0 && taxRate <= 100) body.defaultTaxRate = taxRate;

      if (Object.keys(body).length > 0) {
        await fetch("/api/profile", {
          method: "PUT", headers: {
            "Content-Type": "application/json",
            ...(tk ? { Authorization: `Bearer ${tk}` } : {}),
          }, body: JSON.stringify(body),
        });
      }
    } catch { /* ok */ }
    setSaving(false);
    if (step < 2) { setStep((s) => s + 1); }
    else {
      localStorage.setItem("jobstacker_start_tour", "1");
      router.push("/dashboard");
    }
  }

  return (
    <section style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "var(--background)", padding: 24 }}>
      <div style={{ width: "100%", maxWidth: 440 }}>
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <div style={{ fontSize: 22, fontWeight: 800, color: "var(--text)" }}>Setup your workspace</div>
          <div style={{ fontSize: 14, color: "var(--text-muted)", marginTop: 4 }}>{steps[step].desc}</div>
        </div>

        <div style={{ display: "flex", gap: 8, marginBottom: 32, justifyContent: "center" }}>
          {steps.map((_, i) => (
            <div key={i} style={{
              width: i === step ? 32 : 8, height: 8, borderRadius: 4,
              background: i <= step ? "var(--brand)" : "var(--border)", transition: "all 0.2s",
            }} />
          ))}
        </div>

        {step === 0 ? (
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <div className="field"><label htmlFor="s-company">Company name</label>
              <input id="s-company" type="text" value={company.companyName} onChange={(e) => setCompany((p) => ({ ...p, companyName: e.target.value }))}
                style={{ minHeight: 48, fontSize: 16, width: "100%" }} /></div>
            <div className="field"><label htmlFor="s-phone">Phone</label>
              <input id="s-phone" type="tel" value={company.phone} onChange={(e) => setCompany((p) => ({ ...p, phone: e.target.value }))}
                style={{ minHeight: 48, fontSize: 16, width: "100%" }} /></div>
            <div className="field"><label htmlFor="s-address">Address</label>
              <input id="s-address" type="text" value={company.address} onChange={(e) => setCompany((p) => ({ ...p, address: e.target.value }))}
                style={{ minHeight: 48, fontSize: 16, width: "100%" }} /></div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <div className="field"><label htmlFor="s-city">City</label>
                <input id="s-city" type="text" value={company.city} onChange={(e) => setCompany((p) => ({ ...p, city: e.target.value }))}
                  style={{ minHeight: 48, fontSize: 16, width: "100%" }} /></div>
              <div className="field"><label htmlFor="s-state">State/Province</label>
                <input id="s-state" type="text" value={company.state} onChange={(e) => setCompany((p) => ({ ...p, state: e.target.value }))}
                  style={{ minHeight: 48, fontSize: 16, width: "100%" }} /></div>
            </div>
            <div className="field"><label htmlFor="s-zip">Postcode/ZIP</label>
              <input id="s-zip" type="text" value={company.zip} onChange={(e) => setCompany((p) => ({ ...p, zip: e.target.value }))}
                style={{ minHeight: 48, fontSize: 16, width: "100%" }} /></div>
          </div>
        ) : null}

        {step === 1 ? (
          <div className="field"><label htmlFor="s-services">Your services &amp; prices (one per line)</label>
            <textarea id="s-services" value={services} onChange={(e) => setServices(e.target.value)}
              placeholder={"Tree trimming — £150 per hour\nPatio cleaning — £5 per m²\nFence repair — £45 per panel"}
              style={{ border: "1px solid var(--border-strong)", borderRadius: 8, fontSize: 16, color: "var(--text)", minHeight: 160, outline: "none", padding: "12px", width: "100%", font: "inherit", resize: "vertical" }} />
          </div>
        ) : null}

        {step === 2 ? (
          <div className="field"><label htmlFor="s-tax">Default tax rate (%)</label>
            <input id="s-tax" type="number" min="0" max="100" step="0.1" value={taxRate} onChange={(e) => setTaxRate(Number(e.target.value) || 0)}
              style={{ minHeight: 48, fontSize: 16, width: 120 }} />
          </div>
        ) : null}

        <div style={{ display: "flex", gap: 12, marginTop: 28 }}>
          <button onClick={() => step > 0 ? setStep((s) => s - 1) : router.push("/dashboard")}
            style={{ flex: 1, padding: "14px 0", borderRadius: 8, fontSize: 15, fontWeight: 600, border: "1px solid var(--border)", background: "#fff", color: "var(--text)", cursor: "pointer" }}>
            {step > 0 ? "Back" : "Skip"}
          </button>
          <button onClick={saveAndNext} disabled={saving}
            style={{ flex: 1, padding: "14px 0", borderRadius: 8, fontSize: 15, fontWeight: 700, border: "none", background: "var(--brand)", color: "#fff", cursor: "pointer", opacity: saving ? 0.6 : 1 }}>
            {saving ? "Saving..." : step === 2 ? "Finish" : "Save & continue"}
          </button>
        </div>
      </div>
    </section>
  );
}
