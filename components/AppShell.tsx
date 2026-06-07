"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";
import { OnboardingTour } from "./onboarding/OnboardingTour";

const navItems = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/customers", label: "Customers" },
  { href: "/quotes", label: "Quotes" },
  { href: "/calendar", label: "Schedule" },
  { href: "/settings", label: "Settings" },
];

const marketingRoutes = new Set(["/", "/login", "/signup"]);

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const isMarketing = marketingRoutes.has(pathname);
  const [planTier, setPlanTier] = useState<string | null>(null);
  const [planName, setPlanName] = useState<string | null>(null);
  const [loggedIn, setLoggedIn] = useState(false);
  const [showTour, setShowTour] = useState(false);

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
    return () => { isCurrent = false; };
  }, [isMarketing]);

  function handleLogout() {
    localStorage.removeItem("quotecraft_token");
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
            <button className="button button--ghost" onClick={handleLogout}>
              Log out
            </button>
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

      {showTour ? <OnboardingTour onDone={handleTourDone} /> : null}
    </div>
  );
}
