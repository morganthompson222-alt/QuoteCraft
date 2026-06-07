import { AuthForm } from "../../components/auth/AuthForm";

export default function LoginPage() {
  return (
    <section className="auth-page">
      <div className="auth-page__inner">
        <div className="auth-page__intro">
          <p className="hero__eyebrow">QuoteCraft</p>
          <h1>Sign in to keep quotes moving.</h1>
          <p>
            Return to your workspace to manage customers, review quote drafts,
            and prepare approval-ready PDFs.
          </p>
        </div>

        <AuthForm mode="login" />
      </div>
    </section>
  );
}
