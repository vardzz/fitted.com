"use client";

import React, { useEffect } from "react";
import Link from "next/link";

export default function HeroSection() {
  useEffect(() => {
    // Prevent the browser from restoring previous halfway scroll on reload
    if (typeof window !== "undefined" && "scrollRestoration" in window.history) {
      window.history.scrollRestoration = "manual";
    }
    // Always land on the hero section when opening or refreshing
    if (typeof window !== "undefined" && !window.location.hash) {
      window.scrollTo({ top: 0, left: 0, behavior: "instant" as ScrollBehavior });
    }
  }, []);

  return (
    <section className="landing-hero stagger-2">
      <div className="landing-hero-inner">
        <h1 className="landing-hero-title">
          Your CV, cut to fit the role.
        </h1>

        <p className="landing-hero-desc">
          A deterministic, rule-based engine that shapes your CV into an academic Harvard-style one-page resume. Never invents facts. 100% ATS-friendly.
        </p>

        <div className="landing-hero-actions">
          <Link href="/app" className="landing-btn-primary">
            <span>Start Tailoring — It’s Free</span>
            <svg
              width={15}
              height={15}
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
              style={{ marginLeft: 2 }}
            >
              <path d="M5 12h14" />
              <path d="m12 5 7 7-7 7" />
            </svg>
          </Link>
          <a href="#problem" className="landing-btn-secondary">
            Why Fitted?
          </a>
        </div>
      </div>
    </section>
  );
}
