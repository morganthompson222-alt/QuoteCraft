import Link from "next/link";

export default function NotFound() {
  return (
    <section className="error-page">
      <div className="error-page__inner">
        <span className="error-page__code">404</span>
        <h1>Page not found</h1>
        <p>The page you&apos;re looking for doesn&apos;t exist or has been moved.</p>
        <Link className="button button--primary" href="/dashboard">
          Go to dashboard
        </Link>
      </div>
    </section>
  );
}
