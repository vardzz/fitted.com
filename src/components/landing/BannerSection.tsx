import React from "react";
import Link from "next/link";

export default function BannerSection() {
  return (
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
  );
}
