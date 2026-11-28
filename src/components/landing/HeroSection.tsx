"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
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
        {/* Simple Clean Sans-Serif Headline per design.md */}
        <h1 className="landing-hero-title">
          Your CV, cut to fit the role.
        </h1>

        {/* Clean Subtitle without emdash */}
        <p className="landing-hero-desc">
          Upload your CV, choose your target role, and get a tailored, one-page
          resume that highlights what matters. No fluff, no fiction.
        </p>

        {/* Action Buttons */}
        <div className="landing-hero-actions">
          <Link href="/app" className="landing-btn-primary">
            <span>Try Fitted for Free</span>
            <ArrowRight size={15} strokeWidth={2} className="landing-btn-arrow" aria-hidden="true" />
          </Link>
          <a href="#problem" className="landing-btn-secondary">
            Learn More
          </a>
        </div>
      </div>
    </section>
  );
}
