"use client";

import Link from "next/link";
import { FormEvent, useMemo, useState } from "react";

type AuthMode = "login" | "signup";

type AuthErrors = {
  name?: string;
  email?: string;
  password?: string;
};

type AuthFormProps = {
  mode: AuthMode;
};

type AuthResponse = {
  userId: string;
  email: string;
  token: string;
};

type ApiErrorResponse = {
  error?: { message?: string; statusCode?: number };
  message?: string;
};

function validateEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function validateAuthForm(mode: AuthMode, values: AuthErrors): AuthErrors {
  const errors: AuthErrors = {};

  if (mode === "signup" && !values.name?.trim()) {
    errors.name = "Name is required.";
  }

  if (!values.email?.trim()) {
    errors.email = "Email is required.";
  } else if (!validateEmail(values.email)) {
    errors.email = "Enter a valid email address.";
  }

  if (!values.password) {
    errors.password = "Password is required.";
  } else if (values.password.length < 8) {
    errors.password = "Password must be at least 8 characters.";
  }

  return errors;
}

export function AuthForm({ mode }: AuthFormProps) {
  const isSignup = mode === "signup";
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [region, setRegion] = useState("UK");
  const [tosAccepted, setTosAccepted] = useState(false);
  const [errors, setErrors] = useState<AuthErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [apiError, setApiError] = useState("");

  const canSubmit = useMemo(() => {
    const hasRequiredFields = isSignup
      ? name.trim().length > 0 && email.trim().length > 0 && password.length > 0 && tosAccepted
      : email.trim().length > 0 && password.length > 0;

    return hasRequiredFields && !isSubmitting;
  }, [email, isSignup, isSubmitting, name, password, tosAccepted]);

  async function readErrorMessage(response: Response) {
    try {
      const data = (await response.json()) as ApiErrorResponse;
      return data.error?.message ?? data.message ?? "Authentication failed.";
    } catch {
      return "Authentication failed.";
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const nextErrors = validateAuthForm(mode, { name, email, password });
    setErrors(nextErrors);
    setApiError("");

    if (Object.keys(nextErrors).length > 0) {
      return;
    }

    setIsSubmitting(true);

    try {
      const endpoint = isSignup ? "/api/auth/signup" : "/api/auth/login";
      const body = isSignup
        ? { email, password, name: name.trim() || undefined, region_code: region }
        : { email, password };

      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        throw new Error(await readErrorMessage(response));
      }

      const data = (await response.json()) as AuthResponse;
      window.localStorage.setItem("quotecraft_token", data.token);
      window.localStorage.setItem("quotecraft_region", region);
      document.cookie = "quotecraft_auth=true; path=/; max-age=604800; SameSite=Lax; Secure";
      window.location.assign("/dashboard");
    } catch (error) {
      setApiError(
        error instanceof Error
          ? error.message
          : "Unable to authenticate. Please try again.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <section className="auth-card" aria-labelledby={`${mode}-title`}>
      <div className="auth-card__header">
        <h2 className="auth-card__title" id={`${mode}-title`}>
          {isSignup ? "Create your workspace" : "Welcome back"}
        </h2>
        <p className="auth-card__subtitle">
          {isSignup
            ? "Start a QuoteCraft account for your service team."
            : "Use your workspace credentials to continue."}
        </p>
      </div>

      <form className="auth-form" onSubmit={handleSubmit} noValidate>
        {isSignup ? (
          <div className="field">
            <label htmlFor="name">Name</label>
            <input
              id="name"
              name="name"
              type="text"
              autoComplete="name"
              value={name}
              onChange={(event) => setName(event.target.value)}
              aria-invalid={Boolean(errors.name)}
              aria-describedby={errors.name ? "name-error" : undefined}
            />
            {errors.name ? (
              <p className="field__error" id="name-error">
                {errors.name}
              </p>
            ) : null}
          </div>
        ) : null}

        {isSignup ? (
          <div className="field">
            <label htmlFor="region">Region</label>
            <select
              id="region"
              name="region"
              value={region}
              onChange={(event) => setRegion(event.target.value)}
              style={{
                border: "1px solid var(--border-strong)",
                borderRadius: 8,
                color: "var(--text)",
                outline: "none",
                padding: "10px 12px",
                width: "100%",
                font: "inherit",
                backgroundColor: "var(--surface)",
                minHeight: 44,
              }}
            >
              <option value="UK">United Kingdom (£)</option>
              <option value="US">United States ($)</option>
              <option value="CA">Canada (C$)</option>
              <option value="AU">Australia (A$)</option>
              <option value="EU">European Union (€)</option>
            </select>
          </div>
        ) : null}

        <div className="field">
          <label htmlFor="email">Email</label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            aria-invalid={Boolean(errors.email)}
            aria-describedby={errors.email ? "email-error" : undefined}
          />
          {errors.email ? (
            <p className="field__error" id="email-error">
              {errors.email}
            </p>
          ) : null}
        </div>

        <div className="field">
          <div className="field__topline">
            <label htmlFor="password">Password</label>
            {!isSignup ? (
              <Link className="field__link" href="/forgot-password">
                Forgot password?
              </Link>
            ) : null}
          </div>
          <input
            id="password"
            name="password"
            type="password"
            autoComplete={isSignup ? "new-password" : "current-password"}
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            aria-invalid={Boolean(errors.password)}
            aria-describedby={errors.password ? "password-error" : undefined}
          />
          {errors.password ? (
            <p className="field__error" id="password-error">
              {errors.password}
            </p>
          ) : null}
        </div>

        {isSignup ? (
          <div className="field">
            <label className="field__checkbox">
              <input
                type="checkbox"
                checked={tosAccepted}
                onChange={(event) => setTosAccepted(event.target.checked)}
              />
              <span>
                I agree to the{" "}
                <Link href="/terms" target="_blank" className="auth-form__link">
                  Terms of Service
                </Link>{" "}
                and{" "}
                <Link href="/privacy" target="_blank" className="auth-form__link">
                  Privacy Policy
                </Link>
              </span>
            </label>
          </div>
        ) : null}

        {apiError ? (
          <div className="auth-form__error" role="alert">
            {apiError}
          </div>
        ) : null}

        <button
          className="button button--primary auth-form__button"
          disabled={!canSubmit}
          type="submit"
        >
          {isSubmitting
            ? isSignup
              ? "Creating..."
              : "Checking..."
            : isSignup
              ? "Create account"
              : "Sign in"}
        </button>

        <p className="auth-form__footer">
          {isSignup ? "Already have an account? " : "New to QuoteCraft? "}
          <Link
            className="auth-form__link"
            href={isSignup ? "/login" : "/signup"}
          >
            {isSignup ? "Log in" : "Create an account"}
          </Link>
        </p>
      </form>
    </section>
  );
}
