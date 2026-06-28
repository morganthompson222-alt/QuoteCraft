import type { Metadata } from "next";
import Link from "next/link";
import { Breadcrumbs } from "../../components/seo/Breadcrumbs";
import { FAQ } from "../../components/seo/FAQ";
import { CTA } from "../../components/seo/CTA";

export const metadata: Metadata = {
  title: "Lead Generation for Tradespeople | Get More Customers | JobStacker",
  description:
    "Complete guide to lead generation for tradespeople. Learn how electricians, plumbers, builders and contractors can get more customers consistently.",
  alternates: { canonical: "https://jobstacker.app/leads-for-tradespeople" },
};

export default function Page() {
  return (
    <section style={{ maxWidth: 800, margin: "0 auto", padding: "40px 20px" }}>
      <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Lead Generation for Tradespeople" }]} />

      <h1 style={{ fontSize: 36, fontWeight: 800, lineHeight: 1.15, marginBottom: 16 }}>
        Lead Generation for Tradespeople
      </h1>
      <p style={{ fontSize: 18, color: "var(--text-muted)", lineHeight: 1.7, marginBottom: 32 }}>
        A practical guide to getting more customers for your trade business — from Google Maps to referrals, ads to repeat business.
      </p>

      <h2>Why tradespeople struggle with leads</h2>
      <p>
        Most tradespeople start with word of mouth. A neighbour recommends you, you do a good job, they tell someone else. This works until it doesn't — when a quiet month hits or a competitor opens nearby. The businesses that survive long-term are the ones that build a system for generating leads, not a hope.
      </p>

      <h2>1. Google Business Profile (free, highest ROI)</h2>
      <p>
        When someone searches "electrician near me", Google shows three local results before anything else. If your Google Business Profile isn't claimed, verified, and optimised, you're invisible to the highest-intent leads available. Fill in every field, add 20+ photos, respond to every review, and post weekly updates.
      </p>

      <h2>2. Referral system (turn customers into lead generators)</h2>
      <p>
        Happy customers are your best marketing channel — but they won't refer you unless you ask. Build a simple referral system: after every completed job, ask for a review and a referral. A small discount on their next service for every referral that converts works well. Track referrals in JobStacker so you know which customers send you the most business.
      </p>
      <p>
        <Link href="/blog/how-electricians-can-get-more-leads">Read more about referral strategies for electricians</Link>
      </p>

      <h2>3. Local SEO (get found on Google)</h2>
      <p>
        Beyond Google Business Profile, having a simple website with your service areas, trade types, and contact details helps Google understand where you work and what you do. Each of our trade-specific pages — like <Link href="/crm-for-electricians">CRM for electricians</Link>, <Link href="/crm-for-plumbers">CRM for plumbers</Link>, and <Link href="/crm-for-builders">CRM for builders</Link> — is designed to help with exactly this.
      </p>

      <h2>4. Paid ads (when you want leads fast)</h2>
      <p>
        Google Ads and Facebook Ads can generate leads on demand, but they require careful targeting to be profitable. Start with a small budget (£200-500/month), target your specific trade and postcode areas, and track every lead source so you know what's working. Most tradespeople waste money on ads because they don't track which leads come from which channel.
      </p>

      <h2>5. Repeat business (the cheapest lead)</h2>
      <p>
        The easiest customer to win is one you've already worked for. Use JobStacker to set reminders for annual services, send follow-up messages after jobs, and keep your business top of mind. A simple "it's been 12 months since your last service" message generates more repeat work than any advert.
      </p>
      <p>
        <Link href="/blog/how-plumbers-can-stop-losing-customers">How plumbers can stop losing customers to competitors</Link> — <Link href="/blog/best-apps-for-tradespeople">Best apps for tradespeople</Link>
      </p>

      <h2>How JobStacker helps with lead management</h2>
      <p>
        Most tradespeople lose leads because they're slow to respond, forget to follow up, or don't have a professional quote ready. JobStacker solves all three: create branded quotes in minutes, send share links that customers can accept on their phone, and track every outstanding quote so nothing slips through. <Link href="/signup">Start free — no credit card needed.</Link>
      </p>

      <FAQ items={[
        { q: "What's the cheapest way to get more leads?", a: "Google Business Profile is free and the highest ROI. Optimise it fully before spending anything on ads." },
        { q: "How do I track where my leads come from?", a: "Ask every new customer how they found you and record it in JobStacker. After 50 customers, you'll know exactly what works." },
        { q: "Should I use Google Ads?", a: "Yes, but start small (£200/month) and track everything. Most tradespeople spend too much on ads because they don't measure results." },
        { q: "How many leads should I follow up on?", a: "Every single one. Research shows 80% of sales require at least 5 follow-ups. Most tradespeople give up after 1." },
      ]} />
      <CTA />
    </section>
  );
}
