# Fitted: Build Plan for AI Agent

Owner: Jericho Varde. Time box: 60 minutes. Follow the steps in order. Do not add features that are not listed here.

Related files: `start-here.md` (reading order), `phases.md` (timeline), `design.md` (UI and motion), `resume-style.md` (resume layout, overrides section 5a).

## 1. Goal

Build a small web app named **Fitted**. The user uploads their CV as a PDF. The app extracts a structured profile from it, asks "What role are you applying for?", then generates a tailored one-page resume using only facts from the CV. The user previews it and downloads a real PDF.

**Workflow (this is the product):**

1. The user uploads their CV as a PDF.
2. The server extracts the text, and the LLM breaks it into the structured `Profile` JSON. From then on the AI reads only that JSON.
3. The app asks "What role are you applying for?" The user types a role or pastes a job description.
4. The AI builds the tailored resume.
5. The user previews it and clicks Download to save a real PDF to their computer.

The uploaded file is processed in memory and never stored. A paste-text box stays as a fallback for PDFs with no readable text (for example scans).

**Output format:** a Harvard-style one-page PDF matching the owner's own resume (see section 5a and `resume-style.md`), generated as a real PDF with selectable text.

## 2. Hard rules (never break these)

1. **No fabrication.** The AI may reword, reorder, shorten and drop content from the CV. It must never add employers, titles, dates, degrees, skills, tools, metrics or achievements that are not in the CV.
2. **Gaps are reported, not filled.** If the target role needs something the CV does not show, list it under `gaps`.
3. **API key stays server-side.** Read it from an environment variable inside an API route. Never expose it to the browser. Never commit `.env` files. Add `.env*` to `.gitignore` before the first commit and provide `.env.example`.
4. **No storage.** No database, no accounts, no logging of CV text. State lives in React state for the session only. Uploaded files are processed in memory.
5. **Stay in scope.** Anything in section 9 is out of scope. Do not build it.
6. **Commit as you go**, about every 10-15 minutes, with honest messages. Do not rewrite or squash history.
7. **Keep personal files out of the repo.** The owner's reference resume image, the owner's CV and these planning `.md` files must not be committed.

## 3. Tech stack

- Next.js (App Router) + TypeScript
- Plain CSS in `app/globals.css` (no Tailwind, no UI library)
- PDF text extraction: `unpdf`, server side, in `/api/parse`
- PDF generation: `@react-pdf/renderer`, client side, imported with `next/dynamic` and `ssr: false`
- LLM provider: Google Gemini through the `@google/genai` SDK, called only from API routes. Use a current Flash-class model.
- Deploy on Vercel
- Environment variables: `LLM_API_KEY` (a Gemini API key from Google AI Studio, passed to the SDK explicitly), `LLM_MODEL` (the current Flash-class model ID, copied from the Gemini docs on the day of the build and kept configurable)
- Vercel: add `export const maxDuration = 30;` to the `/api/profile` and `/api/tailor` route files (check the limit allowed on the owner's Vercel plan)

## 4. File structure

```text
app/
  page.tsx              // the whole UI, 3 steps
  icon.svg              // favicon: copy of logo/fitted-mark.svg
  globals.css           // app styles (see design.md)
  api/parse/route.ts    // POST: PDF file -> plain text
  api/profile/route.ts  // POST: CV text -> structured profile JSON
  api/tailor/route.ts   // POST: profile + role -> tailored resume JSON
public/
  fitted-mark.svg       // logo mark used in the page header (see design.md 5a)
components/
  ResumePdf.tsx         // Harvard-style PDF (react-pdf), used for preview and download
lib/
  prompts.ts            // the two system prompts
  llm.ts                // one helper: callLLM(system, user) -> parsed JSON
  verify.ts             // faithfulness check (section 7)
  types.ts              // Profile and TailoredResume types
.env.example
README.md
```

## 5. Data shapes

```ts
type Profile = {
  name: string;
  contact: {
    email?: string;
    phone?: string;
    location?: string;
    links?: { label: string; url: string }[];
  };
  skills: { category: string; items: string[] }[]; // grouped as the CV groups them, e.g. "Languages"
  experience: {
    role: string;
    org: string;
    start?: string;
    end?: string;
    bullets: string[];
  }[];
  projects: {
    name: string;
    tech?: string[];
    role?: string;
    start?: string;
    end?: string;
    bullets: string[];
  }[];
  education: {
    school: string;
    degree?: string;
    gpa?: string;
    start?: string;
    end?: string;
    coursework?: string[];
  }[];
  certifications: { name: string; issuer?: string; date?: string }[]; // also awards and achievements
  other: string[]; // anything that fits no field above
};

type TailoredResume = {
  needs_clarification: boolean;
  clarifying_question?: string; // only when the role is too vague
  resume?: {
    name: string;
    contact: Profile["contact"];
    skills: Profile["skills"];
    experience: Profile["experience"];
    projects: Profile["projects"];
    education: Profile["education"];
    certifications: Profile["certifications"];
  }; // no summary: Harvard style starts with skills
  dropped: { item: string; reason: string }[]; // what was cut to fit one page, and why
  gaps: string[]; // role requirements the CV does not show
};
```

## 5a. Resume template (Harvard style)

The output must look like the owner's own resume. `resume-style.md` has the full description and the reference image shows the target; if they differ from this section, `resume-style.md` wins, and its section 0 (ATS-friendly rules) overrides the sizes, fonts, icons and heading names below. One template only: single column, serif font, black on white, no photo.

**Section order (fixed):** Skills, Experience, Projects, Education, Certifications (ATS heading names). Skip a section if the CV has nothing for it. There is no summary section.

| Element                       | Layout and style                                                                                                                                          |
| ----------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Name                          | Centered, serif, bold, 18pt                                                                                                                               |
| Contact line                  | Centered, one line under the name, 10pt: portfolio, LinkedIn, GitHub, email, phone, separated by " \| ". No icons (ATS-friendly); plain visible text only |
| Section heading               | Bold, about 11pt, left aligned, thin black rule under it across the full width                                                                            |
| Technical Skills              | Bulleted, one line per category: bold label, colon, comma-separated items ("Languages: ..."). Categories come from the user's CV                          |
| Experience entry              | Line 1: bold role, " \| ", italic org on the left; italic dates right-aligned. Then 2-3 bullets                                                           |
| Project entry                 | Line 1: bold project name, " \| ", italic role, " \| ", italic tech list on the left; date right-aligned. Then 2 bullets                                  |
| Education                     | Line 1: bold school left, dates right. Line 2: italic degree left, bold GPA right. Optional line 3: "Relevant Coursework:" and the list                   |
| Certifications & Achievements | Bullets: bold name, italic issuer, date right-aligned                                                                                                     |
| Body text                     | 10pt (ATS rule, nothing smaller), line-height about 1.15, black on white                                                                                  |
| Page                          | A4, narrow margins (about 12mm), exactly one page                                                                                                         |

Implementation notes (`@react-pdf/renderer`): this one component is both the preview and the downloaded file, so there is no separate HTML version and no print CSS. Use the built-in fonts `Times-Roman`, `Times-Bold` and `Times-Italic` (no font files needed). Build each left/right line as a `View` with `flexDirection: "row"` and `justifyContent: "space-between"`. Draw the heading rule with `borderBottomWidth: 0.6` on the heading `View`. Use `<Page size="A4">` with about 34pt padding and `wrap={false}` on each entry. If the content overflows one page, reduce items per the limits in the tailoring prompt; do not shrink the font below 10pt.

## 6. Build steps

### Step A: Scaffold (minutes 0-10)

1. Create a new Next.js + TypeScript project named `fitted` in a fresh folder and `git init` it.
2. Add `.env*` to `.gitignore` and create `.env.example` with `LLM_API_KEY=` and `LLM_MODEL=`.
3. Install `unpdf`, `@react-pdf/renderer` and `@google/genai`.
4. Create the file structure from section 4 with empty stubs.
5. Commit: `chore: scaffold Next.js project and env template`.

### Step B: PDF upload and profile extraction (minutes 10-28)

1. `lib/llm.ts`: one function that calls Gemini (`@google/genai`) with a system prompt and user text and returns parsed JSON. Before writing it, open the current Gemini structured-output docs (https://ai.google.dev/gemini-api/docs/generate-content/structured-output) and copy the exact config shape and a current Flash model ID from there, because model names and the JSON config fields change between releases. Request JSON output (`application/json`, with a response schema where practical), use temperature between 0 and 0.3, strip code fences before `JSON.parse`, retry once on a parse failure, then return a clear error.
2. `app/api/parse/route.ts`: accept a multipart PDF upload (reject non-PDF and files over 4 MB, the Vercel request limit), extract the text with `unpdf`, return `{ text }`. If the text is under about 200 characters, return an error: "This PDF has no readable text (it may be a scan). Paste your CV text instead."
3. `app/api/profile/route.ts`: accept `{ cv: string }`, validate it is non-empty and under 20,000 characters, call the LLM with the extraction prompt, return a `Profile`.
4. `app/page.tsx` step 1: a PDF file input as the main path, plus a "paste text instead" textarea as the fallback. On upload, call `/api/parse` then `/api/profile`, then show a short summary (name, number of roles, projects, skills) so the user sees it was understood. Keep the profile in React state.
5. Test with the owner's real CV PDF.
6. Commit: `feat: upload CV PDF and extract structured profile`.

**Extraction prompt (use as the system prompt):**

> You extract a structured profile from a CV. Return ONLY valid JSON matching the given schema. The CV text was extracted from a PDF, so line breaks and column order may be broken: rebuild the sections, but copy facts exactly as written. Do not infer, guess or add anything that is not in the text. If a field is missing, omit it or use an empty array. Do not add commentary.

### Step C: Role question and tailoring (minutes 28-42)

1. UI step 2: input "What role are you applying for?" plus an optional textarea for a pasted job posting. Button: "Tailor my resume".
2. `app/api/tailor/route.ts`: accept `{ profile, role, posting?, clarification? }`, call the LLM with the tailoring prompt, run the verify step (section 7), return `TailoredResume`.
3. **Clarification rule:** if the role is vague (for example just "developer"), the model returns `needs_clarification: true` with one question. The UI shows the question, the user answers, and the request is re-sent with `clarification`. Allow this once only. If `clarification` is present, the model must always return a resume.
4. Commit: `feat: tailor resume to target role with single clarifying question`.

**Tailoring prompt (use as the system prompt):**

> You tailor a resume to a target role using ONLY the provided profile. You may reword, reorder, shorten and omit. You must NOT add any employer, title, date, degree, skill, tool, metric or achievement that is not in the profile. Choose content that is most relevant to the role and must fit on one page: at most 3 bullets per experience entry, at most 3 projects, skills grouped under the user's own category labels (about 12 items in total, at most 4 groups), and no summary section. List everything you left out in `dropped` with a short reason. List requirements of the role that the profile does not show in `gaps`; never fill a gap by inventing content. If the role is too vague to tailor well and no clarification was provided, return `needs_clarification: true` with ONE short question and no resume. If a clarification was provided, always return a resume. Return ONLY valid JSON matching the schema.

### Step D: One-page PDF resume (minutes 42-52)

1. Build `components/ResumePdf.tsx` with `@react-pdf/renderer`. It renders `resume` exactly as specified in section 5a and `resume-style.md`. One component, no other templates.
2. UI step 3: show the PDF preview with `PDFViewer` (loaded with `next/dynamic`, `ssr: false`). Show `dropped` ("What I cut and why") and `gaps` ("Not shown in your CV") in panels beside or below it. Style the app per `design.md`.
3. Add a "Download PDF" button using `PDFDownloadLink` (or `pdf(<ResumePdf />).toBlob()`). File name: `<Name>-<Role>-Resume.pdf`. On small screens the preview iframe may not render, so the Download button must work on its own.
4. Compare the result with the owner's reference resume image. Fix spacing and alignment until the layout matches and it fits one page.
5. Commit: `feat: generate Harvard-style one-page PDF with download button`.

### Step E: Deploy and verify (minutes 52-58)

1. Write a short `README.md` titled Fitted: what it does, how to run it (`npm install`, copy `.env.example` to `.env.local`, `npm run dev`), and the line "CVs are processed per request and never stored."
2. Run `npm run build` and fix errors.
3. Deploy to Vercel and set `LLM_API_KEY` and `LLM_MODEL` in the project settings.
4. Test the live URL end to end with the owner's own CV and a real role. Check that nothing in the output is invented.
5. Commit: `docs: add README and finalize deployment`.
6. Push to the new public GitHub repository.

## 7. Faithfulness check (`lib/verify.ts`)

Keep it simple. After the model responds, lowercase the original CV text and check that every `org`, `school` and each skill item in the output appears as a substring of it. If something does not, remove that item from the resume and add a line to `gaps` such as "Removed unverified item: X". This is a safety net, not a full validator.

## 8. Acceptance checklist

- [ ] Uploading a text-based PDF CV shows a short profile summary.
- [ ] A scanned or empty PDF shows the paste-text fallback message instead of crashing.
- [ ] Role input works with and without a job posting.
- [ ] A vague role triggers at most one clarifying question.
- [ ] Output matches the Harvard-style template in 5a: section order, centered header, ruled headings, right-aligned dates, serif font.
- [ ] The preview fits one A4 page, and the Download button saves a PDF with selectable text.
- [ ] `dropped` and `gaps` panels show next to the preview.
- [ ] No employer, skill, date or metric appears that is not in the CV.
- [ ] No API key in the repo, the client bundle or the git history.
- [ ] Live URL works in an incognito window.

## 9. Out of scope (do not build)

Accounts or login, saving CVs across sessions, database, Word (.docx) upload, OCR for scanned PDFs, sending the PDF directly to Gemini instead of extracting text with `unpdf`, multiple templates, cover letters, ATS scoring, streaming responses, dark mode, tests beyond a manual run. These are deliberate cuts and will be named in the submission note.

## 10. Submission note (owner writes this, 3-5 sentences)

The owner fills this in honestly after building. The agent must not write claims about the process for them. Cover:

1. Why this problem: the owner is applying for roles and tailoring resumes by hand is slow.
2. What was left out: the list in section 9, and why.
3. How AI tools were used: what the AI wrote versus what the owner decided, wrote or fixed. Name the model provider used in the app (Gemini). Also mention the no-fabrication rule as a design choice.

Send by reply email by Wednesday, November 18, with the live link (or a 2-minute screen recording plus the repo).
