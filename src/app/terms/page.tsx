import React from "react";
import Link from "next/link";
import Image from "next/image";

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-white text-zinc-900 flex flex-col justify-between selection:bg-black selection:text-white">
      {/* Pill Navbar */}
      <header className="sticky top-5 z-50 px-8 sm:px-16 md:px-24 lg:px-32 xl:px-44">
        <nav className="max-w-4xl mx-auto px-5 py-2.5 rounded-full border border-zinc-200/80 bg-white/90 backdrop-blur-md shadow-[0_2px_12px_rgba(0,0,0,0.04)] flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="relative h-7 w-24 flex items-center">
              <Image
                src="/fitted-name.png"
                alt="Fitted"
                width={120}
                height={35}
                className="h-6 w-auto object-contain"
                priority
              />
            </div>
          </Link>

          <Link
            href="/app"
            className="inline-flex items-center justify-center px-4 py-1.5 text-xs font-semibold rounded-full bg-black text-white hover:bg-zinc-800 transition-colors shadow-sm"
          >
            Launch App
          </Link>
        </nav>
      </header>

      {/* Main Content */}
      <main className="px-8 sm:px-16 md:px-24 lg:px-32 xl:px-44 py-16 flex-1 max-w-4xl mx-auto w-full">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs font-medium text-zinc-500 hover:text-black mb-8 transition-colors"
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          <span>Back to Home</span>
        </Link>

        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-zinc-950 mb-3">Terms of Service</h1>
        <p className="text-xs font-mono text-zinc-400 mb-10">Last updated: November 2026</p>

        <div className="space-y-8 text-sm leading-relaxed text-zinc-600">
          <section className="space-y-2">
            <h2 className="text-base font-semibold text-zinc-950">1. Acceptance of Terms</h2>
            <p>
              By accessing or using Fitted, you agree to these Terms of Service. Fitted provides tools for formatting, structuring, and line-budgeting professional resumes in an academic Harvard format.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-semibold text-zinc-950">2. Accuracy & Authenticity</h2>
            <p>
              Fitted operates under a strict "Copy, never compose" standard. The tool formats and prioritizes your existing CV credentials. You remain solely responsible for the authenticity and factual accuracy of the information in your CV and job applications.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-semibold text-zinc-950">3. Intellectual Property</h2>
            <p>
              All resume contents, career histories, and documents generated from your source data belong exclusively to you. Fitted claims zero ownership over your career data.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-semibold text-zinc-950">4. Contact & Inquiries</h2>
            <p>
              Questions, bug reports, or feedback can be sent directly to{" "}
              <a href="mailto:vardz.dev@gmail.com" className="text-black underline font-medium">
                vardz.dev@gmail.com
              </a>.
            </p>
          </section>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full border-t border-zinc-100 py-8 px-8 sm:px-16 md:px-24 lg:px-32 xl:px-44 text-xs text-zinc-500">
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>© {new Date().getFullYear()} Fitted. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <Link href="/" className="hover:text-black transition-colors">
              Home
            </Link>
            <Link href="/privacy" className="hover:text-black transition-colors">
              Privacy
            </Link>
            <Link href="/app" className="hover:text-black transition-colors">
              App
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
