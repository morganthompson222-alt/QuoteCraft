"use client";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <section className="error-page">
      <div className="error-page__inner">
        <span className="error-page__code">Error</span>
        <h1>Something went wrong</h1>
        <p>{error.message || "An unexpected error occurred. Please try again."}</p>
        <button className="button button--primary" type="button" onClick={reset}>
          Try again
        </button>
      </div>
    </section>
  );
}
