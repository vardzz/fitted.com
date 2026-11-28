"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import FloatingVisuals from "./FloatingVisuals";

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
      {/* 3D Floating Harvard Resume Sheets & Orbit Sparkles */}
      <FloatingVisuals />

      <div className="landing-hero-inner">
        {/* Editorial Serif Headline with Italic "fit" */}
        <h1 className="landing-hero-title">
          Your CV, cut to <em>fit</em> the role.
        </h1>

        {/* Reference Inspo Subtitle */}
        <p className="landing-hero-desc">
          Upload your CV, choose your target role, and get a tailored, one-page
          resume that highlights what matters — no fluff, no fiction.
        </p>

        {/* Action Buttons */}
        <div className="landing-hero-actions">
          <Link href="/app" className="landing-btn-primary">
            <span>Try Fitted for Free</span>
            <span className="landing-btn-arrow" aria-hidden="true">→</span>
          </Link>
          <a href="#problem" className="landing-btn-secondary">
            Learn More
          </a>
        </div>
      </div>
    </section>
  );
}
