import React from "react";
import Link from "next/link";
import Image from "next/image";

export default function PrivacyPage() {
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

        <h1 className="legal-title">Privacy Policy</h1>
        <p className="legal-updated">Last updated: November 2026</p>

        <div>
          <section className="legal-section">
            <h2 className="legal-section-title">1. Zero Cloud Storage of Candidate Data</h2>
            <p className="legal-section-text">
              Fitted operates on a client-first, deterministic processing model. Your uploaded CV documents and parsed profile details are processed solely in temporary memory to generate your tailored one-page resume. We do not store, retain, or sell your personal career data.
            </p>
          </section>

          <section className="legal-section">
            <h2 className="legal-section-title">2. No AI Training on Your Credentials</h2>
            <p className="legal-section-text">
              Fitted does not use third-party generative LLMs or commercial AI model training pipelines. Your CV text is never sent to external AI providers to train foundation models.
            </p>
          </section>

          <section className="legal-section">
            <h2 className="legal-section-title">3. Local PDF Generation</h2>
            <p className="legal-section-text">
              Tailored resumes are rendered into PDF format in real-time. When you download your resume, the vector PDF is created directly for your device.
            </p>
          </section>

          <section className="legal-section">
            <h2 className="legal-section-title">4. Contact & Inquiries</h2>
            <p className="legal-section-text">
              If you have any questions or privacy inquiries, contact us directly at{" "}
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
          <Link href="/terms" className="landing-footer-link">
            Terms
          </Link>
          <Link href="/app" className="landing-footer-link">
            App
          </Link>
        </div>
      </footer>
    </div>
  );
}
