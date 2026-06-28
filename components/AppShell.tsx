"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";
import { OnboardingTour } from "./onboarding/OnboardingTour";
import { GuidedTour, isTourDone, markTourDone, resetTour } from "./onboarding/GuidedTour";

const navItems = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/customers", label: "Customers" },
  { href: "/quotes", label: "Quotes" },
  { href: "/jobs", label: "Jobs" },
  { href: "/calendar", label: "Schedule" },
  { href: "/finance", label: "Finance" },
  { href: "/revenue", label: "Revenue" },
  { href: "/marketing", label: "Marketing" },
  { href: "/settings", label: "Settings" },
];

function NotificationDropdown({ onClose }: { onClose: () => void }) {
  const [items, setItems] = useState<Array<{ id: string; type: string; message: string; created_at: string; read: boolean; quote_id?: string }>>([]);
  const [ld, setLd] = useState(true);
  useEffect(() => {
    (async () => {
      try {
        const tk = localStorage.getItem("jobstacker_token");
        const r = await fetch("/api/notifications/list", { headers: { Authorization: `Bearer ${tk}` } });
        if (r.ok) { const d = await r.json(); setItems(d.notifications ?? []); }
      } catch { /* ok */ } finally { setLd(false); }
    })();
  }, []);
  return (
    <div onClick={onClose}>
      <div style={{ padding: "12px 16px", borderBottom: "1px solid var(--border)", fontWeight: 700, fontSize: 14 }}>Notifications</div>
      {ld ? <div style={{ padding: 20, textAlign: "center", color: "var(--text-soft)", fontSize: 13 }}>Loading...</div>
      : items.length === 0 ? <div style={{ padding: 20, textAlign: "center", color: "var(--text-soft)", fontSize: 13 }}>No notifications</div>
      : items.map((n) => (
        <div key={n.id}
          role="button"
          tabIndex={0}
          onClick={() => { if (n.type.startsWith("quote")) window.open(`/quotes/${n.quote_id ?? ""}`); }}
          onKeyDown={(e) => { if (e.key === "Enter" && n.type.startsWith("quote")) window.open(`/quotes/${n.quote_id ?? ""}`); }}
          style={{ padding: "10px 16px", borderBottom: "1px solid var(--border)", cursor: "pointer", background: n.read ? "transparent" : "var(--brand-soft)", fontSize: 13, color: "var(--text)" }}>
          <div style={{ fontWeight: n.read ? 400 : 600 }}>{n.message}</div>
          <div style={{ fontSize: 11, color: "var(--text-soft)", marginTop: 2 }}>{new Date(n.created_at).toLocaleString()}</div>
        </div>
      ))}
    </div>
  );
}

const marketingRoutes = new Set(["/", "/login", "/signup", "/blog", "/privacy", "/terms", "/install", "/leads-for-tradespeople", "/quoting-guide-for-tradespeople", "/grow-trade-business", "/trade-business-administration", "/electrician-lead-management-software", "/plumbing-crm-uk", "/trade-business-management-app"]);
const marketingPrefixes = ["/crm-for-", "/quote-software", "/invoice-software", "/job-management-software", "/scheduling-software", "/crm-software", "/client-management-software", "/customer-management-software", "/lead-management-software", "/trade-crm", "/business-management-software", "/field-service-management", "/work-order-software", "/job-tracking-software", "/jobber-alternative", "/tradify-alternative", "/housecall-pro-alternative"];

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const isMarketing = marketingRoutes.has(pathname) || marketingPrefixes.some((p) => pathname.startsWith(p));
  const [planTier, setPlanTier] = useState<string | null>(null);
  const [planName, setPlanName] = useState<string | null>(null);
  const [loggedIn, setLoggedIn] = useState(false);
  const [showTour, setShowTour] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotifs, setShowNotifs] = useState(false);
  const [showDownload, setShowDownload] = useState(false);
  const [showMobileNav, setShowMobileNav] = useState(false);

  // Tour trigger: auto on first login (except /setup), ?tour=1, or setup-completion flag
  useEffect(() => {
    if (isMarketing) return;
    const forceTour = globalThis.location?.search.includes("tour=1");
    if (forceTour) resetTour();
    const startTour = localStorage.getItem("jobstacker_start_tour") === "1";
    if (startTour) {
      setShowTour(true);
      localStorage.removeItem("jobstacker_start_tour");
      return;
    }
    if (forceTour || (!isTourDone() && pathname !== "/setup")) {
      setShowTour(true);
    }
  }, [pathname, isMarketing]);

  useEffect(() => {
    const hasToken = !!localStorage.getItem("jobstacker_token");
    setLoggedIn(hasToken);

    if (isMarketing) return;

    let isCurrent = true;

    async function loadPlan() {
      try {
        const token = window.localStorage.getItem("jobstacker_token");
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
        const tk = localStorage.getItem("jobstacker_token");
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
        const tk = localStorage.getItem("jobstacker_token");
        if (!tk) return;
        const r = await fetch("/api/notifications/list", { headers: { Authorization: `Bearer ${tk}` } });
        if (r.ok) { const d = await r.json(); setUnreadCount(d.unreadCount ?? 0); }
      } catch { /* ok */ }
    })();
    return () => { isCurrent = false; clearInterval(ival); };
  }, [isMarketing, pathname]);

  function handleLogout() {
    localStorage.removeItem("jobstacker_token");
    document.cookie = "jobstacker_auth=; path=/; max-age=0";
    setLoggedIn(false);
    router.push("/");
  }

  function handleTourDone() {
    markTourDone();
    setShowTour(false);
  }

  const dropdownLink: React.CSSProperties = {
    display: "flex", alignItems: "center", gap: 12,
    padding: "12px 16px", borderBottom: "1px solid var(--border)",
    textDecoration: "none", color: "var(--text)", fontSize: 14,
    cursor: "pointer", transition: "background 0.1s",
  };

  return (
    <div
      className={
        isMarketing ? "app-shell app-shell--marketing" : "app-shell"
      }
    >
      <header className="app-shell__topbar">
        <Link href={loggedIn ? "/dashboard" : "/"} className="app-shell__brand" aria-label="JobStacker home">
          <span className="app-shell__mark">JS</span>
          <span>JobStacker</span>
        </Link>

        <div className="app-shell__actions" style={{ display: "flex", alignItems: "center", gap: 8 }}>
          {/* Hamburger menu for mobile */}
          {!isMarketing && loggedIn ? (
            <button
              className="app-shell__hamburger"
              onClick={() => setShowMobileNav((v) => !v)}
              aria-label={showMobileNav ? "Close navigation" : "Open navigation"}
              style={{
                display: "none", background: "none", border: "none", fontSize: 24,
                cursor: "pointer", color: "var(--text)", padding: 8,
              }}
            >
              {showMobileNav ? "✕" : "☰"}
            </button>
          ) : null}
          {/* Download menu — always visible */}
          <div style={{ position: "relative" }}>
            <button
              className="button button--ghost"
              onClick={() => setShowDownload((v) => !v)}
              style={{ fontSize: 13, fontWeight: 600, minWidth: 28, color: "var(--text-muted)" }}
              title="Download app"
            >
              ⬇
            </button>
            {showDownload ? (
              <>
                <div style={{ position: "fixed", inset: 0, zIndex: 10 }} onClick={() => setShowDownload(false)} />
                <div style={{ position: "absolute", top: "100%", right: 0, marginTop: 6, background: "var(--surface-overlay)", borderRadius: 12, boxShadow: "var(--shadow)", zIndex: 20, minWidth: 220, overflow: "hidden", border: "1px solid var(--border)" }}>
                  <div style={{ padding: "10px 16px", borderBottom: "1px solid var(--border)", fontSize: 12, fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.04em" }}>
                    Download App
                  </div>
                  <a href="https://files.catbox.moe/3k6f4o.dmg" style={dropdownLink}>
                    <span style={{ fontSize: 16 }}>🍎</span>
                    <div>
                      <div style={{ fontWeight: 600 }}>Download for Mac</div>
                      <div style={{ fontSize: 12, color: "var(--text-soft)" }}>.dmg installer</div>
                    </div>
                  </a>
                  <a href="/install#windows" style={dropdownLink}>
                    <span style={{ fontSize: 16 }}>🪟</span>
                    <div>
                      <div style={{ fontWeight: 600 }}>Download for Windows</div>
                      <div style={{ fontSize: 12, color: "var(--text-soft)" }}>.exe installer</div>
                    </div>
                  </a>
                  <Link href="/install" style={{ ...dropdownLink, borderBottom: "none" }}>
                    <span style={{ fontSize: 16 }}>📱</span>
                    <div>
                      <div style={{ fontWeight: 600 }}>All platforms</div>
                      <div style={{ fontSize: 12, color: "var(--text-soft)" }}>Installation guide</div>
                    </div>
                  </Link>
                </div>
              </>
            ) : null}
          </div>

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
                        headers: { Authorization: `Bearer ${localStorage.getItem("jobstacker_token") ?? ""}` },
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
                      background: "var(--danger)", color: "#fff", borderRadius: "50%",
                      width: 18, height: 18, fontSize: 11, fontWeight: 700,
                      display: "inline-flex", alignItems: "center", justifyContent: "center",
                    }}>
                      {unreadCount}
                    </span>
                  ) : null}
                </button>
                {showNotifs ? (
                  <div style={{
                    position: "absolute", top: 44, right: 0, width: 300, background: "var(--surface-overlay)",
                    borderRadius: 10, boxShadow: "var(--shadow)", zIndex: 100,
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
              <Link className="button button--ghost" href="/blog" style={{ fontSize: 13, fontWeight: 600, color: "var(--text-muted)", textDecoration: "none", padding: "8px 14px" }}>
                Articles
              </Link>
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

        {/* Mobile navigation overlay */}
        {!isMarketing && showMobileNav ? (
          <>
            <div
              className="app-shell__backdrop"
              onClick={() => setShowMobileNav(false)}
              style={{
                position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)",
                zIndex: 200, display: "none",
              }}
            />
            <nav className="app-shell__mobile-nav" style={{
              position: "fixed", top: 56, left: 0, bottom: 0, width: 280,
              background: "var(--surface)", zIndex: 210, overflow: "auto",
              display: "none", boxShadow: "4px 0 24px rgba(0,0,0,0.1)",
              padding: "12px 0",
            }}>
              {navItems.map((item) => {
                const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
                return (
                  <Link key={item.href} href={item.href}
                    onClick={() => setShowMobileNav(false)}
                    style={{
                      display: "block", padding: "14px 20px", fontSize: 16, fontWeight: 600,
                      textDecoration: "none", color: isActive ? "var(--brand)" : "var(--text)",
                      background: isActive ? "var(--brand-soft)" : "transparent",
                      borderLeft: isActive ? "3px solid var(--brand)" : "3px solid transparent",
                    }}
                  >
                    {item.label}
                  </Link>
                );
              })}
              {planName ? (
                <div style={{ padding: "14px 20px", borderTop: "1px solid var(--border)", marginTop: 8, fontSize: 13, color: "var(--text-muted)" }}>
                  {planName}
                </div>
              ) : null}
            </nav>
          </>
        ) : null}

        <main className="app-shell__main">{children}</main>
      </div>

      {showTour ? <GuidedTour onDone={handleTourDone} /> : null}
    </div>
  );
}
