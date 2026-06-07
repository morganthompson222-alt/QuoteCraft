"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";
import { OnboardingTour } from "./onboarding/OnboardingTour";
import { GuidedTour } from "./onboarding/GuidedTour";

const navItems = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/customers", label: "Customers" },
  { href: "/quotes", label: "Quotes" },
  { href: "/calendar", label: "Schedule" },
  { href: "/settings", label: "Settings" },
];

function NotificationDropdown({ onClose }: { onClose: () => void }) {
  const [items, setItems] = useState<Array<{ id: string; type: string; message: string; created_at: string; read: boolean; quote_id?: string }>>([]);
  const [ld, setLd] = useState(true);
  useEffect(() => {
    (async () => {
      try {
        const tk = localStorage.getItem("quotecraft_token");
        const r = await fetch("/api/notifications/list", { headers: { Authorization: `Bearer ${tk}` } });
        if (r.ok) { const d = await r.json(); setItems(d.notifications ?? []); }
      } catch { /* ok */ } finally { setLd(false); }
    })();
  }, []);
  return (
    <div onClick={onClose}>
      <div style={{ padding: "12px 16px", borderBottom: "1px solid #e5e7eb", fontWeight: 700, fontSize: 14 }}>Notifications</div>
      {ld ? <div style={{ padding: 20, textAlign: "center", color: "#94a3b8", fontSize: 13 }}>Loading...</div>
      : items.length === 0 ? <div style={{ padding: 20, textAlign: "center", color: "#94a3b8", fontSize: 13 }}>No notifications</div>
      : items.map((n) => (
        <div key={n.id}
          role="button"
          tabIndex={0}
          onClick={() => { if (n.type.startsWith("quote")) window.open(`/quotes/${n.quote_id ?? ""}`); }}
          onKeyDown={(e) => { if (e.key === "Enter" && n.type.startsWith("quote")) window.open(`/quotes/${n.quote_id ?? ""}`); }}
          style={{ padding: "10px 16px", borderBottom: "1px solid #e5e7eb", cursor: "pointer", background: n.read ? "transparent" : "#eefaf4", fontSize: 13, color: "#334155" }}>
          <div style={{ fontWeight: n.read ? 400 : 600 }}>{n.message}</div>
          <div style={{ fontSize: 11, color: "#94a3b8", marginTop: 2 }}>{new Date(n.created_at).toLocaleString()}</div>
        </div>
      ))}
    </div>
  );
}

const marketingRoutes = new Set(["/", "/login", "/signup"]);

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const isMarketing = marketingRoutes.has(pathname);
  const [planTier, setPlanTier] = useState<string | null>(null);
  const [planName, setPlanName] = useState<string | null>(null);
  const [loggedIn, setLoggedIn] = useState(false);
  const [showTour, setShowTour] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotifs, setShowNotifs] = useState(false);

  useEffect(() => {
    const hasToken = !!localStorage.getItem("quotecraft_token");
    const onboarded = localStorage.getItem("quotecraft_onboarded");
    setLoggedIn(hasToken);
    if (hasToken && !onboarded && !isMarketing) {
      setShowTour(true);
    }

    if (isMarketing) return;

    let isCurrent = true;

    async function loadPlan() {
      try {
        const token = window.localStorage.getItem("quotecraft_token");
        if (!token) return;

        const response = await fetch("/api/billing/status", {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (response.ok) {
          const data = (await response.json()) as { tier: string; name: string };
          if (isCurrent) { setPlanTier(data.tier); setPlanName(data.name); }
        }
      } catch {
        // silently ignore
      }
    }

    loadPlan();
    // Poll notifications
    const ival = setInterval(async () => {
      try {
        const tk = localStorage.getItem("quotecraft_token");
        if (!tk) return;
        const r = await fetch("/api/notifications/list", { headers: { Authorization: `Bearer ${tk}` } });
        if (r.ok) {
          const d = await r.json();
          setUnreadCount(d.unreadCount ?? 0);
        }
      } catch { /* ok */ }
    }, 30000);
    // Initial check
    (async () => {
      try {
        const tk = localStorage.getItem("quotecraft_token");
        if (!tk) return;
        const r = await fetch("/api/notifications/list", { headers: { Authorization: `Bearer ${tk}` } });
        if (r.ok) { const d = await r.json(); setUnreadCount(d.unreadCount ?? 0); }
      } catch { /* ok */ }
    })();
    return () => { isCurrent = false; clearInterval(ival); };
  }, [isMarketing]);

  function handleLogout() {
    localStorage.removeItem("quotecraft_token");
    document.cookie = "quotecraft_auth=; path=/; max-age=0";
    setLoggedIn(false);
    router.push("/");
  }

  function handleTourDone() {
    localStorage.setItem("quotecraft_onboarded", "true");
    setShowTour(false);
  }

  return (
    <div
      className={
        isMarketing ? "app-shell app-shell--marketing" : "app-shell"
      }
    >
      <header className="app-shell__topbar">
        <Link href="/" className="app-shell__brand" aria-label="QuoteCraft home">
          <span className="app-shell__mark">QC</span>
          <span>QuoteCraft</span>
        </Link>

        <div className="app-shell__actions">
          {loggedIn ? (
            <>
              <div style={{ position: "relative" }}>
                <button
                  className="button button--ghost"
                  onClick={() => {
                    setShowNotifs((v) => !v);
                    if (unreadCount > 0) {
                      fetch("/api/notifications/read", {
                        method: "POST",
                        headers: { Authorization: `Bearer ${localStorage.getItem("quotecraft_token") ?? ""}` },
                      }).then(() => setUnreadCount(0)).catch(() => {});
                    }
                  }}
                  style={{ fontSize: 18, minWidth: 36 }}
                  title="Notifications"
                >
                  🔔
                  {unreadCount > 0 ? (
                    <span style={{
                      position: "absolute", top: 4, right: 2,
                      background: "#b91c1c", color: "#fff", borderRadius: "50%",
                      width: 18, height: 18, fontSize: 11, fontWeight: 700,
                      display: "inline-flex", alignItems: "center", justifyContent: "center",
                    }}>
                      {unreadCount}
                    </span>
                  ) : null}
                </button>
                {showNotifs ? (
                  <div style={{
                    position: "absolute", top: 44, right: 0, width: 300, background: "#fff",
                    borderRadius: 10, boxShadow: "0 10px 40px rgba(0,0,0,0.12)", zIndex: 100,
                    maxHeight: 300, overflow: "auto", fontSize: 13,
                  }}>
                    <NotificationDropdown onClose={() => setShowNotifs(false)} />
                  </div>
                ) : null}
              </div>
              <button className="button button--ghost" onClick={handleLogout}>Log out</button>
            </>
          ) : (
            <>
              <Link className="button button--ghost" href="/login">
                Log in
              </Link>
              <Link className="button button--primary" href="/signup">
                Sign up
              </Link>
            </>
          )}
        </div>
      </header>

      <div className="app-shell__body">
        {!isMarketing ? (
          <aside className="app-shell__sidebar" aria-label="Primary navigation">
            <nav className="app-shell__nav">
              {navItems.map((item) => {
                const isActive =
                  pathname === item.href || pathname.startsWith(`${item.href}/`);

                return (
                  <Link
                    key={item.href}
                    className={
                      isActive
                        ? "app-shell__nav-link app-shell__nav-link--active"
                        : "app-shell__nav-link"
                    }
                    href={item.href}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </nav>

            {planName ? (
              <div className="app-shell__plan">
                <Link href="/settings">
                  <span className="app-shell__plan-badge">{planName}</span>
                </Link>
              </div>
            ) : null}
          </aside>
        ) : null}

        <main className="app-shell__main">{children}</main>
      </div>

      {showTour ? <GuidedTour onDone={handleTourDone} /> : null}
    </div>
  );
}
