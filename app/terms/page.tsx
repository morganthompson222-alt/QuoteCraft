import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service — QuoteCraft",
};

export default function TermsPage() {
  return (
    <section className="page">
      <div className="page__inner" style={{ maxWidth: 720 }}>
        <p className="hero__eyebrow">Legal</p>
        <h1 style={{ fontSize: 34, margin: "0 0 8px" }}>Terms of Service</h1>
        <p style={{ color: "var(--text-muted)", fontSize: 14, marginBottom: 32 }}>
          Last updated: June 5, 2026
        </p>

        <div className="legal-content">
          <h2>1. Service</h2>
          <p>
            QuoteCraft provides a web-based quoting platform for tradespeople and
            service businesses. By using this service, you agree to these terms.
          </p>

          <h2>2. Account</h2>
          <p>
            You are responsible for maintaining the confidentiality of your account
            credentials and for all activity under your account.
          </p>

          <h2>3. Usage limits</h2>
          <p>
            Usage is governed by your selected plan tier. Exceeding plan limits may
            result in restricted access until the plan is upgraded or the billing
            cycle resets.
          </p>

          <h2>4. Data</h2>
          <p>
            You retain ownership of all data you enter into QuoteCraft. We do not
            sell or share your data with third parties except as necessary to
            provide the service (e.g., Stripe for payment processing).
          </p>

          <h2>5. Limitation of liability</h2>
          <p>
            QuoteCraft is provided &quot;as is&quot; without warranty of any kind. We are not
            liable for any damages arising from the use of this service.
          </p>
        </div>
      </div>
    </section>
  );
}
