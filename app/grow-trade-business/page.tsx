import type { Metadata } from "next";
import Link from "next/link";
import { Breadcrumbs } from "../../components/seo/Breadcrumbs";
import { FAQ } from "../../components/seo/FAQ";
import { CTA } from "../../components/seo/CTA";

export const metadata: Metadata = {
  title: "How to Grow a Trade Business | Scaling Guide | JobStacker",
  description:
    "Complete guide to growing your trade business. Systems for getting more leads, hiring staff, managing finances, and scaling beyond a one-man band.",
  alternates: { canonical: "https://jobstacker.app/grow-trade-business" },
};

export default function Page() {
  return (
    <section style={{ maxWidth: 800, margin: "0 auto", padding: "40px 20px" }}>
      <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "How to Grow a Trade Business" }]} />

      <h1 style={{ fontSize: 36, fontWeight: 800, lineHeight: 1.15, marginBottom: 16 }}>
        How to Grow a Trade Business
      </h1>
      <p style={{ fontSize: 18, color: "var(--text-muted)", lineHeight: 1.7, marginBottom: 32 }}>
        Scaling a trade business isn't about working harder — it's about building systems that let you work smarter. Here's how to grow without burning out.
      </p>

      <h2>The growth ceiling every tradesperson hits</h2>
      <p>
        Every trade business reaches a point where the owner has more work than they can handle alone. The instinct is to work longer hours, but that leads to burnout, mistakes, and unhappy customers. The only way through is to build systems — for getting leads, delivering work, managing finances, and hiring people.
      </p>

      <h2>System 1: Lead generation that doesn't depend on you</h2>
      <p>
        Word of mouth is great, but it's unpredictable. Build multiple channels: Google Business Profile (free, highest ROI), a simple website with your service areas, customer referral programme with small discounts, and relationships with estate agents, letting agents and local businesses who can recommend you. See our full <Link href="/leads-for-tradespeople">lead generation guide for more detail</Link>.
      </p>
      <p>
        <Link href="/blog/how-electricians-can-get-more-leads">How electricians can get more leads</Link>
      </p>

      <h2>System 2: Streamlined quoting and job delivery</h2>
      <p>
        Every hour you spend re-typing quotes or chasing paper is an hour you're not earning. A standardised quoting process — same template, same follow-up schedule, same acceptance flow — saves time and wins more work. Use <Link href="/quote-software">quoting software</Link> that creates professional quotes in minutes and lets customers accept online.
      </p>
      <p>
        <Link href="/blog/how-to-write-a-professional-plumbing-quote">How to write a professional quote</Link> — <Link href="/blog/common-quoting-mistakes">Common quoting mistakes</Link>
      </p>

      <h2>System 3: Financial management that shows you the truth</h2>
      <p>
        Most tradespeople don't know their numbers — their true cost per job, profit margins, or which services are most profitable. JobStacker's dashboard shows your revenue, outstanding quotes, and upcoming jobs at a glance. <Link href="/blog/best-apps-for-tradespeople">Best apps for tradespeople</Link> covers tools that pair well with it.
      </p>

      <h2>System 4: Hiring your first employee</h2>
      <p>
        Hiring is the scariest step for most tradespeople. The key is to document your processes first — how you quote, how you schedule, how you communicate with customers — so your new hire can follow your system instead of learning by trial and error. JobStacker helps because every customer, quote, and job is already tracked in one place.
      </p>

      <h2>System 5: Customer retention</h2>
      <p>
        The cheapest customer is one you already have. Use JobStacker to send annual service reminders, follow up after every job, and keep your business top of mind. A customer who comes back every year for their boiler service is worth more than ten one-off jobs.
      </p>
      <p>
        <Link href="/blog/how-to-grow-a-service-business">Read the full guide to growing a service business</Link> — <Link href="/blog/best-apps-for-tradespeople">Best apps for tradespeople</Link>
      </p>

      <h2>How JobStacker helps growing businesses</h2>
      <p>
        JobStacker is built for trade businesses that want to scale. One place for customers, quotes, jobs, invoices, and scheduling. When you hire your first employee, they can see everything they need without you having to explain it. <Link href="/signup">Start free — no credit card needed.</Link>
      </p>

      <FAQ items={[
        { q: "When should I hire my first employee?", a: "When you're turning down work because you don't have time, and you have enough recurring revenue to cover their wages for 3 months." },
        { q: "How do I know which services are most profitable?", a: "Track your time and materials per job. JobStacker's dashboard shows your revenue and you can compare profitability across services." },
        { q: "Should I raise my prices?", a: "If you're fully booked and still not making enough profit, yes. Raise prices by 10-20% and watch what happens. Most tradespeople undercharge." },
      ]} />
      <CTA />
    </section>
  );
}
