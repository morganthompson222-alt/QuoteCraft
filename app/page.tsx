"use client";

import Link from "next/link";
import { useRegion } from "../hooks/useRegion";

const metrics = [
  { value: "12 min", label: "average quote draft" },
  { value: "3 views", label: "dashboard-ready" },
  { value: "PDF", label: "preview workflow" },
];

const lineItems = [
  { name: "Site visit and assessment", meta: "Fixed service", amount: 180 },
  { name: "Materials and preparation", meta: "Estimated", amount: 940 },
  { name: "Installation labor", meta: "2 specialists", amount: 1280 },
];

export default function LandingPage() {
  const { formatCurrency } = useRegion();

  const total = lineItems.reduce((sum, item) => sum + item.amount, 0);

  return (
    <section className="page">
      <div className="page__inner hero">
        <div>
          <p className="hero__eyebrow">JobStacker MVP</p>
          <h1>Customer quotes without the spreadsheet shuffle.</h1>
          <p className="hero__copy">
            JobStacker gives service teams one focused place to draft quotes,
            track customers, preview totals, and prepare clean PDFs for approval.
          </p>

          <div className="hero__actions">
            <Link className="button button--primary" href="/signup">
              Start quoting
            </Link>
            <Link className="button button--secondary" href="/login">
              Log in
            </Link>
          </div>

          <div className="hero__metrics" aria-label="JobStacker workflow">
            {metrics.map((metric) => (
              <div className="metric" key={metric.label}>
                <span className="metric__value">{metric.value}</span>
                <span className="metric__label">{metric.label}</span>
              </div>
            ))}
          </div>
        </div>

        <aside className="quote-preview-card" aria-label="Sample quote preview">
          <div className="quote-preview-card__header">
            <div>
              <div className="quote-preview-card__title">Quote #1048</div>
              <span className="metric__label">Bayside Renovations</span>
            </div>
            <span className="status-pill">Draft</span>
          </div>

          <div className="quote-preview-card__rows">
            {lineItems.map((item) => (
              <div className="quote-row" key={item.name}>
                <div>
                  <span className="quote-row__name">{item.name}</span>
                  <span className="quote-row__meta">{item.meta}</span>
                </div>
                <span className="quote-row__price">{formatCurrency(item.amount)}</span>
              </div>
            ))}
          </div>

          <div className="quote-preview-card__total">
            <span>Estimated total</span>
            <strong>{formatCurrency(total)}</strong>
          </div>
        </aside>
      </div>
    </section>
  );
}
