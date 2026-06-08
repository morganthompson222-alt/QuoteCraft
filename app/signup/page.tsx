import { AuthForm } from "../../components/auth/AuthForm";

export default function SignupPage() {
  return (
    <section className="auth-page">
      <div className="auth-page__inner">
        <div className="auth-page__intro">
          <p className="hero__eyebrow">JobStacker</p>
          <h1>Create a quoting workspace your team can trust.</h1>
          <p>
            Set up a clean workflow for customer records, quote drafts, previews,
            and exports as the MVP grows.
          </p>
        </div>

        <AuthForm mode="signup" />
      </div>
    </section>
  );
}
