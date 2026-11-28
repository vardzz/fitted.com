# non-llm.md: Fitted Without an LLM (Rules, Regex, Keyword Matching)

This file replaces the LLM parts of `build.md`. Everything else in `build.md`, `design.md`, `resume-style.md` and `phases.md` still applies (upload, Harvard-style PDF, UI, download).

## 1. What changes

| Topic                      | Before (LLM)                       | Now (no LLM)                                                             |
| -------------------------- | ---------------------------------- | ------------------------------------------------------------------------ |
| Reading the CV             | LLM turns text into `Profile` JSON | Normalizer + regex + section rules                                       |
| Understanding the role     | LLM reads role and posting         | Keyword lexicon + role presets + job-description keyword extraction      |
| Tailoring                  | LLM rewrites and drops content     | Score every CV item, then select and order within a one-page budget      |
| Safety against invention   | Prompt rules + `verify.ts`         | By construction: the output only copies text that was parsed from the CV |
| API key, cost, rate limits | Gemini key, quotas, timeouts       | None. No key, no network call, instant results                           |

**What "tailored" means now (be honest about it in the submission note):** Fitted selects, orders and highlights what the user already wrote. It never rewrites a bullet. It cannot invent anything, and it reports gaps. It will not produce new wording the way an LLM would.

## 2. Hard rules (replace `build.md` section 2, rules 1-3)

1. **Copy, never compose.** Every string in the output resume is a verbatim (whitespace-normalized) string parsed from the CV. No generated sentences.
2. **Gaps are reported, not filled.** Required role keywords that the CV does not contain go in `gaps`.
3. **Everything is deterministic.** The same CV and the same role always give the same resume. No randomness.
4. **Show uncertainty.** If a section could not be parsed with confidence, show a warning and let the user fix it (section 9).
5. Keep rules 4-7 of `build.md` (no storage, scope, honest commits, personal files out of the repo).

## 3. Pipeline

```text
PDF -> /api/parse (unpdf) -> raw text
raw text -> normalize -> split into sections -> parse each section -> Profile
Profile + role text + optional job description -> build target keywords
target keywords + Profile -> score every item -> select within page budget -> TailoredResume
TailoredResume -> ResumePdf.tsx (unchanged)
```

Only the PDF text extraction needs the server. All other steps are pure functions with no network, so they can also run in the browser and stay instant.

## 4. File structure changes

Remove `lib/llm.ts`, `lib/prompts.ts`, `@google/genai`, `LLM_API_KEY`, `LLM_MODEL` and the `maxDuration` lines. Add:

```text
lib/
  normalize.ts       // clean raw PDF text
  sections.ts        // find section headings and split the text
  parse-profile.ts   // contact, experience, projects, education, skills, certifications
  regex.ts           // all regexes in one place (section 6)
  lexicon.ts         // canonical skills, aliases, categories
  roles.ts           // role presets (keywords per role)
  target.ts          // role text + job description -> weighted target keywords
  score.ts           // score skills, bullets, entries, projects, certifications
  select.ts          // one-page line budget, selection, dropped list
  gaps.ts            // missing and matched keywords
  types.ts           // updated types (section 8)
tests/
  fixtures/          // 3-4 sample CV text files (use fake or your own CV; never commit real personal data)
  pipeline.test.ts
```

`/api/profile` becomes a pure rule-based parse (no key needed). `/api/tailor` runs target, score and select.

## 5. Step 1: Normalize the text (`normalize.ts`)

Apply in this order:

1. Unicode normalize (`NFKC`) and replace ligatures (`ﬁ`, `ﬂ`, `ﬀ`) with plain letters.
2. Unify bullets: `• ● ◦ ▪ ■ ‣ ∙ · ➢ ➤ ○` at line start become a single `•`.
3. Unify dashes in date ranges: `– — −` become `-` for matching (keep the original for display).
4. Remove zero-width characters and soft hyphens; collapse runs of spaces; trim each line.
5. Rejoin hyphenated line breaks: a line ending in a letter + `-` followed by a lowercase-starting line.
6. Drop lines that are only a page number (`^\d+$`, `^Page \d+( of \d+)?$`).
7. Keep line breaks (needed for structure). Do not collapse the whole text into one line.
8. Keep both the cleaned text and the original line for display.

## 6. Regex catalog (`regex.ts`)

```ts
const M =
  "(?:Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sep(?:t(?:ember)?)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?)";
const DATE = `(?:${M}\\.?\\s+\\d{4}|\\d{1,2}\\/\\d{4}|\\d{4})`;

export const RE = {
  email: /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i,
  phone: /(?:\+?63|0)\s?9\d{2}[\s-]?\d{3}[\s-]?\d{4}|\+?\d[\d\s().-]{8,}\d/,
  url: /\b(?:https?:\/\/)?(?:www\.)?(?:linkedin\.com\/in\/|github\.com\/|[a-z0-9-]+\.(?:dev|io|me|app|com|net))[^\s|,;]*/i,
  dateRange: new RegExp(
    `(${DATE})\\s*(?:-|to)\\s*(${DATE}|Present|Current|Now|Ongoing)`,
    "i",
  ),
  singleDate: new RegExp(DATE, "i"),
  bullet: /^\s*(?:[•*-]|\d+[.)])\s+/,
  gpa: /\b(?:GWA|GPA|CGPA)\s*[:\-]?\s*(\d(?:\.\d{1,3})?)(?:\s*\/\s*\d(?:\.\d+)?)?/i,
  degree:
    /\b(?:Bachelor|B\.?S\.?|B\.?A\.?|BSc|Master|M\.?S\.?|MBA|Ph\.?D|Diploma|Associate)\b/i,
  school:
    /\b(?:University|College|Institute|Academy|School|Pamantasan|Politeknik)\b/i,
  credentialId: /\(?\s*Credential ID:?\s*([A-Z0-9-]+)\s*\)?/i,
  metric: /\d+(?:[.,]\d+)?\s?(?:%|[kKmM]\b|x\b|\+)|[₱$]\s?\d[\d,.]*|\b\d{2,}\b/,
};
```

Notes:

- Test each regex on at least 3 real CV layouts before trusting it.
- The Philippine mobile pattern (`+63 9xx...` or `09xx...`) is the first alternative in `phone`; the second alternative is the generic fallback.
- `dateRange` is the single most important regex: it finds the header line of every experience or project entry.

## 7. Step 2: Split into sections (`sections.ts`)

**Heading dictionary** (case-insensitive, matched against a whole short line):

| Section key      | Matches (examples)                                                                          |
| ---------------- | ------------------------------------------------------------------------------------------- |
| `skills`         | technical skills, skills, core competencies, tools and technologies                         |
| `experience`     | experience, work experience, professional experience, employment, internships, work history |
| `projects`       | projects, personal projects, selected projects                                              |
| `education`      | education, academic background                                                              |
| `certifications` | certifications, certifications and achievements, awards, honors, achievements, licenses     |
| `summary`        | summary, profile, objective, about me (parsed but not used in the Harvard output)           |

**A line is a heading if all are true:** it is 40 characters or fewer, it has no ending period, it matches the dictionary after stripping `&`, `and`, punctuation and case, and it is either ALL CAPS, Title Case, or alone on its line.

Process:

1. Everything before the first heading is the header block (name and contact).
2. Cut the text at each heading; the text between two headings belongs to the first one.
3. If a section is missing (no heading found), add a warning (`"Could not find Experience"`) and continue.
4. Two-column CVs interleave lines and break this step. Detect by checking whether most headings are missing while the text is long, then show the manual-fix UI (section 9).

## 8. Step 3: Parse each section (`parse-profile.ts`)

### Types

```ts
type Item<T> = T & { id: string };

type Profile = {
  name: string;
  contact: {
    email?: string;
    phone?: string;
    links: { label: string; url: string }[];
  };
  skills: {
    id: string;
    category: string;
    items: { id: string; text: string }[];
  }[];
  experience: {
    id: string;
    role: string;
    org: string;
    start?: string;
    end?: string;
    bullets: { id: string; text: string }[];
  }[];
  projects: {
    id: string;
    name: string;
    role?: string;
    tech: string[];
    date?: string;
    bullets: { id: string; text: string }[];
  }[];
  education: {
    id: string;
    school: string;
    degree?: string;
    gpa?: string;
    start?: string;
    end?: string;
    coursework?: string[];
  }[];
  certifications: {
    id: string;
    name: string;
    issuer?: string;
    date?: string;
  }[];
  warnings: string[];
};

type TailorResult = {
  resume: Omit<Profile, "warnings">; // only selected items, in output order
  matched: string[]; // role keywords found in the CV
  gaps: string[]; // required role keywords not in the CV
  dropped: { text: string; reason: string }[];
  stats: { lines: number; budget: number };
};
```

Every parsed item gets a stable `id`. The output refers to parsed items; it never builds new strings.

### Header

- `email`, `phone`, `url` regexes over the header block. Links: label from the domain (`linkedin`, `github`, `portfolio`).
- **Name:** the first non-empty line that has no `@`, no digits, 2 to 5 words, and is not a heading. Strip trailing credentials only if clearly separated by a comma.

### Experience

1. Walk lines; a line matching `dateRange` is an entry header. If the date sits on its own line, the previous non-bullet line is the header.
2. Split the header (with the date removed) into `role` and `org` on `|`, `-`, `at`, `@` or a comma. If the two orders are ambiguous, use this rule: the part containing words like Intern, Engineer, Developer, Analyst, Manager, Lead, Designer, Assistant, Officer is the role; the other is the org.
3. Lines that start with a bullet are bullets. A non-bullet line right after a bullet that does not match `dateRange` is a **wrapped continuation**: append it to the previous bullet with one space.
4. An entry ends at the next entry header or the end of the section.

### Projects

- Header line: split on `|` into `name | role? | tech`. The last part that contains commas or known skills is the tech list; split it on `,` and `/`.
- If there is no `|`, name = text before the first `-` or the whole line; tech comes from lexicon matches inside the line.
- Date: `dateRange` or `singleDate` on the header line; remove it from the name.

### Education

- `school` regex line is the school. The line with `degree` regex is the degree. `gpa` regex gives the grade text. A line starting with `Relevant Coursework:` gives a list split on commas. Dates come from `dateRange` or `singleDate`.

### Skills

- Lines of the form `Label: a, b, c` become a category. Split items on `,`, `;`, `|` and `•`, trim, drop empties.
- A flat list with no labels goes into one category named `Skills`.

### Certifications and achievements

- Each bullet or line is one item. Date = `singleDate` at the end of the line (remove from the name). Credential IDs: keep in the text but strip from the display name using `credentialId`. Issuer = text after `|` or `-` when present.

## 9. Parse review (strongly recommended safety net)

Rule-based parsing will sometimes mis-split, so show the result before tailoring:

- Show a compact parsed summary (counts and first lines) with the `warnings`.
- Offer "Fix text": one editable textarea per section containing the raw section text. Re-running the section parser on edited text is cheap and keeps the user in control.
- If `experience` has zero entries or the name is empty, block the role step and show the fix UI.

## 10. Step 4: Understand the role (`lexicon.ts`, `roles.ts`, `target.ts`)

### Lexicon

A map from canonical skill to aliases, category and optional related skills, about 150 to 300 entries to start:

```ts
export const LEXICON = {
  javascript: { aliases: ["js", "ecmascript"], cat: "language" },
  typescript: { aliases: ["ts"], cat: "language" },
  react: { aliases: ["react.js", "reactjs"], cat: "frontend" },
  "next.js": { aliases: ["nextjs"], cat: "frontend" },
  "node.js": { aliases: ["nodejs", "node"], cat: "backend" },
  postgresql: {
    aliases: ["postgres", "psql"],
    cat: "database",
    related: ["supabase"],
  },
  sql: { aliases: ["mysql", "sqlite"], cat: "database" },
  "tailwind css": { aliases: ["tailwind"], cat: "frontend" },
  python: { aliases: [], cat: "language" },
  "power bi": { aliases: ["powerbi"], cat: "data" },
  // ...
} as const;
```

**Matching rules**

- Compile one regex per canonical term and alias with a custom boundary that works for `c++`, `c#`, `.net`, `node.js`: `(?<![a-z0-9+#.])TERM(?![a-z0-9+#])`, case-insensitive. Escape special characters.
- **Ambiguous words** (`go`, `r`, `c`, `next`, `swift`, `express`, `spring`, `rust`) match only case-sensitively and only when another tech term appears in the same line, or when they appear inside the Skills section.
- Normalize every match to the canonical name so `JS`, `javascript` and `ECMAScript` count as one skill.

### Role presets (`roles.ts`)

For when the user types only a role (no job description). About 12 to 15 roles at the start:

```ts
export const ROLES = {
  "frontend developer": {
    titles: [
      "frontend",
      "front-end",
      "front end",
      "ui developer",
      "web developer",
    ],
    must: ["javascript", "typescript", "react", "html", "css"],
    nice: [
      "next.js",
      "tailwind css",
      "accessibility",
      "responsive",
      "figma",
      "testing",
    ],
    verbs: ["built", "designed", "implemented", "optimized"],
  },
  "data analyst": {
    titles: [
      "data analyst",
      "analytics",
      "business intelligence",
      "bi analyst",
    ],
    must: ["sql", "python", "excel", "data visualization"],
    nice: [
      "power bi",
      "tableau",
      "pandas",
      "statistics",
      "dashboard",
      "reporting",
    ],
    verbs: ["analyzed", "aggregated", "visualized"],
  },
  // backend, full-stack, mobile, ML/AI, devops, QA, UI/UX, IT support, cybersecurity,
  // product manager, social media / marketing, business analyst
};
```

**Match the user's role text to a preset:** lowercase, strip stopwords, then pick the preset with the highest token overlap against its `titles` (ties go to the longer title). If nothing scores above a minimum, use the free-text path below. Show the user which preset was chosen ("Treating this as: Frontend Developer") and let them change it.

### Job description keywords (when the user pastes one)

1. Normalize like the CV text.
2. Find lexicon terms (canonical-normalized) and count occurrences.
3. **Weighting:**
   - Term in a section headed Requirements, Qualifications, Must have, What you need: **weight 2**.
   - Term near "required", "must", "proficient", "strong": **weight 2**.
   - Term in a section headed Nice to have, Preferred, Bonus, Plus: **weight 0.5**.
   - Everywhere else: **weight 1**; add `+0.25` per extra occurrence, capped at `+1`.
4. **Extra terms:** top 10 to 15 unigrams and bigrams from the job description after removing stopwords and company boilerplate (`equal opportunity`, `benefits`, `apply`), each at **weight 0.3**. These catch domain words not in the lexicon.
5. Role title words (for example "frontend", "engineer") are used only for the title match in section 11, not as skills.

### Combined target (`target.ts`)

```text
if job description given:  target = jd_terms (weight as above) + role preset terms at 0.5 (must) / 0.25 (nice)
else:                      target = role preset terms at 1.0 (must) / 0.5 (nice)
```

Output: `Map<canonicalTerm, weight>` plus `requiredTerms` (weight at least 1.5 or in the preset `must` list).

## 11. Step 5: Score items (`score.ts`)

Find target terms inside each CV item using the same lexicon matcher, plus plain word match for the extra terms.

| Item             | Score                                                                                                                                                                  |
| ---------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Skill item       | `weight(term)` if it matches a target term, plus `0.2` if it is a `related` skill of a target term; else `0`                                                           |
| Bullet           | sum of weights of distinct target terms found + `0.3` if it has a metric (`RE.metric`) + `0.1` if it starts with an action verb from the preset or a generic verb list |
| Project          | `1.5 * overlap(tech list, target)` + best bullet score + `0.2` if recent                                                                                               |
| Experience entry | sum of its top 2 bullet scores + `1.0` if its role title shares a title keyword with the role + recency bonus                                                          |
| Certification    | weight of any target term in its name, plus `0.2` if it is within 3 years                                                                                              |
| Education        | fixed: always kept                                                                                                                                                     |

- **Recency bonus:** entries ending in `Present` get `+0.3`; otherwise `0.3 * max(0, 1 - years_since_end / 4)`.
- **Normalize** scores per item type to the range 0 to 1 by dividing by the maximum in that group, so projects and bullets can be compared fairly.
- **Tie-break:** more recent first, then original order. This keeps results stable.
- Save the matched terms on each item (`matches: string[]`) so the UI can explain why it was kept.

## 12. Step 6: Select within one page (`select.ts`)

### Line budget

- Estimate lines per bullet: `ceil(chars / 105)` (about 105 characters per line at 9 to 9.5pt on A4 with the Harvard margins; tune against the real PDF).
- Fixed costs: name and contact 2 lines, each section heading 1.5, each entry header 1, education block about 3, skills 1 line per category (2 if long).
- **Budget** about 58 to 62 lines on one A4 page; set the real number by checking the owner's own resume (it fits about 60 lines).

### Algorithm

1. Start with everything parsed.
2. If the total lines are at most the budget, stop.
3. Otherwise remove the lowest-value unit until it fits, in this order:
   1. Bullets that are not the best 1 of their entry, lowest score first (keep at least 1 bullet per kept entry, at most 3).
   2. Whole projects with the lowest score (keep at least 2 if the CV has 2 or more).
   3. Certifications with the lowest score (keep at least 2).
   4. Experience entries with the lowest score (keep the entries with role match or `Present`).
   5. Skill items with score 0 (matched skills are kept).
4. Every removal is recorded in `dropped` with `reason` such as `"low match to role (score 0.08)"`.
5. **Output order:**
   - Experience: **reverse chronological** (Harvard convention), bullets inside each entry sorted by score descending.
   - Projects: by score descending.
   - Skills: categories ordered by total match; inside a category, matched items first. Keep original wording.
   - Certifications: by score descending, then date.
   - Education: original order.
6. Stop adding bullets to an entry beyond 3.

### Gaps and matched keywords (`gaps.ts`)

- `matched`: target terms found anywhere in the CV, ordered by weight. Show as chips in the result panel.
- `gaps`: `requiredTerms` that never appear in the CV (including aliases). Phrase them as "Not shown in your CV: Docker". If a `related` term is present, add a hint ("You list Supabase; the role asks for PostgreSQL. Add it only if you have used it").

## 13. UI changes

- **Step 2 (role):** role input plus optional job description. Under the input, show the chosen preset and the top target keywords as chips the user can remove or add (this lets the user correct the keyword extraction, which an LLM would have done silently).
- **Step 3 (result):** the same Harvard PDF preview, plus panels: "Matched keywords", "Not shown in your CV" (gaps), "What I cut and why" (dropped, with scores). All stay in the `design.md` style.
- **Status chip:** the work is instant, so use short labels ("Reading your CV", "Matching to role"). No long waits; remove the loading skeleton for tailoring.

## 14. Testing (do this before trusting the output)

- Fixtures: your own CV text, plus 2 to 3 other layouts (single-column modern, one without bullets, one with dates on their own lines). Use fake data for any CV you commit.
- **Faithfulness test:** every bullet, role, org, school and skill in the result must be a substring of the normalized source text. This must always pass.
- **Budget test:** result lines are at most the budget for every fixture and for 3 different roles.
- **Stability test:** the same input twice gives identical output.
- **Sanity checks by role:** for "Frontend Developer" the React and TypeScript bullets rank above the data bullets; for "Data Analyst" the order flips.
- **Regex unit tests:** table-driven tests for email, phone, dates (`Aug 2025 - Present`, `08/2025 - 12/2025`, `2023 - 2024`), GPA and bullets.

## 15. Build order and cuts

Estimated difficulty: this is clearly more code than the LLM version. If you only have one hour, build in this order and stop when time is up:

1. Normalize + sections + header (name, contact). Show raw sections in the UI.
2. Skills, experience and education parsing.
3. Role presets (6 roles) + keyword matching + scoring bullets.
4. Selection within the line budget + `dropped` list.
5. Hook into the existing `ResumePdf.tsx` and download button.
6. Projects, certifications, job-description keywords, gaps panel.
7. Fix-text UI and keyword chips.

**Cut order if short on time:** keyword chips, fix-text UI, related-skill hints, extra JD terms, certifications scoring (just keep newest 3), recency bonus.

**Never cut:** the faithfulness test, the gaps list, the warnings when parsing is uncertain.

## 16. Limits to state honestly

- Unusual layouts (two columns, tables, text in images) can break parsing. The fix-text step and warnings exist for that.
- It cannot rephrase a bullet to match the job's language; it can only choose and order.
- The lexicon decides which skills it understands. Skills outside it are matched only as plain words.

## 17. Submission note update

If you submit this version, the "how I used AI tools" sentence changes: Fitted itself uses no LLM (rules, regex and keyword scoring), and AI tools were used only to plan and write the code. Say why you chose that: it is deterministic, free, instant and cannot invent facts. Fill in the parts you actually did and tested yourself.
