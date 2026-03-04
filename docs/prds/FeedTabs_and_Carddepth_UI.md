# PRD: FeedTabs_and_Carddepth_UI
**System:** Application
**Priority:** Medium
**Date:** 2026-03-04

## Problem
The feed has no way to filter by source — users see all items in one flat list. Cards/sections across the app are completely flat (border only, no shadow) making the UI feel lifeless. Typography spacing is inconsistent and compressed, reducing readability.

## User Story
As a user, I want to filter feed items by source and see a visually polished interface with depth and clear hierarchy so the platform feels professional and easy to scan.

---

## Part 1: Feed Source Tabs
- Add "All | Product Hunt | Lenny" tabs with counts
- Client component wrapping server-fetched items
- Active tab: teal underline + teal text

## Part 2: Feed Hover Effects
- Teal left border slide-in on hover (Substack-style)

## Part 3: Card Depth (Shadows)
- Add `shadow-sm` to all card sections across item detail, journal, streak, feed CTA

## Part 4: Typography & Spacing
- Page header margins: `mb-6` → `mb-8`
- Feed item padding: `py-2.5` → `py-3`
- Item detail section headings: `text-base`

## Done When
- [ ] Feed has 3 working tabs with counts
- [ ] Active tab has teal underline
- [ ] Feed items show teal left border on hover
- [ ] All card sections have subtle shadow-sm
- [ ] Page headers have consistent mb-8 spacing
- [ ] Mobile: tabs tappable, no layout shift
