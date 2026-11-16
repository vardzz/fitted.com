# resume-style.md: Reference Resume Design Description

Use this together with the reference resume image for the Fitted app. It describes the layout of the owner's resume (Harvard / "Jake's resume" style, LaTeX look) so `components/ResumePdf.tsx` can reproduce it. Personal details are replaced with placeholders. If this file and `build.md` section 5a disagree, this file wins.

## 1. Overall look

- One page, single column, black text on white. No color blocks, no photo, no sidebar, no shading.
- Very dense and compact: small body text, tight line spacing, narrow margins, little space between entries. The page is almost full.
- Serif typeface in the style of LaTeX's default (Computer Modern). Regular, **bold** and _italic_ are used to create hierarchy; there are no other fonts or sizes beyond the name and section headings.
- Left-aligned text with ragged right edge. Lines that have a date use the full page width, with the date pushed to the right edge.
- Portrait A4 (or Letter) with narrow margins, about 12-15mm (roughly 0.5 inch) on all sides.

## 2. Size and spacing guide (approximate, tune against the image)

| Element                                | Approximate value                                                       |
| -------------------------------------- | ----------------------------------------------------------------------- |
| Name                                   | 22-24pt, bold, centered                                                 |
| Contact line                           | 8.5-9pt, centered, regular                                              |
| Section headings                       | 11-11.5pt, bold, left aligned                                           |
| Body text (bullets, skills, details)   | 9-9.5pt, line-height about 1.15                                         |
| Entry title lines                      | 9.5-10pt                                                                |
| Space above a section heading          | 6-8pt                                                                   |
| Space between entries inside a section | 3-4pt                                                                   |
| Space between bullets                  | 1-2pt                                                                   |
| Bullet indent                          | about 12-14pt, with hanging indent so wrapped lines align with the text |

## 3. Header

- Line 1: full name, centered, large, bold, serif. Example: `[Full Name]`.
- Line 2: contact items centered on one line, separated by a thin vertical bar `|` with space around it. Order: portfolio or website, LinkedIn, GitHub or other link, email, phone.
- Each contact item has a small icon in front of it (a globe or link, a LinkedIn glyph, a GitHub glyph, an envelope, a phone). Icons are tiny, about the height of the text. If icons are hard to render in the PDF, use plain text labels instead of icons and keep everything else the same.
- No border or rule under the header block; the first section heading follows after a small gap.

## 4. Section headings

- Five sections, in this fixed order: **Technical Skills**, **Experience**, **Projects**, **Education**, **Certifications & Achievements**.
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

- Date format everywhere: `Mon YYYY` (for example `Aug 2025`), ranges with an en dash and spaces: `Aug 2025 – Present`.
- Use the vertical bar `|` as the separator inside title lines and the contact line; never use commas or dashes for that.
- Do not use all caps, underlines, colors, emojis or text boxes. Links, if any, are plain text.
- Fit to exactly one page. If content overflows, cut content (fewer bullets or entries) before reducing font size below 9pt.

## 11. Implementation notes for `@react-pdf/renderer`

- Fonts: LaTeX's Computer Modern is not built in. Use `Times-Roman`, `Times-Bold` and `Times-Italic` (built in, closest match). Optional upgrade if time allows: register a Latin Modern or Computer Modern font file and use its regular, bold and italic faces.
- Rows with left and right content: `View` with `flexDirection: "row"` and `justifyContent: "space-between"`; give the left part `flexShrink: 1` so long titles wrap instead of pushing the date off the page.
- Heading rule: `borderBottomWidth: 0.6` and `borderBottomColor: "#000"` on the heading `View`.
- Bullets: a row with a small bullet character and a text block with `flex: 1`; this gives the hanging indent.
- Keep each entry together with `wrap={false}`. Use a single `<Page size="A4">` and padding of about 36pt; check that the content fits on one page.
- Mixed bold, italic and regular text in one line: nest `<Text>` elements with different `fontFamily` values.

## 12. Differences from `build.md` section 5a (this file overrides)

- Contact line: small icons in front of each item are allowed (text labels are the fallback).
- Technical Skills lines are bulleted.
- Project title line has three parts: name, role, technologies.
- Education: GPA or grade text on the right of the degree line, in bold.
- Certifications & Achievements: name in bold, issuer in italic, date at the right.
