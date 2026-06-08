import { AuthForm } from "../../components/auth/AuthForm";

export default function SignupPage() {
  return (
    <section className="auth-page">
      <div className="auth-page__inner">
        <div className="auth-page__intro">
          <p className="hero__eyebrow">JobStacker</p>
          <h1>Start stacking jobs, quotes, and clients.</h1>
          <p>
            One workspace for your customers, quotes, jobs, and calendar.
            No spreadsheets, no shuffle.
          </p>
        </div>

        <AuthForm mode="signup" />
      </div>
    </section>
  );
}
