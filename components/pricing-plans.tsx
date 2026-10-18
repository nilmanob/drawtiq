"use client";

import { useState } from "react";
import Link from "next/link";

type Plan = {
  name: string;
  tagline: string;
  monthly: number;
  quarterly: number;
  features: string[];
  featured?: boolean;
  cta: string;
};

const plans: Plan[] = [
  {
    name: "Essential",
    tagline: "For focused, one-at-a-time design needs.",
    monthly: 2400,
    quarterly: 2000,
    cta: "Start with Essential",
    features: [
      "One active request at a time",
      "UI/UX or graphic design",
      "Two revision rounds per request",
      "Weekly progress updates",
      "Async collaboration in your tools",
      "Pause or cancel anytime",
    ],
  },
  {
    name: "Growth",
    tagline: "For teams shipping continuously.",
    monthly: 4800,
    quarterly: 4100,
    featured: true,
    cta: "Start with Growth",
    features: [
      "Two active requests in parallel",
      "All design services, including motion",
      "A dedicated design lead",
      "48-hour first response",
      "Weekly working session",
      "Design system upkeep",
      "Priority support",
    ],
  },
  {
    name: "Studio",
    tagline: "A full creative team, embedded.",
    monthly: 9600,
    quarterly: 8400,
    cta: "Talk about Studio",
    features: [
      "Unlimited request queue",
      "All services, including video editing",
      "Senior multi-disciplinary team",
      "Same-day response",
      "Strategy workshops",
      "Motion & video production",
      "Roadmap and delivery SLA",
    ],
  },
];

const money = (value: number) =>
  "$" + value.toLocaleString("en-US", { maximumFractionDigits: 0 });

export function PricingPlans() {
  const [quarterly, setQuarterly] = useState(false);

  return (
    <div className="pricing">
      <div className="pricing-toggle" role="group" aria-label="Billing period">
        <button
          type="button"
          className={quarterly ? "" : "active"}
          aria-pressed={!quarterly}
          onClick={() => setQuarterly(false)}
        >
          Monthly
        </button>
        <button
          type="button"
          className={quarterly ? "active" : ""}
          aria-pressed={quarterly}
          onClick={() => setQuarterly(true)}
        >
          Quarterly <span>save 15%</span>
        </button>
      </div>

      <div className="pricing-grid">
        {plans.map((plan) => (
          <article
            key={plan.name}
            className={`pricing-card reveal${plan.featured ? " featured" : ""}`}
          >
            {plan.featured && <span className="pricing-flag mono">Most popular</span>}
            <h2>{plan.name}</h2>
            <p className="pricing-tagline">{plan.tagline}</p>
            <p className="pricing-price">
              <strong>{money(quarterly ? plan.quarterly : plan.monthly)}</strong>
              <span>/ month</span>
            </p>
            <p className="pricing-note">
              {quarterly ? "Billed quarterly · pause anytime" : "Rolling monthly · cancel anytime"}
            </p>
            <Link href="/contact" className="button button-dark pricing-cta">
              {plan.cta} <span>↗</span>
            </Link>
            <ul className="pricing-features">
              {plan.features.map((feature) => (
                <li key={feature}>{feature}</li>
              ))}
            </ul>
          </article>
        ))}
      </div>
    </div>
  );
}
