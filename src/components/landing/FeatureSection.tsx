import React from "react";

export default function FeatureSection() {
  return (
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
  );
}
