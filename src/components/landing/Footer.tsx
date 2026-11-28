import React from "react";
import Link from "next/link";

export default function Footer() {
  return (
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
  );
}
