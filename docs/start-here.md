# start-here.md: Fitted Project Index

Read this file first. Fitted is a small web app: the user uploads their CV as a PDF, answers "What role are you applying for?", and downloads a tailored one-page Harvard-style resume as a PDF.

## Files to read, in order

1. `start-here.md` (this file)
2. `build.md`: WHAT to build (workflow, stack, data shapes, prompts, hard rules, acceptance checklist)
3. `phases.md`: WHEN to build it (the 60-minute timeline, checkpoints, cut order)
4. `resume-style.md`: HOW the output resume looks (layout details for the PDF)
5. `design.md`: HOW the app UI looks and moves (colors, type, motion)
6. `non-llm.md`: replaces the LLM parts of `build.md` (parsing, role understanding, tailoring). Fitted uses rules, regex and keyword scoring, with no LLM and no API key
7. The owner's reference resume image (attached separately): the visual target for the PDF

## Which file wins when they disagree

1. `build.md` section 2 (hard rules) always wins, as amended by `non-llm.md` section 2 (which replaces its rules 1-3). Never break them.
2. `non-llm.md` wins over `build.md` wherever they disagree about parsing, tailoring, the API routes, the stack or environment variables (no LLM, no API key).
3. `resume-style.md` wins over `build.md` section 5a for the look of the resume PDF.
4. `phases.md` wins on timing and what to cut when behind.
5. `design.md` applies to the app UI only, never to the PDF.

## Ground rules

- One hour total. Do not write app code before the timer starts. Stop at minute 60.
- Build only what `build.md` lists. Anything in its section 9 stays out.
- No fabrication: output only copies text parsed from the user's CV (select and order, never rewrite).
- Never commit `.env` files or keys (there should be no LLM key in the non-LLM version).
- Commit at the end of each phase with honest messages. Never rewrite or backdate history.
- The owner writes the final submission note. Do not write claims about the process for them.

## Keep these out of the public repo

These files contain personal information or planning notes. Keep them in a folder outside the repo, or add them to `.gitignore` before the first commit:

- `start-here.md`, `build.md`, `phases.md`, `resume-style.md`, `design.md`, `non-llm.md`
- The reference resume image
- The owner's CV PDF used for testing
