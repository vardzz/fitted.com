import React from "react";
import Link from "next/link";
import Image from "next/image";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white text-zinc-900 flex flex-col justify-between selection:bg-black selection:text-white">
      {/* 1. MINIMALIST PILL-SHAPED NAVBAR */}
      <header className="sticky top-5 z-50 px-8 sm:px-16 md:px-24 lg:px-32 xl:px-44">
        <nav className="max-w-4xl mx-auto px-5 py-2.5 rounded-full border border-zinc-200/80 bg-white/90 backdrop-blur-md shadow-[0_2px_12px_rgba(0,0,0,0.04)] flex items-center justify-between transition-all">
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

          <div className="hidden sm:flex items-center gap-6 text-xs font-medium text-zinc-600">
            <a href="#problem" className="hover:text-black transition-colors">
              Problem
            </a>
            <a href="#features" className="hover:text-black transition-colors">
              Features
            </a>
            <a href="#feedback" className="hover:text-black transition-colors">
              Feedback
            </a>
          </div>

          <Link
            href="/app"
            className="inline-flex items-center justify-center px-4 py-1.5 text-xs font-semibold rounded-full bg-black text-white hover:bg-zinc-800 transition-colors shadow-sm"
          >
            Launch App
          </Link>
        </nav>
      </header>

      {/* MAIN CONTENT WITH LARGE HORIZONTAL PADDING */}
      <main className="px-8 sm:px-16 md:px-24 lg:px-32 xl:px-44 flex-1">
        {/* 2. HERO SECTION */}
        <section className="pt-20 pb-24 max-w-4xl mx-auto text-center flex flex-col items-center">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full border border-zinc-200 bg-zinc-50 text-xs font-mono text-zinc-600 mb-8">
            <span className="w-1.5 h-1.5 rounded-full bg-black" />
            <span>Deterministic CV Tailoring • Zero LLM Hallucinations</span>
          </div>

          <h1 className="text-4xl sm:text-6xl md:text-7xl font-bold tracking-tight text-zinc-950 mb-6 leading-[1.08]">
            Your CV, cut to fit the role.
          </h1>

          <p className="text-base sm:text-lg md:text-xl text-zinc-600 mb-10 max-w-2xl font-normal leading-relaxed">
            A deterministic, rule-based engine that shapes your CV into an academic Harvard-style one-page resume.
            Never invents facts. 100% ATS-friendly.
          </p>

          <div className="flex flex-col sm:flex-row items-center gap-3">
            <Link
              href="/app"
              className="inline-flex items-center justify-center px-8 py-3.5 text-sm font-medium rounded-full bg-black text-white hover:bg-zinc-800 transition-all shadow-sm group"
            >
              <span>Start Tailoring — It’s Free</span>
              <svg
                className="w-4 h-4 ml-2 transition-transform group-hover:translate-x-1"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </Link>
            <a
              href="#problem"
              className="inline-flex items-center justify-center px-6 py-3.5 text-sm font-medium text-zinc-600 hover:text-black transition-colors"
            >
              Why Fitted?
            </a>
          </div>
        </section>

        {/* 3. PROBLEM SECTION */}
        <section id="problem" className="py-20 border-t border-zinc-100 max-w-4xl mx-auto">
          <div className="text-center max-w-xl mx-auto mb-14">
            <span className="text-xs font-mono uppercase tracking-widest text-zinc-400">The Problem</span>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-zinc-950 mt-2">
              Why traditional CVs fail to land interviews.
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-xl border border-zinc-200/80 bg-zinc-50/50 space-y-3">
              <span className="text-xs font-mono text-zinc-400">01</span>
              <h3 className="font-semibold text-zinc-950 text-base">The Two-Page Trap</h3>
              <p className="text-sm text-zinc-600 leading-relaxed">
                Recruiters scan in 6 seconds. Multi-page early-to-mid career resumes dilute your strongest technical achievements and get deprioritized.
              </p>
            </div>

            <div className="p-6 rounded-xl border border-zinc-200/80 bg-zinc-50/50 space-y-3">
              <span className="text-xs font-mono text-zinc-400">02</span>
              <h3 className="font-semibold text-zinc-950 text-base">Generative AI Hallucinations</h3>
              <p className="text-sm text-zinc-600 leading-relaxed">
                Standard AI resume tools fabricate metrics, invent libraries you never touched, and rewrite responsibilities you cannot defend in interviews.
              </p>
            </div>

            <div className="p-6 rounded-xl border border-zinc-200/80 bg-zinc-50/50 space-y-3">
              <span className="text-xs font-mono text-zinc-400">03</span>
              <h3 className="font-semibold text-zinc-950 text-base">ATS Font & Table Glitches</h3>
              <p className="text-sm text-zinc-600 leading-relaxed">
                Multi-column designs, tables, and decorative icon fonts turn into broken unicode question marks inside enterprise applicant tracking systems.
              </p>
            </div>
          </div>
        </section>

        {/* 4. FEATURE SECTION */}
        <section id="features" className="py-20 border-t border-zinc-100 max-w-4xl mx-auto">
          <div className="text-center max-w-xl mx-auto mb-14">
            <span className="text-xs font-mono uppercase tracking-widest text-zinc-400">The Solution</span>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-zinc-950 mt-2">
              Engineered for absolute accuracy.
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="space-y-3">
              <div className="w-8 h-8 rounded-full border border-zinc-200 bg-zinc-100 flex items-center justify-center font-mono text-xs font-semibold text-zinc-900">
                1
              </div>
              <h3 className="font-semibold text-zinc-950 text-base">Strict 1-Page Harvard Budget</h3>
              <p className="text-sm text-zinc-600 leading-relaxed">
                A mathematical 56-line budget guarantees your resume fits exactly one A4 page without font shrinking or margin compression.
              </p>
            </div>

            <div className="space-y-3">
              <div className="w-8 h-8 rounded-full border border-zinc-200 bg-zinc-100 flex items-center justify-center font-mono text-xs font-semibold text-zinc-900">
                2
              </div>
              <h3 className="font-semibold text-zinc-950 text-base">Copy, Never Compose</h3>
              <p className="text-sm text-zinc-600 leading-relaxed">
                Pure deterministic ranking. Every bullet point, credential, degree, and role in your output is verified verbatim from your source CV.
              </p>
            </div>

            <div className="space-y-3">
              <div className="w-8 h-8 rounded-full border border-zinc-200 bg-zinc-100 flex items-center justify-center font-mono text-xs font-semibold text-zinc-900">
                3
              </div>
              <h3 className="font-semibold text-zinc-950 text-base">100% ATS-Compliant PDF</h3>
              <p className="text-sm text-zinc-600 leading-relaxed">
                Built with real vector text streams, Times-Roman typography, recognized heading hierarchies, and zero private-use glyphs.
              </p>
            </div>
          </div>
        </section>

        {/* 5. ENCOURAGING BANNER */}
        <section className="my-16 max-w-4xl mx-auto">
          <div className="rounded-2xl border border-zinc-900 bg-zinc-950 text-white p-8 sm:p-12 text-center flex flex-col items-center">
            <span className="text-xs font-mono uppercase tracking-widest text-zinc-400 mb-2">Get Fitted</span>
            <h2 className="text-2xl sm:text-4xl font-bold tracking-tight mb-4 max-w-xl">
              Ready to tailor your CV in seconds?
            </h2>
            <p className="text-sm sm:text-base text-zinc-400 mb-8 max-w-lg leading-relaxed">
              No sign-up required. Upload your CV as a PDF, enter your target role, and download your Harvard-style one-page resume immediately.
            </p>
            <Link
              href="/app"
              className="inline-flex items-center justify-center px-8 py-3 text-sm font-semibold rounded-full bg-white text-zinc-950 hover:bg-zinc-100 transition-colors shadow-sm"
            >
              Tailor Your Resume Now
            </Link>
          </div>
        </section>

        {/* 6. CTA / FEEDBACK SECTION */}
        <section id="feedback" className="py-20 border-t border-zinc-100 max-w-4xl mx-auto text-center">
          <span className="text-xs font-mono uppercase tracking-widest text-zinc-400">Suggestions & Feedback</span>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-zinc-950 mt-2 mb-4">
            Help us make Fitted even better.
          </h2>
          <p className="text-sm sm:text-base text-zinc-600 max-w-lg mx-auto mb-8 leading-relaxed">
            Have a suggestion, feedback, or a feature request? We read and appreciate every email.
          </p>

          <div className="inline-flex items-center gap-3 px-5 py-3 rounded-full border border-zinc-200 bg-zinc-50 text-sm font-mono text-zinc-800">
            <svg className="w-4 h-4 text-zinc-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            <a
              href="mailto:vardz.dev@gmail.com"
              className="hover:underline font-medium text-black"
            >
              vardz.dev@gmail.com
            </a>
          </div>
        </section>
      </main>

      {/* 7. MINIMALIST FOOTER */}
      <footer className="w-full border-t border-zinc-100 py-8 px-8 sm:px-16 md:px-24 lg:px-32 xl:px-44 text-xs text-zinc-500">
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>© {new Date().getFullYear()} Fitted. Deterministic, ATS-compliant resume tailoring.</p>

          <div className="flex items-center gap-6">
            <Link href="/privacy" className="hover:text-black transition-colors">
              Privacy
            </Link>
            <Link href="/terms" className="hover:text-black transition-colors">
              Terms
            </Link>
            <Link href="/app" className="hover:text-black transition-colors">
              App
            </Link>
            <a
              href="mailto:vardz.dev@gmail.com"
              className="hover:text-black transition-colors"
            >
              Contact
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
