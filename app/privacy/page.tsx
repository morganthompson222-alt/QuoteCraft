import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy — QuoteCraft",
};

export default function PrivacyPage() {
  return (
    <section className="page">
      <div className="page__inner" style={{ maxWidth: 720 }}>
        <p className="hero__eyebrow">Legal</p>
        <h1 style={{ fontSize: 34, margin: "0 0 8px" }}>Privacy Policy</h1>
        <p style={{ color: "var(--text-muted)", fontSize: 14, marginBottom: 32 }}>
          Last updated: June 5, 2026
        </p>

        <div className="legal-content">
          <h2>Information we collect</h2>
          <p>
            We collect information you provide when creating an account, including
            your name, email address, and company details. We also store data you
            enter into the platform, such as customer records and quotes.
          </p>

          <h2>How we use your information</h2>
          <p>
            Your data is used solely to provide and improve the QuoteCraft service.
            We do not sell personal information to third parties.
          </p>

          <h2>Data retention</h2>
          <p>
            We retain your data for as long as your account is active. Upon account
            deletion, your data is permanently removed within 30 days.
          </p>

          <h2>Third-party services</h2>
          <p>
            QuoteCraft uses Stripe for payment processing. Your payment details are
            handled by Stripe and are never stored on our servers.
          </p>

          <h2>Contact</h2>
          <p>
            For privacy-related inquiries, contact support@quotecraft.app.
          </p>
        </div>
      </div>
    </section>
  );
}
