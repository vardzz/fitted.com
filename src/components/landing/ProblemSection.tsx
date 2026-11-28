import React from "react";

export default function ProblemSection() {
  return (
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
  );
}
