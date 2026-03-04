# PRD: UI Overhaul
**System:** Application
**Priority:** High
**Date:** 2026-03-04

## Problem
The current UI looks inconsistent and unpolished — mismatched spacing, generic blue color, no clear design direction. First-time visitors don't get a professional, trustworthy impression. The site needs to feel like a clean content/news platform (like HN or Substack) with light colors and a cohesive visual identity.

## User Story
As a visitor, I want the site to look clean and professional so that I trust the platform and want to engage with the content.

## Design Direction
- **Vibe:** News/content site (HN, Substack) — content-dense, readable, minimal decoration
- **Primary color:** Teal (#0d9488) — fresh, modern, stands out
- **Font:** Keep Arial (no change)
- **Theme:** Light only (dark mode already removed)

---

## Color Palette Change

### `globals.css` — CSS Variables

| Variable | Current | New |
|---|---|---|
| `--primary` | #2563eb (blue) | #0d9488 (teal) |
| `--primary-foreground` | #ffffff | #ffffff |
| `--secondary` | #eff6ff (light blue) | #f0fdfa (light teal) |
| `--secondary-foreground` | #1e40af (dark blue) | #115e59 (dark teal) |
| `--ring` | #2563eb | #0d9488 |
| `--accent` | #f59e0b (amber) | #f59e0b (keep — used for streaks) |
| `--background` | #fafafa | #ffffff (pure white) |
| `--card` | #ffffff | #ffffff (no change) |
| `--muted` | #f1f5f9 | #f8fafc (lighter) |
| `--border` | #e2e8f0 | #e5e7eb (slightly warmer gray) |

---

## Changes Per File

| File | What Changes |
|---|---|
| `src/app/globals.css` | Update CSS variables to teal palette |
| `src/app/layout.tsx` | No change needed |
| `src/app/(auth)/layout.tsx` | Change bg from `--muted` to `--background` for cleaner look |
| `src/app/(auth)/login/page.tsx` | Refine card shadow, consistent spacing |
| `src/app/(auth)/signup/page.tsx` | Same as login |
| `src/app/(auth)/confirm/page.tsx` | Same card style |
| `src/app/(app)/layout.tsx` | No change needed |
| `src/app/(app)/feed/page.tsx` | Refine list spacing, update source badges, subtle separator lines |
| `src/app/(app)/item/[id]/page.tsx` | Update badges, refine section spacing |
| `src/app/(app)/journal/page.tsx` | Update badges, consistent card styling |
| `src/app/(app)/streak/page.tsx` | Replace hardcoded green, refine heatmap colors to teal |
| `src/app/(app)/settings/page.tsx` | Replace hardcoded green/red with CSS vars |
| `src/components/nav/Sidebar.tsx` | Update active state to teal, refine hover states |
| `src/components/nav/MobileNav.tsx` | Update active state to teal |
| `src/components/item/OpinionPrompts.tsx` | Progress bar to teal (automatic via CSS var) |
| `src/components/item/ReflectionEditor.tsx` | Ring color to teal (automatic via CSS var) |

### Source Badges (standardize)
- **Product Hunt:** `bg-orange-50 text-orange-600 border border-orange-200`
- **Lenny:** `bg-teal-50 text-teal-600 border border-teal-200` (match primary)

### Hardcoded Colors to Fix
- Streak page `text-green-500` → `text-[var(--accent)]` or keep as semantic green
- Settings `text-green-600` → `text-[var(--primary)]`
- Settings `hover:bg-red-50` → `hover:bg-[var(--destructive)]/10`
- Heatmap `bg-[var(--primary)]/30,/60` → stays but now teal

---

## UI/UX Refinements

### Feed Page
- Add subtle bottom border between items instead of relying only on hover
- Tighten item padding slightly for more content density
- Source badges: smaller, outlined style instead of filled

### Item Detail
- Reduce title size from `text-3xl` to `text-2xl` for content-site feel
- Add horizontal rule between sections
- Insights list: use `·` bullet instead of `-` dash

### Auth Pages
- Lighter shadow on card
- Cleaner input focus states (teal ring)

### Navigation
- Sidebar logo: "PM" in teal, "VIBE" in foreground (already done, just color change)
- Active nav item: teal left border accent instead of full background fill

---

## Routes Affected
- No new routes
- All existing routes get visual updates (no behavioral changes)

## Done When
- [ ] All pages render with teal primary color
- [ ] No hardcoded blue (#2563eb) remains anywhere
- [ ] Source badges are consistent across feed, item, journal
- [ ] No hardcoded colors outside of CSS variables (except source badges orange/teal)
- [ ] Mobile view looks clean (test at 375px width)
- [ ] Light background throughout, no dark mode artifacts
- [ ] Site feels like a clean content platform
