# Design System & Inspo Guide: Adrian Abelarde Style

An engineering-led, ultra-minimalist, precision design system inspired by [adrianabelarde.com](https://adrianabelarde.com/). Built for clean software that feels tactile, responsive, and thoughtfully crafted.

---

## 1. Design Philosophy

- **Tactile Software**: Every click, hover, and state change offers instant, subtle physics feedback (`scale(0.97)`, diffuse shadow bloom, hairline border transitions).
- **Warm Neutral Canvas**: Replaces sterile, blinding `#ffffff` backgrounds with a calm, editorial `#f6f6f6` canvas. Surfaces float gracefully above it.
- **Medium-Weight Typography**: Prioritizes `font-medium` (500) as default body weight for crisp authority and optical readability across all devices.
- **Monochrome with Purpose**: High-contrast `#0a0a0a` against `#ffffff` with minimal, intentional functional color (live emerald green `#22a06b`, pulse orange `#f95721`).
- **Signature Accent**: The repeating 45-degree diagonal stripe ribbon anchor (`.stripes-band`).

---

## 2. Typography

### Font Families
- **Primary Interface**: `Inter` (via `next/font/google` or system fallback)
  - `font-family: var(--font-inter), "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;`
  - Body default weight: **500 (Medium)** — the defining characteristic of this style.
  - Heading weight: **600 (Semi-Bold)** or **700 (Bold)**.
- **Monospace / Code**: `JetBrains Mono`
  - `font-family: var(--font-jetbrains), "JetBrains Mono", ui-monospace, SFMono-Regular, monospace;`
  - Used for technical status, timestamps, file pills, tags, and progress logs.

### Type Scale & Metrics
| Role | Size | Weight | Tracking (Letter Spacing) | Line Height |
| :--- | :--- | :--- | :--- | :--- |
| **Hero Title (h1)** | `38px` (`2.375rem`) | 600 / 700 | `-0.035em` | `1.15` |
| **Section Title (h2)**| `22px` (`1.375rem`) | 600 | `-0.025em` | `1.25` |
| **Subtitle / Lead** | `15px` (`0.9375rem`)| 450 / 500 | `-0.01em` | `1.55` |
| **Body Text** | `14.5px` (`0.906rem`)| 500 | `normal` | `1.55` |
| **Buttons / Chips** | `13.5px` (`0.844rem`)| 500 | `-0.01em` | `1.4` |
| **Mono Badges / Tags**| `11px - 12px` | 500 | `0.02em` | `1` |

---

## 3. Color Tokens

```css
:root {
  /* Canvas & Surfaces */
  --color-canvas: #f6f6f6;             /* Editorial neutral background */
  --color-surface: #ffffff;            /* Floating cards, modals, sheets */
  --color-surface-subtle: #fafafa;     /* Secondary surface fill */

  /* Text & Foreground */
  --color-fg: #0a0a0a;                 /* Deep primary charcoal black */
  --color-fg-muted: #737373;           /* Secondary body, descriptions */
  --color-fg-subtle: #a3a3a3;          /* Placeholder, timestamps, icons */

  /* Hairline Borders */
  --color-border: #e5e5e5;             /* Razor-thin 1px container borders */
  --color-border-hover: #0a0a0a;       /* Active / focused interactive borders */

  /* Functional Accents */
  --color-accent: #0a0a0a;             /* Primary interactive action color */
  --color-live: #22a06b;               /* Success / Connected / Verified */
  --color-accent-orange: #f95721;      /* Active build dot / processing pulse */
  --color-accent-orange-hover: #ea4b16;
  --color-warn: #b45309;               /* Advisory badges */
  --color-error: #e40014;              /* Destructive / validation error */
}
```

### Signature Accents
```css
/* High-contrast Selection */
::selection {
  background: #0a0a0a;
  color: #ffffff;
}

/* Top Diagonal Stripes Ribbon */
.stripes-band {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
  z-index: 100;
  background-image: repeating-linear-gradient(-45deg, #d9d9d9 0 7px, #ededed 7px 14px);
  pointer-events: none;
}
```

---

## 4. Motion & Animation Physics

### Exact Easing Curves
```css
:root {
  /* Quintic ease-out: Snappy, sharp start with long, silky settling */
  --ease-out: cubic-bezier(0.23, 1, 0.32, 1);

  /* Symmetric ease-in-out: Fluid transitions */
  --ease-in-out: cubic-bezier(0.77, 0, 0.175, 1);

  /* Drawer curve: Natural mechanical unfolding */
  --ease-drawer: cubic-bezier(0.32, 0.72, 0, 1);

  /* Spring entrance */
  --ease-spring: cubic-bezier(0.16, 1, 0.3, 1);

  --t-fast: 180ms;
  --t-base: 280ms;
  --t-slow: 450ms;
}
```

### Tactile Micro-Interactions
```css
/* Physical button press sensation */
button:active:not(:disabled),
.chip:active,
.btn:active:not(:disabled) {
  transform: scale(0.97);
}

/* Hover lift */
.card-hover:hover {
  transform: translateY(-1px);
  border-color: var(--color-border-hover);
  box-shadow: 0 4px 16px -4px rgba(0, 0, 0, 0.06);
}

/* Clean dual-ring focus state */
button:focus-visible,
input:focus-visible,
textarea:focus-visible {
  outline: none;
  box-shadow: 0 0 0 2px var(--color-canvas), 0 0 0 4px rgba(10, 10, 10, 0.12);
}
```

### Staggered Cascading Entrance
Elements don't pop into the viewport simultaneously; they cascade with tiny time offsets:
```css
.stagger-1 { animation: smooth-rise 0.7s cubic-bezier(0.16, 1, 0.3, 1) both; }
.stagger-2 { animation: smooth-rise 0.7s cubic-bezier(0.16, 1, 0.3, 1) 0.08s both; }
.stagger-3 { animation: smooth-rise 0.7s cubic-bezier(0.16, 1, 0.3, 1) 0.16s both; }
.stagger-4 { animation: smooth-rise 0.7s cubic-bezier(0.16, 1, 0.3, 1) 0.24s both; }

@keyframes smooth-rise {
  from {
    opacity: 0;
    transform: translateY(20px) scale(0.99);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}
```

---

## 5. UI Component Blueprints

### A. Action Chips (`.claude-chip`)
Pill buttons that respond with physics on hover and click:
```css
.chip {
  background: #ffffff;
  border: 1px solid #e5e5e5;
  border-radius: 9999px;
  padding: 8px 16px;
  font-size: 13.5px;
  font-weight: 500;
  color: #0a0a0a;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.02);
  display: inline-flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  transition: all 180ms cubic-bezier(0.23, 1, 0.32, 1);
}

.chip:hover {
  border-color: #0a0a0a;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px -2px rgba(0, 0, 0, 0.06);
}

.chip:active {
  transform: scale(0.97);
}
```

### B. High-Contrast Chat Thread
- **User Messages**: Inverted `#0a0a0a` background with `#ffffff` text.
- **AI / App Messages**: Elevated `#ffffff` card with `#0a0a0a` text and `#e5e5e5` hairline border.
```css
.bubble-ai {
  background: #ffffff;
  border: 1px solid #e5e5e5;
  border-radius: 16px;
  border-top-left-radius: 4px;
  padding: 16px 18px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.03), 0 4px 16px -4px rgba(0, 0, 0, 0.04);
  max-width: 540px;
  font-size: 14.5px;
  line-height: 1.55;
  color: #0a0a0a;
}

.bubble-user {
  background: #0a0a0a;
  color: #ffffff;
  border: 1px solid #0a0a0a;
  border-radius: 16px;
  border-top-right-radius: 4px;
  padding: 12px 18px;
  max-width: 480px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.08);
}
```

### C. Floating Pill Prompt Bar
A floating rounded input with minimal monochrome submit circle:
```css
.prompt-bar {
  display: flex;
  align-items: center;
  background: #ffffff;
  border: 1px solid #e5e5e5;
  border-radius: 9999px;
  padding: 6px 8px 6px 14px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.03), 0 6px 20px -4px rgba(0, 0, 0, 0.05);
  gap: 8px;
  transition: all 180ms cubic-bezier(0.23, 1, 0.32, 1);
}

.prompt-bar:focus-within {
  border-color: #0a0a0a;
  box-shadow: 0 0 0 2px #f6f6f6, 0 0 0 4px rgba(10, 10, 10, 0.12), 0 8px 24px -4px rgba(0, 0, 0, 0.06);
}

.prompt-submit {
  width: 34px;
  height: 34px;
  border-radius: 50%;
  background: #0a0a0a;
  color: #ffffff;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  cursor: pointer;
  transition: all 180ms cubic-bezier(0.23, 1, 0.32, 1);
}

.prompt-submit:hover:not(:disabled) {
  background: #262626;
  transform: scale(1.05);
}

.prompt-submit:active:not(:disabled) {
  transform: scale(0.95);
}

.prompt-submit:disabled {
  background: #e5e5e5;
  color: #a3a3a3;
  cursor: not-allowed;
}
```

### D. Zero-Jank Accordion Expansion
Avoids `display: none` or conditional DOM unmounting:
```css
.accordion-wrapper {
  display: grid;
  grid-template-rows: 1fr;
  transition: grid-template-rows 0.4s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.3s ease;
  opacity: 1;
}

.accordion-wrapper.collapsed {
  grid-template-rows: 0fr;
  opacity: 0;
  pointer-events: none;
}

.accordion-inner {
  overflow: hidden;
}
```

---

## 6. Checklist for New Features

- [ ] Does the page use `#f6f6f6` canvas with `#ffffff` floating cards?
- [ ] Is text styled in **Inter** with **Medium (500)** weight?
- [ ] Are headings set with negative tracking (`-0.035em`)?
- [ ] Are interactive buttons and chips equipped with `:active { transform: scale(0.97); }`?
- [ ] Do transitions use `cubic-bezier(0.23, 1, 0.32, 1)` rather than generic `ease`?
- [ ] Is high-contrast `::selection` enabled?
- [ ] Are borders razor-sharp hairline `#e5e5e5`?
