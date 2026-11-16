# design.md: UI, Motion and Animation for Fitted

Companion to `build.md` (what to build) and `phases.md` (when). This file says how the Fitted app should look and move.

Reference site: https://eduardoalba.com/

## 0. What this is based on (read first)

The reference site renders with JavaScript, so only its page metadata could be read. These facts are confirmed:

- Theme color is `#fafaf9` (a warm off-white).
- It describes itself as a software engineer's personal site that explores motion design through AI.
- It is a live, multiplayer site where visitors can see who else is there.

The rest of this file is an interpretation of that direction: a calm, warm, minimal look where motion carries the personality. It is NOT a copy of the site's layout, text or animations, and nothing here claims to match them exactly. When the owner sends screenshots or a screen recording of the site, update sections 2-6 to match.

## 1. Design principles

1. **Calm and minimal.** Warm off-white page, near-black text, one accent color, lots of space.
2. **Type-led.** Hierarchy comes from size and weight, not boxes and shadows.
3. **Motion with a reason.** Every animation shows a state change (uploaded, thinking, ready). No decorative loops.
4. **A sense of presence.** Borrowed from the reference's "see who's here" idea: the app always shows what it is doing right now with a small live status chip.
5. **The resume is the hero.** The app chrome stays quiet so the generated resume stands out.
6. **Scope discipline.** Design work is the first thing cut. Total design time budget: 10 minutes spread across Phases 2-4 of `phases.md`. The tailored result and the honest submission matter more than polish.

## 2. Color tokens

Define as CSS variables in `app/globals.css`. Light mode only.

| Token           | Value     | Use                                            |
| --------------- | --------- | ---------------------------------------------- |
| `--bg`          | `#fafaf9` | Page background (confirmed from the reference) |
| `--surface`     | `#ffffff` | Cards, panels, the resume sheet                |
| `--ink`         | `#1c1917` | Primary text                                   |
| `--muted`       | `#78716c` | Secondary text, helper text                    |
| `--line`        | `#e7e5e4` | Borders and dividers                           |
| `--accent`      | `#2f5bea` | Primary button, focus ring, live status dot    |
| `--accent-soft` | `#eaefff` | Hover and selected backgrounds                 |
| `--ok`          | `#15803d` | Success state                                  |
| `--warn`        | `#b45309` | Gaps and warnings                              |
| `--error`       | `#b91c1c` | Error messages                                 |

Rules: one accent only. No gradients. No dark mode in the first hour. Body text contrast must stay at least 4.5:1.

## 3. Typography

- UI font: `Inter` via `next/font/google`, fallback `system-ui, sans-serif`. One family only.
- The generated PDF is separate: it uses Times (see `build.md` section 5a). Do not apply UI fonts to it.

| Role              | Size                  | Weight | Notes                                     |
| ----------------- | --------------------- | ------ | ----------------------------------------- |
| Page title        | 40px (28px on mobile) | 600    | letter-spacing `-0.02em`, line-height 1.1 |
| Step heading      | 24px                  | 600    | letter-spacing `-0.01em`                  |
| Body              | 16px                  | 400    | line-height 1.55                          |
| Helper and labels | 13-14px               | 500    | color `--muted`                           |
| Status chip       | 12px                  | 500    | uppercase not needed                      |

## 4. Layout

- Single centered column for steps 1 and 2: `max-width: 640px`, 24px side padding, 96px top padding on desktop.
- Result step (step 3): two columns on desktop. Left (about 60%): PDF preview on a white sheet. Right (about 40%): "What I cut and why" and "Not shown in your CV" panels. Stack on screens under 900px with the Download button first.
- Spacing scale: 4, 8, 12, 16, 24, 32, 48, 64.
- Radius: 12px for cards, 10px for inputs and buttons, 999px for chips.
- Borders over shadows: 1px `--line`. The only shadow allowed is a soft one on the resume sheet: `0 1px 2px rgba(0,0,0,.04), 0 8px 24px rgba(0,0,0,.06)`.

## 5. Components

- **Page header:** the wordmark "Fitted" in text on the left (Inter, 600 weight, no logo image), nothing else. No navbar.
- **Tagline (under the page title on step 1):** "Your CV, cut to fit the role." One line, `--muted` color.
- **Dropzone (step 1):** large dashed-border card (`1px dashed var(--line)`), a short line of text, a "Choose PDF" button, and a smaller "or paste your CV text" link below it that reveals a textarea.
- **Primary button:** filled `--accent`, white text, 44px tall, radius 10px. Secondary button: white with `--line` border.
- **Inputs:** white background, 1px `--line` border, 44px tall; textarea min-height 160px. Focus: 2px `--accent` ring with 2px offset.
- **Profile summary (after upload):** a white card with the name large and three small count chips (roles, projects, skills).
- **Role step:** one text input with the question "What role are you applying for?" as the heading, plus a collapsed "Paste a job description (optional)" textarea.
- **Status chip ("presence"):** pill with a small pulsing dot and a short label, for example "Reading your CV", "Tailoring for Frontend Engineer", "Ready". It sits above the active step.
- **Panels ("cut" and "gaps"):** white cards, small heading, plain list. Gaps use a `--warn` dot; cut items use a `--muted` dot.
- **Errors:** inline text under the control in `--error`, no modals. The scanned-PDF message must offer the paste-text fallback as a button.

## 6. Motion

Principle: short, soft, springy. Motion confirms what just happened.

### Timing tokens

```css
:root {
  --ease-out: cubic-bezier(0.22, 1, 0.36, 1); /* default entrance */
  --ease-spring: cubic-bezier(
    0.34,
    1.56,
    0.64,
    1
  ); /* small overshoot, use sparingly */
  --t-fast: 150ms;
  --t-base: 280ms;
  --t-slow: 480ms;
}
```

### Animations to build (priority order, cut from the bottom)

1. **Page load:** title and first card fade up 12px over `--t-slow` with `--ease-out`, staggered 80ms.
2. **Step transition:** outgoing step fades out over `--t-fast`; the incoming step fades up 12px over `--t-base`. Use a CSS class toggle, no animation library.
3. **Buttons and dropzone:** hover lifts 1px and darkens slightly over `--t-fast`. Dropzone on drag-over: border turns `--accent`, background `--accent-soft`, scale 1.01.
4. **Status chip:** the dot pulses (opacity 1 to 0.4, 1.2s ease-in-out infinite) only while work is running; it turns solid `--ok` when done. Label text crossfades over `--t-fast` when it changes.
5. **Profile summary reveal:** count chips pop in one by one (scale 0.9 to 1 with `--ease-spring`, 60ms stagger).
6. **Result reveal:** the resume sheet fades and rises from `translateY(16px) scale(0.98)` to rest over `--t-slow`; then the two panels fade in with 120ms stagger. The PDF preview is an iframe, so animate its container, not its contents.
7. **Download button:** after a click, the label changes to "Saved" with a check for 1.5s, then returns.

### Rules

- Animate only `opacity` and `transform`. Never animate layout properties like width or height.
- No motion longer than 600ms. No infinite loops except the status dot.
- Respect reduced motion:

```css
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

- Implement with CSS keyframes and transitions only. Do not add Framer Motion, GSAP or Lottie in the first hour.

## 7. States checklist

| State               | What the user sees                                                                   |
| ------------------- | ------------------------------------------------------------------------------------ |
| Empty               | Dropzone with one line of text and the paste-text link                               |
| Uploading / parsing | Status chip "Reading your CV", dropzone replaced by a skeleton card                  |
| Parsed              | Profile summary card, role input appears with a step transition                      |
| Tailoring           | Status chip "Tailoring for <role>", button disabled with a spinner-free label change |
| Clarifying question | One question card with a text input, then continue                                   |
| Ready               | Resume sheet and panels revealed, Download button in the accent color                |
| Error               | Inline message under the control, with the next action as a button                   |

## 8. Accessibility

- All controls reachable by keyboard with a visible focus ring.
- File input has a real `<label>`; status chip uses `aria-live="polite"`.
- Do not rely on color alone for gaps vs cuts; keep the headings.
- Touch targets at least 44px.

## 9. Do NOT build (out of scope)

- Live multiplayer cursors, websockets, or any "who's here" backend. The reference's presence feature is only an inspiration for the status chip.
- Fake visitors or fake users. Nothing in the UI may imply other people are online.
- Custom cursors, cursor trails, 3D, particles, scroll-jacking, or sound.
- Dark mode, theme switchers, multiple templates for the resume.
- Any animation on the PDF itself. The PDF stays a static Harvard-style document.

## 10. Open items for the owner

- Send 2-4 screenshots or a short screen recording of the reference site (hero, hover states, any motion you like). Then update the colors, type and motion sections to match what you actually like, instead of this interpretation.
- Confirm the accent color, or keep `#2f5bea`.
