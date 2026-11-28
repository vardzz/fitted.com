import React from "react";
import Link from "next/link";
import Image from "next/image";

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-white text-zinc-900 flex flex-col justify-between selection:bg-black selection:text-white">
      {/* Navigation */}
      <header className="w-full max-w-5xl mx-auto px-6 py-6 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-8 h-8 relative rounded-md overflow-hidden bg-black flex items-center justify-center p-1">
            <Image
              src="/fitted-logo.png"
              alt="Fitted Logo"
              width={24}
              height={24}
              className="object-contain"
              priority
            />
          </div>
          <span className="font-semibold text-lg tracking-tight text-zinc-950">Fitted</span>
        </Link>

        <nav className="flex items-center gap-4">
          <Link
            href="/app"
            className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium rounded-full bg-black text-white hover:bg-zinc-800 transition-colors shadow-sm"
          >
            Open App
          </Link>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="w-full max-w-3xl mx-auto px-6 py-20 text-center flex flex-col items-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-zinc-200 bg-zinc-50 text-xs font-mono text-zinc-600 mb-8">
          <span className="w-1.5 h-1.5 rounded-full bg-zinc-900 animate-pulse" />
          <span>Rule-Based CV Tailoring — No LLM Hallucinations</span>
        </div>

        <h1 className="text-4xl sm:text-6xl font-bold tracking-tight text-zinc-950 mb-6 max-w-2xl leading-[1.1]">
          Your CV, cut to fit the role.
        </h1>

        <p className="text-lg sm:text-xl text-zinc-600 mb-10 max-w-xl font-normal leading-relaxed">
          Craft an academic Harvard-style one-page resume tailored to any target role.
          100% faithful to your source CV, strictly budgeted to one page, and ATS-compliant.
        </p>

        <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
          <Link
            href="/app"
            className="w-full sm:w-auto inline-flex items-center justify-center px-8 py-3.5 text-base font-medium rounded-full bg-black text-white hover:bg-zinc-800 transition-all shadow-md group"
          >
            <span>Start Tailoring</span>
            <svg
              className="w-4 h-4 ml-2 transition-transform group-hover:translate-x-1"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </Link>
        </div>
      </section>

      {/* Feature Highlights */}
      <section className="w-full max-w-4xl mx-auto px-6 py-12 border-t border-zinc-100">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="space-y-2">
            <h3 className="font-semibold text-zinc-950 text-base">Harvard 1-Page Layout</h3>
            <p className="text-sm text-zinc-500 leading-relaxed">
              Deterministic line-budget algorithm guarantees your resume stays on exactly one page without font shrinking.
            </p>
          </div>

          <div className="space-y-2">
            <h3 className="font-semibold text-zinc-950 text-base">Zero Hallucinations</h3>
            <p className="text-sm text-zinc-500 leading-relaxed">
              Copy, never compose. Every single bullet, date, credential, and skill in the output is verified verbatim from your source CV.
            </p>
          </div>

          <div className="space-y-2">
            <h3 className="font-semibold text-zinc-950 text-base">100% ATS-Friendly</h3>
            <p className="text-sm text-zinc-500 leading-relaxed">
              Single-column hierarchy, real vector text streams, standard headings, and zero private-use icon font corruptions.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="w-full border-t border-zinc-100 py-6 text-center text-xs text-zinc-400">
        <p>Fitted — Deterministic, ATS-Compliant Resume Tailoring</p>
      </footer>
    </main>
  );
}
