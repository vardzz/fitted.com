import React from "react";

export default function FeedbackSection() {
  return (
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
  );
}
