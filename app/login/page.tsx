import { AuthForm } from "../../components/auth/AuthForm";

export default function LoginPage() {
  return (
    <section className="auth-page">
      <div className="auth-page__inner">
        <div className="auth-page__intro">
          <p className="hero__eyebrow">JobStacker</p>
          <h1>Welcome back. Keep stacking.</h1>
          <p>
            Sign in to manage your customers, quotes, jobs, and calendar
            — all in one place.
          </p>
        </div>

        <AuthForm mode="login" />
      </div>
    </section>
  );
}
