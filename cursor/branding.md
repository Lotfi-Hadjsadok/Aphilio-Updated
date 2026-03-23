# Aphilio — brand & UI reproduction guide

This document captures the visual system as implemented in the codebase so you can rebuild the same look elsewhere (marketing sites, decks, or another app). **Source of truth** for colors is `app/globals.css` (OKLCH CSS variables). **Shadcn** preset: `radix-mira`, base `zinc`, CSS variables enabled (`components.json`).

---

## Product & stack (context)

- **Name:** Aphilio (see `app/[locale]/layout.tsx` metadata).
- **UI:** Shadcn + Radix, **Lucide** icons, Tailwind CSS v4 (`@import "tailwindcss"` in `app/globals.css`).
- **Body:** `antialiased`, `bg-background`, `text-foreground`.

---

## Typography

### Loaded fonts (`next/font` in `app/[locale]/layout.tsx`)

| Role | Font | CSS variable | Notes |
|------|------|----------------|-------|
| **UI / Latin** | **Inter** | `--font-sans` | Default sans; applied via `font-sans` on `<body>` (non-Arabic locales). |
| **Arabic** | **Cairo** | `--font-arabic` | When `locale === "ar"`, body uses `font-arabic` class. |
| **Logo / display** | **Baloo 2** (400, 600, 700) | `--font-logo` | Use class `font-logo` where needed. |
| **Accent / playful** | **Fuzzy Bubbles** (400) | `--font-fuzzy-bubbles` | Available as a variable on `<html>`; use when matching playful UI. |

`globals.css` maps theme mono to `--font-geist-mono` for `font-mono`. If that variable is not set by a font loader, browsers fall back to `ui-monospace` / system mono—**for parity**, load **Geist Mono** (or JetBrains Mono, etc.) and assign `--font-geist-mono`, or use Inter/system for code-like text.

### Base styles

- Default body: `font-family: var(--font-sans), ui-sans-serif, sans-serif`.
- Arabic: `var(--font-arabic)` first (see `[lang="ar"] body` and `.font-arabic` in `globals.css`).

---

## Color philosophy

- **Primary UI** is **minimalist cool gray** (low chroma, ~286° hue)—not a loud brand color on buttons by default.
- **Brand energy** comes from the **multi-stop accent gradient** (orange → red → purple → blue → pink) used for highlights, gradient text, pills, and borders—not from solid primary fills alone.

---

## Semantic colors (CSS variables)

Values are **OKLCH** in `:root` (light) and `.dark` (dark). Reproduce by copying the same OKLCH strings or converting to sRGB/hex in your design tool.

### Light (`:root`)

| Token | Purpose |
|-------|---------|
| `--background` | Page background (~99% lightness, tiny chroma). |
| `--foreground` | Main text (~14.5% L). |
| `--card` / `--card-foreground` | Surfaces; white card on light gray page. |
| `--popover` | Popovers/dropdowns (same family as card). |
| `--primary` / `--primary-foreground` | **Gray** primary (~38% L), near-white foreground—**not** the rainbow. |
| `--secondary` / `--secondary-foreground` | Soft gray secondary surface. |
| `--muted` / `--muted-foreground` | Muted blocks and secondary text (~48% L for muted text). |
| `--accent` / `--accent-foreground` | Matches primary gray pattern (interactive emphasis). |
| `--destructive` | Red for errors/destructive actions. |
| `--border` / `--input` | ~91% L gray borders and inputs. |
| `--ring` | Focus ring (primary gray with alpha). |
| `--chart-1` … `--chart-5` | Chart palette (gray / blue-tinted steps). |
| `--sidebar-*` | Sidebar-specific tokens (very light sidebar, gray primaries, soft accent row). |

**Radius:** `--radius: 0.75rem` (12px). Derived: `radius-sm` = radius − 4px, `radius-lg` = radius, `radius-xl` = radius + 4px, etc.

### Dark (`.dark`)

Same token names; backgrounds shift to **~13% L** blue-violet tinted base, cards **~18% L**, borders use **white at 8–12%** on dark. Primary lightens to **~65% L** gray for contrast on dark surfaces.

### Accent gradients (brand color)

Defined in `:root`:

- **`--accent-gradient`**  
  `linear-gradient(135deg, #f97316 0%, #ef4444 25%, #a855f7 50%, #3b82f6 75%, #ec4899 100%)`  
  (orange → red → purple → blue → pink).

- **`--accent-gradient-subtle`**  
  Same hue story in **OKLCH** at low opacity (~0.15)—for soft tinted surfaces.

**Usage classes in CSS:**

- `bg-accent-gradient` — solid gradient fill.
- `bg-accent-gradient-subtle` — soft gradient wash.
- `text-gradient` — gradient clipped to text (white text fill overridden).
- `gradient-border-2` / `gradient-border-2-bg` — **double-background** trick: card/background fill inside, gradient on the border (2px).
- `gradient-pill` — uppercase micro badge: gradient bg, white text, `border-radius: 9999px`, small type, bold, slight letter-spacing.

### Browser chrome

- `theme-color` viewport: **light** `#ffffff`, **dark** `#0a0a0a` (`app/[locale]/layout.tsx`).

---

## Backgrounds & atmosphere

| Pattern | Behavior |
|---------|----------|
| **Body vignette** | Light: radial ellipse at top, very subtle gray tint. Dark: stronger cool tint. |
| **`.landing-grid-bg`** | 60×60px grid lines (light gray / dark adjusted). |
| **`.dot-grid-bg`** | 24×24px dot grid (auth/plan-style pages). |
| **`.glass-card`** | Semi-transparent surface + `backdrop-filter: blur(16px)` + light border. |
| **`.frosted-card`** | Stronger blur (20px), slightly different opacity/border. |
| **`.glow-orb`** | Large blur (80px), low opacity for decorative blobs. |

---

## Feature tints (marketing / cards)

Utility classes (light + `.dark` overrides) for soft tinted panels:

- `feature-card-orange`, `feature-card-purple`, `feature-card-blue`, `feature-card-pink`, `feature-card-green`  
  Each: tinted OKLCH background + matching border. Sidebar nav pairs these with Tailwind accents like `text-orange-500`, `text-purple-500`, etc. (`components/app-sidebar.tsx`).

---

## Components (behavioral spec)

### Buttons (`components/ui/button.tsx`)

- **Base:** `inline-flex`, `rounded-md`, `text-xs/relaxed`, `font-medium`, border transparent by default, focus **ring** `ring-ring/30`, transition, disabled opacity 50%.
- **Variants:**
  - **default:** `bg-primary text-primary-foreground`, hover `primary/80`.
  - **outline:** `border-border`, hover `bg-input/50`, dark `bg-input/30`.
  - **secondary:** `bg-secondary`, hover `secondary/80`.
  - **ghost:** hover `bg-muted` (dark: `muted/50`).
  - **destructive:** light red tint bg + destructive text; darker tint in `.dark`.
  - **link:** `text-primary`, underline on hover.
- **Sizes:** height steps **5 → 7 → 8** (`xs` → `default` → `lg`), icon-only squares (`icon`, `icon-xs`, `icon-sm`, `icon-lg`). Icons default **3.5–4** (16px) unless size variant says otherwise.

### Inputs (`components/ui/input.tsx`)

- Height **36px** (`h-9`), **`rounded-xl`**, `border`, `text-sm`, placeholder muted at 60% opacity, focus ring on `ring` token.

### Cards (`components/ui/card.tsx`)

- **`rounded-2xl`**, `border border-border/60`, `shadow-sm`, `bg-card text-card-foreground`.

### Badges (`components/ui/badge.tsx`)

- Height **20px** (`h-5`), **`rounded-full`**, `text-[0.625rem]`, variants align with button semantics (primary, secondary, destructive, outline, ghost, link).

---

## Focus & rings

- Global: `outline-ring/50` on `*`; components use `focus-visible:ring-2` with semantic `ring` / `destructive` colors.
- **`.ring-accent-gradient`** forces ring color to match the **gray primary** focus treatment (light/dark specific OKLCH in `globals.css`)—not the rainbow gradient.

---

## Motion

Custom animations: `float`, `pulse-glow`, `grid-fade`, `shimmer`, `orbit`, `scan-line`, `bounce-slow`, `spin-slow`, `gradient-shift`.  
**Disabled on viewports `max-width: 767px`** and under **`prefers-reduced-motion: reduce`** for float/pulse/grid/orbit/scan/bounce/spin classes (see `globals.css`).

---

## RTL & localization

- `dir` and `lang` set per locale; Arabic uses Cairo and `font-arabic`.
- `components.json`: `"rtl": true` — layout patterns should mirror for RTL.

---

## Checklist to reproduce elsewhere

1. **Fonts:** Inter (UI), Cairo (Arabic), Baloo 2 (logo), optional Fuzzy Bubbles; optional mono stack for `font-mono`.
2. **Colors:** Implement the same **OKLCH** tokens for light/dark, plus **`--accent-gradient`** and **`--accent-gradient-subtle`**.
3. **Radius:** 12px base (`0.75rem`), cards **16px** (`rounded-2xl`), inputs **XL** rounding.
4. **Buttons:** Dense, **text-xs**, **rounded-md**, gray primary—not gradient fills by default.
5. **Brand flash:** Use the **135° multi-stop gradient** for accents, pills, gradient text, and gradient borders.
6. **Icons:** Lucide, default ~16px inline with buttons.

---

## File reference

| Concern | File |
|---------|------|
| Tokens, gradients, utilities | `app/globals.css` |
| Fonts on `<html>` / `<body>` | `app/[locale]/layout.tsx` |
| Shadcn preset | `components.json` |
| Button / input / card / badge | `components/ui/*.tsx` |
