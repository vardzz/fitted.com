# Fitted Test Report: Source CV vs Tailored Resume

Compares the test CV (`Varde_CV_2026.pdf`) with the tailored resume Fitted returned (`Jericho_F__Varde-Frontemd_Engineer-Resume.pdf`). Based on the text layer of both PDFs.

## 1. Verdict

The output is clean and ATS-safe (one page, plain text, no icons), but it is **not yet a trustworthy or visibly tailored resume**. Three problems matter most:

1. **Data corruption.** Credential IDs lost digits, a month name was broken ("Oc - ber 2026"), and the contact line gained a fake link ("gmail.com"). Fitted promises "copy, never compose", so any altered text breaks that promise.
2. **Wrong role targeting.** For a Frontend Engineer role, the output promoted Python, SQL, Prisma, a data-analyst job and a backend-style project, and dropped the most relevant frontend projects. The role text was probably misread because of a typo ("Frontemd").
3. **Tailoring is invisible.** Most of the CV came back almost unchanged, with no explanation of what was kept, moved or cut.

Most of these are bugs, not limits of the non-LLM approach. Section 6 says honestly what a rules-based tool cannot do.

## 2. Test setup

| Item            | Value                                                                                                                                                       |
| --------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Source          | `Varde_CV_2026.pdf`, 2 pages, icons in the contact line, 4 education entries, 33 skill items, 3 jobs (11 bullets), 5 projects (9 bullets), 3 certifications |
| Output          | `Jericho_F__Varde-Frontemd_Engineer-Resume.pdf`, 1 page                                                                                                     |
| Role entered    | Appears to be "Frontemd Engineer" (typo), taken from the output file name                                                                                   |
| Job description | Unknown. Check whether one was pasted                                                                                                                       |

## 3. What works (keep it)

- One page, plain text, standard headings (Skills, Experience, Projects, Education, Certifications), real bullets.
- The junk icon characters from the source header (`§ ï # H`) are gone.
- Old schooling (senior high, junior high, elementary) was correctly dropped; college, GWA and coursework were kept.
- Most bullets are verbatim copies of the source, as intended.
- Dates use one consistent format (plain hyphen).

## 4. Findings

Severity: **Critical** = wrong or false data, **High** = clearly hurts the result, **Medium** = quality issue, **Low** = polish.

### F1. Credential IDs are corrupted (Critical)

|        | Text                                     |
| ------ | ---------------------------------------- |
| Source | `AIEDA0019019720935`, `DAA0015766640456` |
| Output | `AIEDA019720935`, `DAA766640456`         |

Four digits were removed from the start of the numeric part of each ID.

**Likely cause (high confidence):** when the parser removes the trailing date from a certification line, the "single date" regex (`\d{4}`) is not anchored, so it also matches the first 4-digit run inside the ID (`0019`, `0015`) and deletes it. Removing those runs from the source IDs gives exactly the wrong IDs in the output.

**Fix:**

- Strip the date only from the end of the line: `/\s*(?:\d{4}\s*-\s*\d{4}|\d{4})\s*$/`.
- Extract and protect the credential ID first (replace it with a placeholder), then parse the date, then restore it.
- Never run date regexes over the middle of a line.

**Test:** the output must contain the credential IDs exactly as in the source.

### F2. Month name broken: "June 2026 - Oc - ber 2026" (Critical)

The source says `June 2026 – October 2026`. The output has `Oc - ber`.

**Likely cause (high confidence):** the date formatter replaces the word `to` (or a dash pattern) without word boundaries, and "October" contains "to". `Oc` + `to` + `ber` becomes `Oc - ber`.

**Fix:**

- Only treat `to` as a separator when it has spaces around it between two dates: `\s+to\s+`.
- Better: do not rebuild dates from text. Keep the start and end as captured groups and join them with `-`.
- Normalize dashes with a character class (`[–—−]`), never with a word.

**Test:** table-driven date tests that include `October`, `Oct`, `Present`, `2023 - Expected 2027`, and `08/2025 - 12/2025`.

### F3. Contact line: fake link and lost handles (High)

|        | Text                    |
| ------ | ----------------------- | ------------- | --------- | ------------------------ | ------------------------------------------------------ |
| Source | `§ vardzz               | ï vardz       | vardz.dev | # vardejericho@gmail.com | H +639154636051` (icons are extracted as junk symbols) |
| Output | `vardejericho@gmail.com | +639154636051 | vardz.dev | gmail.com`               |

Problems:

- `gmail.com` was added as a link. **Cause:** the URL regex matches the domain inside the email address.
- The two handles `vardzz` and `vardz` (presumably LinkedIn and GitHub) were dropped silently. They have no domain, so no regex recognized them.

**Fix:**

1. Remove email matches from the text before scanning for URLs.
2. Split the contact line on `|` and classify each token: email, phone, domain-like, or bare handle.
3. For bare handles, do not guess silently. Show "What is `vardzz`?" with options (LinkedIn, GitHub, Portfolio, Ignore) in the review step. Once labeled, output `linkedin.com/in/vardzz` and `github.com/vardz` as visible text.
4. Add a warning whenever a token in the contact line was dropped.

### F4. Skills: lowercase names and truncated items (High)

| Source                                      | Output                                      |
| ------------------------------------------- | ------------------------------------------- |
| `PostgreSQL`, `AWS`, `GitHub`, `PHP`, `SQL` | `postgresql`, `aws`, `github`, `php`, `sql` |
| `HTML/CSS`                                  | `html` (CSS lost)                           |
| `SEO Optimization`                          | `seo`                                       |
| `Prompt Engineering`                        | `prompt engineering`                        |
| `Next.js`, `Tailwind CSS`                   | `next.js`, `tailwind css`                   |

**Likely cause (high confidence):** the canonical-spelling feature (`non-llm.md` section 12a) replaces the whole item text with the lexicon key, which is lowercase, instead of a display name. It also replaces whole items when only part of the item matched (`HTML/CSS`, `SEO Optimization`).

**Fix:**

- Add a `display` field to every lexicon entry (`"postgresql": { display: "PostgreSQL" }`).
- **Keep the source text by default.** Replace an item only when its text is a known alias that is not already the display name (for example `JS` becomes `JavaScript`). Here every source item was already well formed, so nothing should have changed.
- Never replace a multi-word or compound item (`HTML/CSS`, `SEO Optimization`). Match inside it, keep its text.
- Add `CSS` to the lexicon so `HTML/CSS` counts for both.

**Test:** for a CV whose skills are already properly spelled, the Skills section must be character-for-character identical to the source, apart from reordering and dropping.

### F5. Role was probably misread, so the whole ranking was off (Critical for product value)

Role for this CV is a Frontend Engineer, yet the output:

- Ordered skills as `python, sql, ...` and `prisma, react, next.js, ...` (Prisma first, React third).
- Put the Data Analyst job first with all three bullets, including "Build data visualization pipelines in Python and SQL".
- Ranked `GhostNet AI` (Python, Gemini API, Bright Data, Supabase) as the first project.
- Kept Docker, AWS and MySQL, but dropped Vercel (a frontend deployment tool).

That ranking looks like a backend or data profile. The output file name shows the typo `Frontemd`.

**Likely cause (medium confidence, verify with a debug panel):**

1. "Frontemd" matched no preset (exact token match).
2. The only token left, "Engineer", matched a backend, data or ML preset, because generic words count as much as the distinctive one.
3. The target keywords then favored Python, SQL, PostgreSQL, Docker and AWS.

**Fix:**

- **Fuzzy matching** for role tokens (edit distance 2 or trigram similarity), so "Frontemd" matches "frontend".
- **Ignore generic tokens** when choosing a preset: engineer, developer, intern, junior, senior, associate, specialist. They can break ties but never decide.
- **Confirm the interpretation.** Always show "Treating this as: Frontend Engineer" with the top target keywords as removable chips, and a "Not right? Choose a role" list.
- **Empty or weak target guard:** if fewer than 3 target keywords were found, do not tailor silently. Show "I could not understand this role. Pick one" and block the result.
- Add UI and frontend vocabulary to the frontend preset so common bullets match: `interface`, `responsive`, `dashboard`, `PWA`, `animation`, `component`, `state management`, `performance`, `rendering`, `accessibility`, `API integration`, `design system`.

**Test:** the roles "Frontend Engineer", "Frontemd Engineer" and "front end developer" must all produce the same target.

### F6. Wrong projects kept (High)

| Project                                                               | Frontend relevance | In output                   |
| --------------------------------------------------------------------- | ------------------ | --------------------------- |
| Horizon AI (Frontend Lead, Next.js, Framer Motion, Tailwind, current) | Very high          | Dropped                     |
| Dentara (Next.js, TypeScript, Supabase, Tailwind, PWA)                | High               | Dropped                     |
| Lunas (Frontend Lead, Next.js, Top 8 finalist)                        | High               | Kept (2nd)                  |
| Gridworks (Next.js, TypeScript, Tailwind, PDF.js, interactive canvas) | High               | Kept (last), 2 of 3 bullets |
| GhostNet AI (Python, Gemini API, Bright Data, Supabase)               | Low                | Kept (**first**)            |

**Cause:** same as F5 (wrong target), plus the project score does not seem to count the "Frontend Lead" role in the title or the recency of `Feb 2026 - Present`.

**Fix:** add title-match and recency bonuses (already in `non-llm.md` section 11); verify they are actually implemented. Show the score and reason for every kept and dropped project in the result panel.

### F7. Experience order and bullet allocation (High)

- **Order:** output is DEVCON (Jul 2026 - Present), FlyRank (Jun - Oct 2026), STEQ (Aug 2026 - Present). The plan says reverse chronological. By start date among current roles it should be STEQ, DEVCON, then FlyRank (ended), or at least a consistent, documented rule. The order looks accidental.
- **Equal budget for unequal relevance:** all three jobs got 3 bullets. The most relevant job, FlyRank (Frontend AI Engineer Intern), lost its bullet about integrating API endpoints and optimizing state management. The social media and data analyst jobs kept full bullets.
- **Bullets reordered inside DEVCON** (data visualization moved above aggregation) by score, which was irrelevant to the role.

**Fix:**

- Choose and document one policy. Recommended: **reverse chronological order of entries (ATS and recruiter convention), but bullet counts by relevance**: the most relevant entry gets up to 4 bullets, mid relevance 2 to 3, low relevance 1 to 2.
- Sort "Present" entries first by start date (newest first), then ended entries by end date.
- Do not drop a bullet that contains target terms (such as `state management`, `API`) while keeping bullets with none.

### F8. Lost metrics: "by 30", "by 25", "by 60" (High)

The source text layer already reads `reduce ... cycles by 30`, `latency by 25`, `analysis turnaround time by 60` with no `%`, while `98%` kept its sign. The output copied this.

**Cause:** the source PDF's text layer is missing the `%` at the ends of those lines (a PDF export issue), so Fitted inherits it.

**Fix (flagged repair, not silent):**

- Detect a bullet that ends with a bare number after `by`, `of`, `to`, `from` and a verb like reduce, cut, increase, improve, enhance, boost, `^.*\b(?:by|of)\s+\d{1,3}$`.
- Show a warning: "This bullet may be missing a % sign. Fix it?" with the corrected text, and let the user accept.
- Mention it in the review step so users can also fix their original CV.

### F9. Too many skill items (Medium)

The ATS rules say about 16 skill items and 4 skill lines. The output has 30 items (3 dropped from 33). The selection does not enforce the limit, and what it dropped (DynamoDB, Vercel, Postman) was a poor choice.

**Fix:** enforce the skill cap after scoring: keep all items that match the target, fill with the highest-scored others up to about 16, and keep categories that contain a match. For Frontend, Vercel and Git should outrank MySQL and DynamoDB.

### F10. Education regrouping (Low)

Source: `Bachelor of Science in Computer Science   GWA: 1.479 (Dean's Lister)`. Output: `... Computer Science (Dean's Lister)   GWA: 1.479`. The honor text moved from the GWA group to the degree. No facts changed, but the text was rearranged.

**Fix:** keep the right-side text exactly as in the source (`GWA: 1.479 (Dean's Lister)`).

### F11. Output file name (Low)

`Jericho_F__Varde-Frontemd_Engineer-Resume.pdf`: the double underscore comes from `F.` and the role typo is copied. Use `Jericho-F-Varde-Frontend-Engineer-Resume.pdf`: strip punctuation, collapse separators, and use the matched role name (not the raw input).

### F12. Tailoring is invisible to the user (High for product value)

Even with the bugs fixed, a user who compares input and output will see mostly the same document. People judge tailoring by seeing what changed.

**Fix:** add a "What changed" panel next to the PDF:

- **Moved up** (with the matched keywords that caused it), **Kept**, **Cut** (with score and reason).
- A **match summary** (for example "9 of 12 key terms found: React, TypeScript, Next.js, Tailwind CSS..."), and the **gaps** ("Not shown in your CV: Jest, Figma").
- **Before and after** toggle of the Skills and Projects sections.

### F13. Tests did not catch F1, F2, F3, F4 (High)

The faithfulness test only checked bullets, roles, organizations, schools and skills. It missed credential IDs, dates, contact links and reordered text.

**Fix:** make the faithfulness test strict and generic: tokenize every output line into words and numbers; each must appear in the source, except the documented skill-spelling mapping and the `-` date separator. Add the golden test in section 7.

## 5. Priorities

| Priority                               | Items                                                                                                                                                                      |
| -------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **P0: do first (wrong or false data)** | F1 credential IDs, F2 date corruption, F3 contact line, F4 skills case and truncation, F13 strict faithfulness test                                                        |
| **P1: makes tailoring actually work**  | F5 role matching (fuzzy, generic tokens, confirmation chips, empty-target guard), F6 project ranking, F7 bullet allocation and order, F9 skill cap, F8 missing `%` warning |
| **P2: makes it feel good**             | F12 "What changed" panel and match summary, F10, F11                                                                                                                       |

## 6. Is an LLM chatbot better? An honest comparison

Users will compare Fitted with pasting their CV into a chatbot.

| Task                                                       | Non-LLM Fitted                    | LLM chatbot                                     |
| ---------------------------------------------------------- | --------------------------------- | ----------------------------------------------- |
| Keep facts exact, never invent                             | **Wins:** guaranteed by design    | Can paraphrase, change numbers or add skills    |
| ATS-safe layout, one page, same format every time          | **Wins**                          | Gives text, not a laid-out PDF                  |
| Same input gives same output, free, instant, private       | **Wins**                          | Varies, costs money, sends the CV to a provider |
| Understand a vague or unusual role                         | Weak (needs presets and synonyms) | **Wins**                                        |
| Rewrite bullets in the job's language                      | **Cannot**                        | **Wins**                                        |
| Judge implicit relevance ("interactive canvas" is UI work) | Weak (only vocabulary it knows)   | **Wins**                                        |
| Explain choices                                            | Possible (scores and reasons)     | Possible, but may be inaccurate                 |

**What this means**

- The disappointing result here is mostly caused by **bugs and a misread role**, not by the approach. After fixing P0 and P1, the same CV with a correct role should look clearly different (see section 7).
- A rules-based tool cannot rewrite text or deeply understand meaning. Position Fitted honestly: **"a tailoring tool that cannot make things up: it picks, orders and explains, and it is ATS-safe."** Do not promise rewriting.
- If after the fixes users still feel the tailoring is shallow, the sensible next step is a **hybrid**: keep the deterministic engine for parsing, layout and the faithfulness check, and add an _optional_ LLM step that only suggests ranking or bullet wording. Every suggestion would be shown for the user to accept and checked against the source. That is a product decision for later; it is not needed to fix the problems above.

## 7. Acceptance criteria for this CV (role: Frontend Engineer)

Use this CV (anonymized before committing) as a golden fixture. After the fixes the result must satisfy all of these:

**Faithfulness**

- Credential IDs equal the source exactly.
- Every date range equals the source dates with only the separator normalized to `-`. "October" stays intact.
- The contact line has no domain that is not in the source (no `gmail.com`).
- Skill items that are already spelled correctly are unchanged (`PostgreSQL`, `AWS`, `HTML/CSS`, `SEO Optimization`).

**Targeting**

- "Frontend Engineer", "Frontemd Engineer" and "front end developer" give the same target.
- The target contains React, TypeScript, Next.js, Tailwind CSS, HTML and CSS.
- Skills: the Frameworks line starts with React, Next.js, Tailwind CSS; the Languages line starts with JavaScript, TypeScript, HTML/CSS. Python, SQL and Prisma are not first.
- Projects: GhostNet AI is not first. At least 2 of Horizon AI, Dentara, Lunas and Gridworks are in the top 3.
- Experience: FlyRank has the most bullets (up to 4) and keeps the API integration and state management bullet. Entries appear in the documented order.

**Output quality**

- One A4 page, body text at least 10pt, about 450 to 600 words, about 16 skill items.
- Bullets that lost a `%` are flagged with a warning.
- The result page shows what was moved, kept and cut, the matched keywords, and the gaps.

## 8. Tests to add

- Credential ID test (F1), date table (F2), contact classification table (F3), skill spelling tests (F4).
- Role matching test with typos and generic words (F5).
- Golden test for this CV with the expectations in section 7.
- Strict faithfulness test over every word and number in the output (F13).
- ATS test: extract the output PDF text and check headings, contact text, no icon characters, one page.

## 9. Things to check before fixing

1. What exact role text and job description were entered? (The file name suggests "Frontemd Engineer".)
2. Does Fitted have a debug view of the target keywords? If not, add one first: it shows quickly whether F5 is the cause.
3. Does the source PDF show the `%` signs when you open it? If it does, the issue is only in the text layer (F8).
4. Anonymize the test CV (name, email, phone, handles, credential IDs) before using it as a committed fixture.

## 10. Prompt for the AI agent (paste with the updated files)

```text
Read fitted-test-report.md, then non-llm.md and resume-style.md. Fix the issues in the order of the Priorities table (P0, then P1, then P2). For each finding: reproduce it with a failing test first, fix the code, confirm the test passes, and commit with a clear message. Keep the rules: copy, never compose; deterministic output; no LLM; ATS-friendly PDF. After P1, run the golden test from section 7 and report which criteria pass or fail. Add a debug panel that shows the detected role, the target keywords and each item's score. Do not add features outside the report. Use anonymized fixtures only and never commit personal data.
```
