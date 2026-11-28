# resume-style.md: Reference Resume Design Description

Use this together with the reference resume image for the Fitted app. It describes the layout of the owner's resume (Harvard / "Jake's resume" style, LaTeX look) so `components/ResumePdf.tsx` can reproduce it. Personal details are replaced with placeholders. If this file and `build.md` section 5a disagree, this file wins.

## 0. ATS-first rules (these override everything below)

ATS means Applicant Tracking System. It reads the PDF's text layer in order (top to bottom, left to right) and sorts it into fields like name, skills and experience. It fails on icons, tables, columns, text boxes, images and text placed in page headers or footers. The tailored resume that Fitted outputs must pass this first, and look like the reference second. If any section below disagrees with this section, this section wins.

**Content and structure**

1. **Real text only.** The PDF is generated from text (`@react-pdf/renderer`). No images, no icons, no emoji, no charts, no skill bars or ratings, no photo.
2. **One column, one reading order.** No tables, no multi-column layout, no text boxes. Right-aligned dates are fine because they sit on the same line as the title, in order (title, organization, date).
3. **Everything important in the page body.** Do not put the name or contact details in a header or footer area.
4. **Standard section headings, exactly these names, in this order:** `Skills`, `Experience`, `Projects`, `Education`, `Certifications`. (This is a deliberate change from the reference's "Technical Skills" and "Certifications & Achievements": the plain names are the ones parsers recognize most reliably.) Skip a section that has no content. No summary section.
5. **Contact line in plain visible text:** `email | phone | linkedin.com/in/username | github.com/username | portfolio URL`. No icons. Write each URL as visible text; it may also be a clickable link, but the text must show the address. Do not use labels like "GitHub" that hide the URL.
6. **Dates in one format everywhere:** `Mon YYYY - Mon YYYY` or `Mon YYYY - Present`, with a plain hyphen (not an en dash).
7. **Bullets use a plain `•` character,** as real text in front of each bullet.
8. **No decoration that carries meaning:** colors, underlines, small caps, all-caps body text, and special symbols must not be used to convey information. Horizontal rules under headings are allowed (they are drawn lines, not text).

**Font and size**

| Element                                   | Value                                                                                                                                                                                                |
| ----------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Font                                      | One standard family only: `Times-Roman`, `Times-Bold`, `Times-Italic` (equivalent to Times New Roman). `Helvetica` (Arial equivalent) is the only allowed alternative. No custom or decorative fonts |
| Name                                      | 18pt, bold, centered                                                                                                                                                                                 |
| Contact line                              | 10pt, centered                                                                                                                                                                                       |
| Section headings                          | 11.5pt, bold                                                                                                                                                                                         |
| Entry titles (role, project name, school) | 10.5pt, bold                                                                                                                                                                                         |
| Body, bullets, skills lines, dates        | 10pt                                                                                                                                                                                                 |
| Minimum size anywhere                     | 10pt                                                                                                                                                                                                 |
| Line height                               | about 1.15                                                                                                                                                                                           |
| Margins                                   | 12-13mm on all sides, never less than 12mm                                                                                                                                                           |
| Page                                      | A4, exactly one page                                                                                                                                                                                 |

**Not too much text**

- Target 450 to 600 words in total.
- At most 3 bullets per experience entry and 2 per project.
- Each bullet at most 2 lines (about 220 characters). Shorter is better; start with the action and keep the metric.
- At most 4 experience entries, 3 projects, 3 certifications and 4 skills lines (about 16 skill items in total).
- When content does not fit, cut the least relevant items. Never shrink the font below 10pt and never reduce margins.

**Keywords**

- Use the standard spelling of a skill (for example "JavaScript", not "JS") so keyword matching works. In non-LLM mode this is allowed in the Skills section only (see `non-llm.md` section 12a).
- Mention each matched skill where the user really used it (a bullet or a project), not only in the Skills section.

**PDF file properties**

- Text must be selectable and copyable in reading order.
- Set the document title to `<Name> - Resume`, the author to the user's name, and the language to English.
- File name: `Firstname-Lastname-Resume.pdf` (add the role if wanted, with hyphens, no spaces).

**Self-check (run in tests)**
Extract the text of the generated PDF with `unpdf` and assert: exactly one page; the headings appear in the order from rule 4; the email and phone appear as text; no characters in the private-use range (`/[\uE000-\uF8FF]/`) and no icon glyphs; the first line is the user's name; the word count is within the target.

## 1. Overall look

- One page, single column, black text on white. No color blocks, no photo, no sidebar, no shading.
- Very dense and compact: small body text, tight line spacing, narrow margins, little space between entries. The page is almost full.
- Serif typeface in the style of LaTeX's default (Computer Modern). Regular, **bold** and _italic_ are used to create hierarchy; there are no other fonts or sizes beyond the name and section headings.
- Left-aligned text with ragged right edge. Lines that have a date use the full page width, with the date pushed to the right edge.
- Portrait A4 (or Letter) with narrow margins, about 12-15mm (roughly 0.5 inch) on all sides.

## 2. Size and spacing guide (approximate, tune against the image)

| Element                                | Approximate value                                                       |
| -------------------------------------- | ----------------------------------------------------------------------- |
| Name                                   | 18pt, bold, centered (ATS rule)                                         |
| Contact line                           | 10pt, centered, regular (ATS rule)                                      |
| Section headings                       | 11-11.5pt, bold, left aligned                                           |
| Body text (bullets, skills, details)   | 10pt, line-height about 1.15 (ATS rule)                                 |
| Entry title lines                      | 10.5pt bold (ATS rule)                                                  |
| Space above a section heading          | 6-8pt                                                                   |
| Space between entries inside a section | 3-4pt                                                                   |
| Space between bullets                  | 1-2pt                                                                   |
| Bullet indent                          | about 12-14pt, with hanging indent so wrapped lines align with the text |

## 3. Header

- Line 1: full name, centered, large, bold, serif. Example: `[Full Name]`.
- Line 2: contact items centered on one line, separated by a thin vertical bar `|` with space around it. Order: portfolio or website, LinkedIn, GitHub or other link, email, phone.
- No icons (ATS rule): every contact item is plain visible text, separated by `|`.
- No border or rule under the header block; the first section heading follows after a small gap.

## 4. Section headings

- Five sections, in this fixed order, with the ATS heading names from section 0: **Skills**, **Experience**, **Projects**, **Education**, **Certifications**.
- Each heading is bold, left aligned, slightly larger than body text, in title case (not all caps).
- A thin solid black horizontal rule runs under the heading across the full content width (about 0.5-0.75pt), with a very small gap between the text and the rule.

## 5. Technical Skills

- A bulleted list, one bullet per skill category.
- Each line starts with a round bullet, then a **bold category label**, a colon, and a comma-separated list of regular-weight items. Example: `• **Languages:** item, item, item`.
- Categories come from the user's CV (for example: Languages, Frameworks & Libraries, Tools & Infrastructure, and a fourth topical category). Lines may wrap to a second line with a hanging indent.
- Item names keep their original capitalization (for example product and library names).

## 6. Experience entries

Each entry has a title line followed by bullets.

- **Title line:** a single full-width row. Left side: **bold role title**, then a vertical bar `|`, then _italic organization name_. Right side: _italic date range_, right aligned to the page edge (format: `Mon YYYY – Mon YYYY` or `Mon YYYY – Present`).
- **Bullets:** 2 to 3 round bullets per entry, regular weight, left aligned with hanging indent. Each bullet is one to two lines long. Bullets start with an action verb and often contain a metric.
- Entries are ordered most recent first, with a small gap between entries.

## 7. Project entries

- **Title line:** left side: **bold project name**, then `|`, then _italic role_ (for example a title like Technical Lead), then `|`, then _italic technologies list_ (comma-separated). Right side: _italic date_ (month and year, or a range), right aligned.
- **Bullets:** 2 round bullets per project, regular weight.
- The title line can be long; keep it on one line by letting the tech list wrap only if needed.

## 8. Education

- Row 1: **bold school name** on the left, _italic date range_ on the right.
- Row 2: _italic degree name_ on the left, **bold GPA or grade text** on the right (for example `GWA: [value] ([honor])`), right aligned.
- Row 3 (optional): **bold** `Relevant Coursework:` followed by a comma-separated list in regular weight.
- No bullets in this section.

## 9. Certifications & Achievements

- A bulleted list.
- Each line: **bold certification or achievement name**, then `|`, then _italic issuer_ or detail (and an optional credential ID in parentheses). The date sits at the right edge, right aligned.
- Credential IDs are in small regular text and can be dropped if space is tight.

## 10. Text rules

- Date format everywhere: `Mon YYYY` (for example `Aug 2025`), ranges with a plain hyphen and spaces: `Aug 2025 - Present`.
- Use the vertical bar `|` as the separator inside title lines and the contact line; never use commas or dashes for that.
- Do not use all caps, underlines, colors, emojis or text boxes. Links, if any, are plain text.
- Fit to exactly one page. If content overflows, cut content (fewer bullets or entries) before changing anything else. Never reduce the font below 10pt or the margins below 12mm.

## 11. Implementation notes for `@react-pdf/renderer`

- Fonts: LaTeX's Computer Modern is not built in. Use `Times-Roman`, `Times-Bold` and `Times-Italic` (built in, closest match). Optional upgrade if time allows: register a Latin Modern or Computer Modern font file and use its regular, bold and italic faces.
- Rows with left and right content: `View` with `flexDirection: "row"` and `justifyContent: "space-between"`; give the left part `flexShrink: 1` so long titles wrap instead of pushing the date off the page.
- Heading rule: `borderBottomWidth: 0.6` and `borderBottomColor: "#000"` on the heading `View`.
- Bullets: a row with a small bullet character and a text block with `flex: 1`; this gives the hanging indent.
- Keep each entry together with `wrap={false}`. Use a single `<Page size="A4">` and padding of about 36pt; check that the content fits on one page.
- Mixed bold, italic and regular text in one line: nest `<Text>` elements with different `fontFamily` values.

## 12. Differences from `build.md` section 5a (this file overrides)

- Contact line: no icons (ATS rule); plain visible text only.
- Technical Skills lines are bulleted.
- Project title line has three parts: name, role, technologies.
- Education: GPA or grade text on the right of the degree line, in bold.
- Certifications & Achievements: name in bold, issuer in italic, date at the right.
