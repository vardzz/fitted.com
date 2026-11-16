# Fitted

Your CV, cut to fit the role.

Fitted is a fast web app that takes your CV as a PDF, asks what role you are applying for, and generates a tailored one-page Harvard-style resume PDF using only facts from your CV.

CVs are processed per request and never stored.

## Getting Started

1. Install dependencies:
   ```bash
   npm install
   ```

2. Copy `.env.example` to `.env.local` and add your Google Gemini API key:
   ```bash
   cp .env.example .env.local
   ```

3. Run the development server:
   ```bash
   npm run dev
   ```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the app.
