import React from "react";
import Link from "next/link";
import Image from "next/image";

export default function LandingPage() {
  return (
    <div className="landing-viewport">
      {/* 1. MINIMALIST PILL-SHAPED NAVBAR */}
      <header className="landing-navbar-wrapper stagger-1">
        <nav className="landing-navbar">
          <Link href="/" className="landing-nav-logo">
            <Image
              src="/fitted-name.png"
              alt="Fitted"
              width={105}
              height={28}
              priority
            />
          </Link>

          <div className="landing-nav-links">
            <a href="#problem" className="landing-nav-link">
              Problem
            </a>
            <a href="#features" className="landing-nav-link">
              Features
            </a>
            <a href="#feedback" className="landing-nav-link">
              Feedback
            </a>
          </div>

          <Link href="/app" className="landing-btn-launch">
            Launch App
          </Link>
        </nav>
      </header>

      {/* MAIN CONTENT */}
      <main style={{ flex: 1 }}>
        {/* 2. HERO SECTION */}
        <section className="landing-hero stagger-2">
          <div className="landing-pill-tag">
            <span className="landing-pill-dot" />
            <span>Deterministic CV Tailoring • Zero LLM Hallucinations</span>
          </div>

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
        </section>

        {/* 3. PROBLEM SECTION */}
        <section id="problem" className="landing-section stagger-3">
          <div className="landing-section-header">
            <span className="landing-section-tag">The Problem</span>
            <h2 className="landing-section-title">
              Why traditional CVs fail to land interviews.
            </h2>
            <p className="landing-section-subtitle">
              Recruiters scan in 6 seconds. Most applicant resumes get rejected before reaching hiring managers.
            </p>
          </div>

          <div className="landing-problem-grid">
            <div className="landing-problem-card">
              <span className="landing-problem-num">01</span>
              <h3 className="landing-problem-card-title">The Two-Page Trap</h3>
              <p className="landing-problem-card-desc">
                Multi-page early-to-mid career resumes dilute your strongest technical achievements. Recruiters prioritize high-density, single-page profiles.
              </p>
            </div>

            <div className="landing-problem-card">
              <span className="landing-problem-num">02</span>
              <h3 className="landing-problem-card-title">Generative AI Hallucinations</h3>
              <p className="landing-problem-card-desc">
                Standard AI resume tools fabricate metrics, invent libraries you never touched, and rewrite responsibilities you cannot defend in interviews.
              </p>
            </div>

            <div className="landing-problem-card">
              <span className="landing-problem-num">03</span>
              <h3 className="landing-problem-card-title">ATS Font & Table Glitches</h3>
              <p className="landing-problem-card-desc">
                Multi-column designs, tables, and decorative icon fonts turn into broken unicode question marks inside enterprise applicant tracking systems.
              </p>
            </div>
          </div>
        </section>

        {/* 4. FEATURE SECTION */}
        <section id="features" className="landing-section stagger-4">
          <div className="landing-section-header">
            <span className="landing-section-tag">The Solution</span>
            <h2 className="landing-section-title">
              Engineered for absolute accuracy.
            </h2>
            <p className="landing-section-subtitle">
              Every section, bullet, and line is budgeted with mathematical precision.
            </p>
          </div>

          <div className="landing-features-grid">
            <div className="landing-feature-item">
              <div className="landing-feature-dot">1</div>
              <h3 className="landing-feature-title">Strict 1-Page Harvard Budget</h3>
              <p className="landing-feature-desc">
                A mathematical 56-line budget guarantees your resume fits exactly one A4 page without font shrinking or margin compression.
              </p>
            </div>

            <div className="landing-feature-item">
              <div className="landing-feature-dot">2</div>
              <h3 className="landing-feature-title">Copy, Never Compose</h3>
              <p className="landing-feature-desc">
                Pure deterministic ranking. Every bullet point, credential, degree, and role in your output is verified verbatim from your source CV.
              </p>
            </div>

            <div className="landing-feature-item">
              <div className="landing-feature-dot">3</div>
              <h3 className="landing-feature-title">100% ATS-Compliant PDF</h3>
              <p className="landing-feature-desc">
                Built with real vector text streams, Times-Roman typography, recognized heading hierarchies, and zero private-use glyphs.
              </p>
            </div>
          </div>
        </section>

        {/* 5. ENCOURAGING BANNER */}
        <section className="landing-banner">
          <span className="landing-banner-tag">Get Fitted</span>
          <h2 className="landing-banner-title">
            Ready to tailor your CV in seconds?
          </h2>
          <p className="landing-banner-desc">
            No sign-up required. Upload your CV as a PDF, enter your target role, and download your Harvard-style one-page resume immediately.
          </p>
          <Link href="/app" className="landing-btn-banner">
            Tailor Your Resume Now
          </Link>
        </section>

        {/* 6. CTA / FEEDBACK SECTION */}
        <section id="feedback" className="landing-section" style={{ textAlign: "center" }}>
          <div className="landing-section-header">
            <span className="landing-section-tag">Suggestions & Feedback</span>
            <h2 className="landing-section-title">
              Help us make Fitted even better.
            </h2>
            <p className="landing-section-subtitle">
              Have a suggestion, feedback, or a feature request? We read and appreciate every email.
            </p>
          </div>

          <a href="mailto:vardz.dev@gmail.com" className="landing-feedback-box">
            <svg
              width={15}
              height={15}
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect width={20} height={16} x={2} y={4} rx={2} />
              <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
            </svg>
            <span>vardz.dev@gmail.com</span>
          </a>
        </section>
      </main>

      {/* 7. MINIMALIST FOOTER */}
      <footer className="landing-footer">
        <div>© {new Date().getFullYear()} Fitted. Deterministic, ATS-compliant resume tailoring.</div>
        <div className="landing-footer-links">
          <Link href="/privacy" className="landing-footer-link">
            Privacy
          </Link>
          <Link href="/terms" className="landing-footer-link">
            Terms
          </Link>
          <Link href="/app" className="landing-footer-link">
            App
          </Link>
          <a href="mailto:vardz.dev@gmail.com" className="landing-footer-link">
            Contact
          </a>
        </div>
      </footer>
    </div>
  );
}
