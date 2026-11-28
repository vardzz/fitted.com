import React from "react";
import Link from "next/link";
import Image from "next/image";

export default function Navbar() {
  return (
    <header className="landing-navbar-wrapper stagger-1">
      <nav className="landing-navbar">
        <Link href="/" className="landing-nav-logo" aria-label="Fitted Home">
          <Image
            src="/fitted-name.png"
            alt="Fitted"
            width={120}
            height={38}
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
  );
}
