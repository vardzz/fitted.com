# Fitted

Your CV, cut to fit the role.

Fitted is a fast web application built to solve resume tailoring: upload your CV as a PDF, specify the target role (with an optional job posting), and receive a tailored, compact, one-page Harvard-style resume PDF with selectable text.

**CVs are processed per request and never stored.**

---

## Features

- **In-Memory PDF Parsing**: Client-side upload parsed directly in memory on the server with `unpdf`.
- **Structured Fact Extraction**: Converts arbitrary CV text into a normalized schema (`Profile`) without hallucination.
- **Strict No-Fabrication Tailoring**: Powered by Google Gemini. Rewords, condenses, and reorganizes facts, but never invents jobs, dates, degrees, metrics, or skills.
- **Faithfulness Verification**: Automatic server-side verification (`lib/verify.ts`) guarantees that all employers, schools, and skills exist as substrings in the source CV; unverified claims are stripped and noted.
- **Harvard-Style Layout**: Beautiful, dense, academic LaTeX-like resume rendered via `@react-pdf/renderer` using Times serif typography, ruled headings, and right-aligned dates.
- **Transparence & Gaps**: Side panels display exact items that were dropped to fit one page, as well as role requirements not demonstrated in the CV.

---

## Tech Stack

- **Framework**: Next.js 14 (App Router) + TypeScript
- **Styling**: Minimalist, warm CSS design system in `app/globals.css` (Inter font, `--bg: #fafaf9`, `--accent: #2f5bea`)
- **PDF Extraction**: `unpdf`
- **PDF Generation**: `@react-pdf/renderer`
- **LLM**: Google Gemini Flash via `@google/genai`

---

## Getting Started

### 1. Clone & Install Dependencies

```bash
git clone https://github.com/vardzz/fitted.com.git
cd fitted.com
npm install
```

### 2. Environment Configuration

Copy `.env.example` to `.env.local`:

```bash
cp .env.example .env.local
```

Add your Google Gemini API key obtained from [Google AI Studio](https://aistudio.google.com/):

```env
LLM_API_KEY=your_gemini_api_key_here
LLM_MODEL=gemini-3.8-flash
```

### 3. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Production Build

```bash
npm run build
npm run start
```
