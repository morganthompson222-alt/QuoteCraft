import type { Metadata } from "next";
import { AuthForm } from "../../components/auth/AuthForm";

export const metadata: Metadata = {
  title: "Sign Up — Free Quote & Job Management",
  description:
    "Start stacking jobs, quotes, and clients with JobStacker. The all-in-one quote and job management app for tradespeople. Free to start.",
  alternates: { canonical: "https://jobstacker.app/signup" },
};

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
