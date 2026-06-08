"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function DeleteAccountSection() {
  const router = useRouter();
  const [confirmText, setConfirmText] = useState("");
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const canDelete = confirmText === "delete my account";

  async function handleDelete() {
    if (!canDelete) return;
    setLoading(true);
    setError("");

    try {
      const tk = localStorage.getItem("jobstacker_token");
      const res = await fetch("/api/account/delete", {
        method: "POST",
        headers: { "Content-Type": "application/json", ...(tk ? { Authorization: `Bearer ${tk}` } : {}) },
        body: JSON.stringify({ confirm: confirmText }),
      });

      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        throw new Error(d?.error?.message ?? "Failed to delete account");
      }

      localStorage.removeItem("jobstacker_token");
      localStorage.removeItem("jobstacker_region");
      localStorage.removeItem("jobstacker_onboarded");
      document.cookie = "jobstacker_auth=; path=/; max-age=0";
      router.push("/");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="table-card" style={{ borderColor: "var(--danger)", borderWidth: 2 }}>
      <h2 style={{ fontSize: 18, fontWeight: 700, color: "var(--danger)", margin: "0 0 8px" }}>
        Danger zone
      </h2>
      <p style={{ fontSize: 14, color: "#64748b", margin: "0 0 16px" }}>
        Once you delete your account, there is no going back. All your customers, quotes, jobs,
        and billing history will be permanently removed. This action cannot be undone.
      </p>

      {!showConfirm ? (
        <button
          className="button button--secondary"
          style={{ borderColor: "var(--danger)", color: "var(--danger)" }}
          onClick={() => setShowConfirm(true)}
        >
          Delete my account
        </button>
      ) : (
        <div style={{ background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 8, padding: 16 }}>
          <p style={{ fontSize: 13, color: "#991b1b", margin: "0 0 12px", fontWeight: 600 }}>
            Type &ldquo;delete my account&rdquo; below to confirm:
          </p>
          <input
            type="text"
            value={confirmText}
            onChange={(e) => setConfirmText(e.target.value)}
            placeholder="delete my account"
            style={{
              width: "100%", padding: "8px 12px", border: "1px solid #fca5a5", borderRadius: 6,
              fontSize: 14, outline: "none", boxSizing: "border-box", marginBottom: 12,
            }}
          />
          <div style={{ display: "flex", gap: 8 }}>
            <button
              className="button"
              style={{
                background: canDelete ? "var(--danger)" : "#e5e7eb",
                color: canDelete ? "#fff" : "#9ca3af",
                border: "none", padding: "8px 20px", borderRadius: 6, fontSize: 14, fontWeight: 600,
                cursor: canDelete ? "pointer" : "not-allowed",
              }}
              disabled={!canDelete || loading}
              onClick={handleDelete}
            >
              {loading ? "Deleting..." : "Yes, delete my account"}
            </button>
            <button
              className="button button--ghost"
              onClick={() => { setShowConfirm(false); setConfirmText(""); }}
            >
              Cancel
            </button>
          </div>
          {error ? (
            <p style={{ color: "var(--danger)", fontSize: 13, marginTop: 8 }}>{error}</p>
          ) : null}
        </div>
      )}
    </div>
  );
}
