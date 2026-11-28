import React from "react";
import Link from "next/link";
import Image from "next/image";

export default function TermsPage() {
  return (
    <div className="landing-viewport">
      {/* Pill Navbar */}
      <header className="landing-navbar-wrapper">
        <nav className="landing-navbar">
          <Link href="/" className="landing-nav-logo">
            <Image
              src="/fitted-name.png"
              alt="Fitted"
              width={110}
              height={30}
              priority
            />
          </Link>

          <Link href="/app" className="landing-btn-launch">
            Launch App
          </Link>
        </nav>
      </header>

      {/* Main Content */}
      <main className="legal-page-container">
        <Link href="/" className="legal-back-link">
          <svg
            width={14}
            height={14}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M15 19l-7-7 7-7" />
          </svg>
          <span>Back to Home</span>
        </Link>

        <h1 className="legal-title">Terms of Service</h1>
        <p className="legal-updated">Last updated: November 2026</p>

        <div>
          <section className="legal-section">
            <h2 className="legal-section-title">1. Acceptance of Terms</h2>
            <p className="legal-section-text">
              By accessing or using Fitted, you agree to these Terms of Service. Fitted provides tools for formatting, structuring, and line-budgeting professional resumes in an academic Harvard format.
            </p>
          </section>

          <section className="legal-section">
            <h2 className="legal-section-title">2. Accuracy & Authenticity</h2>
            <p className="legal-section-text">
              Fitted operates under a strict &ldquo;Copy, never compose&rdquo; standard. The tool formats and prioritizes your existing CV credentials. You remain solely responsible for the authenticity and factual accuracy of the information in your CV and job applications.
            </p>
          </section>

          <section className="legal-section">
            <h2 className="legal-section-title">3. Intellectual Property</h2>
            <p className="legal-section-text">
              All resume contents, career histories, and documents generated from your source data belong exclusively to you. Fitted claims zero ownership over your career data.
            </p>
          </section>

          <section className="legal-section">
            <h2 className="legal-section-title">4. Contact & Inquiries</h2>
            <p className="legal-section-text">
              Questions, bug reports, or feedback can be sent directly to{" "}
              <a href="mailto:vardz.dev@gmail.com" style={{ color: "#000000", textDecoration: "underline", fontWeight: 500 }}>
                vardz.dev@gmail.com
              </a>.
            </p>
          </section>
        </div>
      </main>

      {/* Footer */}
      <footer className="landing-footer">
        <div>© {new Date().getFullYear()} Fitted. All rights reserved.</div>
        <div className="landing-footer-links">
          <Link href="/" className="landing-footer-link">
            Home
          </Link>
          <Link href="/privacy" className="landing-footer-link">
            Privacy
          </Link>
          <Link href="/app" className="landing-footer-link">
            App
          </Link>
        </div>
      </footer>
    </div>
  );
}
