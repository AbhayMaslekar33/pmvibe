# Mobile-DailyChallenge: Mobile Top Bar with Daily Challenge Prompt
**System:** Application
**Priority:** Medium
**Date:** 2026-03-04

## Problem
On mobile, the top of the page has no branding or engagement hook — users jump straight into page content with just a bottom nav. No clear call to action for what to do next.

## User Story
As a mobile user, I want to see a featured daily challenge at the top of the page so I know what to analyze today and have a clear call to action.

## Changes
| File | What Changes |
|---|---|
| `src/components/nav/MobileTopBar.tsx` | **New** — mobile top bar with logo + daily challenge |
| `src/app/(app)/layout.tsx` | Add `<MobileTopBar />` inside main, before content div |

## UI/UX
- **Mobile only** (`md:hidden`), desktop sidebar unchanged
- Top row: PMVIBE logo left, profile icon / "Log In" link right
- Challenge row: latest content item as "Today: [title]" with "Start >" CTA
- Static positioning (scrolls with content)
- Bottom nav stays as-is

## Routes Affected
- No new routes
- Layout wrapper modified (all app routes get the top bar on mobile)

## Done When
- [ ] Mobile shows PMVIBE logo + profile/login at top
- [ ] Daily challenge shows latest content item with "Start >" link
- [ ] Challenge links to correct `/item/[id]` page
- [ ] Hidden on desktop (md+)
- [ ] Bottom nav still works
- [ ] Desktop sidebar unaffected
