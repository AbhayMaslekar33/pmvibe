# Changelog

All notable changes to PMVIBE are documented here.

## [Unreleased]

### Added
- **Feed source tabs (PRD: FeedTabs_and_Carddepth_UI)** — All / Product Hunt / Lenny filter tabs with counts
- Teal left-border hover effect on feed items (Substack-style)
- `FeedTabs` client component (`src/components/feed/FeedTabs.tsx`)

### Changed
- **Card depth** — added `shadow-sm` to all card sections (item detail, journal, streak, feed CTA)
- **Typography spacing** — consistent `mb-8` header margins across all pages
- Feed item padding increased for better readability

---

## 2026-03-04

### Changed
- **UI Overhaul (PRD: UI-Overhaul-V1)** — complete visual refresh
  - Primary color: blue (#2563eb) → teal (#0d9488)
  - Background: off-white (#fafafa) → pure white (#ffffff)
  - Source badges: filled → outlined style, Lenny badge now teal (was blue)
  - Feed items: divider lines between items, tighter spacing
  - Item detail: smaller title (3xl → 2xl), bullet style changed
  - Sidebar: teal left border on active nav item
  - Streak page: calendar icon uses primary color (was hardcoded green)
  - Settings: "Saved" text uses primary color (was hardcoded green)
  - Auth pages: clean white background (was grey)
- Removed dark mode — light theme only for all users

### Fixed
- Anonymous users can now see feed articles (added `anon` SELECT policy to `content_items`)

### Added
- System design document (`docs/SYSTEM_DESIGN.md`)
- PRD templates and workflow structure (`docs/prds/templates/`)
- Changelog

---

## 2026-03-03

### Added
- Public feed as landing page (no login required to browse)
- Signup CTA banner for anonymous users on feed
- HN-style list layout for feed (numbered items, source badges, time ago)
- `revalidate = 300` ISR caching on feed page
- Conditional nav: Login/Signup for anonymous, full nav for authenticated

### Changed
- UI color palette: purple → professional blue (`#2563eb`)
- Feed redesigned from card grid to compact list rows
- Root `/` redirects to `/feed`
- Logout redirects to `/feed` instead of `/login`

### Fixed
- n8n workflows: all 20 PH items now ingesting (was only 2-3)
- n8n Code nodes: fixed return format for "Run Once for Each Item" mode
- n8n: fixed Ollama port (11435 → 11434)
- Item detail page: fixed crash from JSON string fields (`ai_key_insights`, `ai_opinion_prompts`)
- Cleaned dirty data: removed empty rows, duplicates, `[REDACTED]` authors
- Fixed `ai_summary` fields containing raw JSON instead of summary text
- Hidden `[REDACTED]` authors from feed display
- Filtered empty-title items from feed

---

## 2026-03-02

### Added
- Initial commit: PMVIBE webapp
- Next.js 16 app with Supabase Auth
- Feed, item detail, journal, streak, settings pages
- Opinion prompts and reflection editor components
- n8n workflows for Product Hunt and Lenny's Newsletter
- Supabase schema: 6 tables, 3 functions, RLS policies
- README with project overview
