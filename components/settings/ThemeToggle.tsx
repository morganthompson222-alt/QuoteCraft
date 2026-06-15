"use client";

import { useTheme } from "../../hooks/useTheme";

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="table-card">
      <div className="bp-section__title">
        <h2>Appearance</h2>
      </div>
      <div className="bp-section__body">
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16 }}>
          <div>
            <div style={{ fontWeight: 600, marginBottom: 4 }}>Theme</div>
            <div style={{ fontSize: 13, color: "var(--text-muted)" }}>
              {theme === "dark" ? "Dark mode is on" : "Light mode is on"}
            </div>
          </div>
          <button
            className="button"
            onClick={toggleTheme}
            style={{
              display: "flex", alignItems: "center", gap: 8,
              padding: "10px 20px", borderRadius: 8, fontSize: 14, fontWeight: 600,
              border: "1px solid var(--border)", background: "var(--surface)", color: "var(--text)",
              cursor: "pointer", transition: "background 0.15s, border-color 0.15s",
            }}
          >
            <span style={{ fontSize: 18 }}>{theme === "dark" ? "☀️" : "🌙"}</span>
            {theme === "dark" ? "Light mode" : "Dark mode"}
          </button>
        </div>
      </div>
    </div>
  );
}
