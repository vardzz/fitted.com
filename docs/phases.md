# phases.md: 1-Hour Execution Runbook

Companion to `build.md`. `build.md` says WHAT to build for Fitted. This file says WHEN and in what order, with checkpoints and cut rules.

Project: Fitted (upload CV PDF, answer "What role are you applying for?", download a tailored Harvard-style PDF).

## Agent rules

1. Read `start-here.md`, then `build.md`, `design.md` and `resume-style.md` fully before Phase 1. Follow its hard rules (no fabrication, API key server-side, no storage).
2. Do not write app code before the timer starts (Phase 1, minute 0).
3. Work one phase at a time. At the end of each phase, run its "Done when" checks, commit, push, then report in one or two lines: what works, what is next.
4. Commit at the end of every phase with the message given. Do not rewrite, squash or backdate history.
5. If a phase runs over its time box by more than 5 minutes, apply the "If behind" rule for that phase. Do not extend the hour.
6. Build only what `build.md` lists. Anything in its section 9 stays out.

## Phase 0: Prep (before the timer, no app code)

Owner does these; the agent can remind but must not build.

- [ ] Reply to the company confirming the program fits (full-time, unpaid, hybrid, meetups at FOUR/NEO, BGC Taguig), or decline. A short reply is fine.
- [ ] Create a NEW empty public GitHub repo named `fitted` (or `fitted-cv` if taken), with no README, no license, no .gitignore.
- [ ] Get a Gemini API key from Google AI Studio and keep it handy for the Vercel settings. Never paste it into a file in the repo. Skim the free-tier limits and data terms.
- [ ] Make sure Node.js and git work, and you are logged in to GitHub and Vercel.
- [ ] Have your own CV as a text-based PDF ready for testing (open it and check you can select the text).
- [ ] Have your reference resume image (the Harvard-style one) ready to attach to the agent.
- [ ] Pick a quiet hour, no later than Tuesday, Nov 17, so Wednesday, Nov 18 is buffer for sending.
- [ ] Start a visible timer and a screen recorder (optional but useful as the 2-minute fallback).

## Phase 1: Scaffold (minutes 0-10)

Goal: an empty app that builds, with env handling set up safely.

Tasks:

1. Create the Next.js + TypeScript project named `fitted`, `git init`, connect the new remote.
2. Add `.env*` to `.gitignore`; create `.env.example` with `LLM_API_KEY=` and `LLM_MODEL=`.
3. Install `unpdf`, `@react-pdf/renderer` and `@google/genai`.
4. Create the file structure from `build.md` section 4 with stubs.

Done when: `npm run dev` shows a blank page with no errors; `git status` shows no `.env` file staged.

Commit: `chore: scaffold Next.js project and env template`, then `git push -u origin main`.

If behind: none. Keep it short; skip extra config.

## Phase 2: Upload and profile extraction (minutes 10-28)

Goal: the user uploads a PDF and sees a short profile summary.

Tasks (`build.md` Step B):

1. `lib/llm.ts` helper for Gemini with JSON output and one retry (check the current Gemini structured-output docs for the config shape and model ID).
2. `/api/parse`: PDF in, text out, with the 4 MB limit and the "no readable text" error.
3. `/api/profile`: text in, `Profile` JSON out, using the extraction prompt.
4. UI step 1: file input, paste-text fallback, summary of what was found.

Done when: the owner's real CV PDF produces a correct summary (name, roles, projects, skills), and a scanned or empty PDF shows the fallback message instead of crashing.

Commit: `feat: upload CV PDF and extract structured profile`, then `git push`.

If behind (at minute 25 and not working): drop the PDF file input for now and ship the paste-text path first. Come back to upload only if time remains after Phase 4.

## Phase 3: Role question and tailoring (minutes 28-42)

Goal: the user types a role and gets tailored resume JSON back.

Tasks (`build.md` Step C and section 7):

1. UI step 2: role input and an optional job posting box.
2. `/api/tailor` with the tailoring prompt.
3. Single clarifying question rule (once only).
4. `lib/verify.ts` faithfulness check.

Done when: with the owner's CV and a real role, the JSON has skills, experience, projects, education, certifications, `dropped` and `gaps`; nothing in it is invented; a vague role like "developer" triggers exactly one question.

Commit: `feat: tailor resume to target role with single clarifying question`, then `git push`.

If behind: cut the clarifying question first (always return a resume). Keep the verify check; it is small.

## Phase 4: Harvard-style PDF (minutes 42-52)

Goal: a one-page PDF matching the reference resume, with preview and a Download button.

Tasks (`build.md` Step D and section 5a):

1. `components/ResumePdf.tsx` using the template spec.
2. Preview with `PDFViewer` (dynamic import, `ssr: false`) plus `dropped` and `gaps` panels.
3. Download button with the file name `<Name>-<Role>-Resume.pdf`.
4. Compare against the reference image; fix spacing until it fits one A4 page.

Done when: the downloaded PDF opens from the file explorer, text is selectable, it is one page, and it visually matches the reference layout (centered header, ruled headings, right-aligned dates, serif font).

Commit: `feat: generate Harvard-style one-page PDF with download button`, then `git push`.

If behind (at minute 48): skip pixel-matching. Get the section order, header and right-aligned dates right, make it one page, and move on.

## Phase 5: Ship (minutes 52-58)

Goal: a live link that works.

Tasks (`build.md` Step E):

1. Write `README.md` titled Fitted: what it does, how to run it, "CVs are processed per request and never stored."
2. `npm run build` and fix errors.
3. Deploy to Vercel; set `LLM_API_KEY` and `LLM_MODEL` in the project settings.
4. Test the live URL end to end in an incognito window with the owner's CV.
5. Confirm the repo has no `.env` files, no API key and no `node_modules`.

Commit: `docs: add README and finalize deployment`, then `git push`.

If behind: skip README polish (3 lines is enough) but never skip the secrets check or the live test.

## Phase 6: Submit (minutes 58-60)

Reply to the company's email before the deadline (Wednesday, Nov 18) with:

- The live link (or a 2-minute screen recording plus the repo link if the live link is not working).
- The 3-5 sentence note below.

### Submission note (owner writes this, honestly)

Fill in the blanks from what really happened. The agent must not write the process claims.

1. I picked this problem because **\_\_** (for example: I am applying for roles and tailoring a resume by hand takes too long).
2. I deliberately left out **\_\_** (for example: accounts, saved CVs, scanned-PDF OCR, Word upload, multiple templates) because **\_\_**.
3. I used AI tools for **\_\_**; I decided/wrote/fixed **\_\_** myself. One design choice I made: the AI may only reword and reorder what is in the CV, and anything it cannot back up is listed as a gap.

## Cut order (if time is short overall)

Cut in this order, and say so in the submission note:

1. Pixel-perfect template matching.
2. Clarifying question.
3. PDF upload (keep paste-text).
4. `dropped` and `gaps` panels (keep the data, show it as plain lists).

Never cut: the no-fabrication rule, the secrets check, the live test, or the honest submission note.

## Hard stop

At minute 60, stop coding. Submit what works. A small honest build with a clear note about its cuts is the goal.
