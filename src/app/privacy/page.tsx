import React from "react";
import Link from "next/link";
import Image from "next/image";

export default function PrivacyPage() {
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

        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-zinc-950 mb-3">Privacy Policy</h1>
        <p className="text-xs font-mono text-zinc-400 mb-10">Last updated: November 2026</p>

        <div className="space-y-8 text-sm leading-relaxed text-zinc-600">
          <section className="space-y-2">
            <h2 className="text-base font-semibold text-zinc-950">1. Zero Cloud Storage of Candidate Data</h2>
            <p>
              Fitted operates on a client-first, deterministic processing model. Your uploaded CV documents and parsed profile details are processed solely in temporary memory to generate your tailored one-page resume. We do not store, retain, or sell your personal career data.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-semibold text-zinc-950">2. No AI Training on Your Credentials</h2>
            <p>
              Fitted does not use third-party generative LLMs or commercial AI model training pipelines. Your CV text is never sent to external AI providers to train foundation models.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-semibold text-zinc-950">3. Local PDF Generation</h2>
            <p>
              Tailored resumes are rendered into PDF format in real-time. When you download your resume, the vector PDF is created directly for your device.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-semibold text-zinc-950">4. Contact & Suggestions</h2>
            <p>
              If you have any questions or privacy inquiries, contact us directly at{" "}
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
            <Link href="/terms" className="hover:text-black transition-colors">
              Terms
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
