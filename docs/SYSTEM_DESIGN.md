# PMVIBE — System Design Document

## Overview

PMVIBE is an AI-powered product intelligence platform that helps Product Managers develop real product intuition. It aggregates real-world product launches and expert PM content, summarizes them using a local LLM, and provides structured prompts for users to practice product thinking daily.

**Live URL:** https://pmvibe-52h8.vercel.app
**Repo:** github.com/AbhayMaslekar33/pmvibe

---

## Layer 1: Data Ingestion Pipeline

### Purpose
Automatically fetches, processes, and stores product content from external sources. This is the engine that keeps the platform alive with fresh content.

### Components

**1.1 Data Sources**

| Source | Type | What it provides | Frequency |
|---|---|---|---|
| Product Hunt | GraphQL API | Daily top product launches — name, tagline, description, thumbnail, makers, votes | Daily |
| Lenny's Newsletter | RSS Feed (Substack) | Expert PM articles — title, full article content, publication date | Every 6 hours |

**1.2 n8n Automation (localhost:5678)**

Two separate workflows, each with 5 nodes:

**Workflow A — Product Hunt:**
```
Cron Trigger → Fetch PH API (GraphQL) → Split Into Items → Summarize with Ollama → Upsert to Supabase
```
- Node 1: Cron trigger (daily at 08:00 UTC)
- Node 2: HTTP POST to PH GraphQL API with Bearer token, fetches top 20 posts
- Node 3: Split Out node — extracts individual `node` objects from the GraphQL `edges` array
- Node 4: Code node (Run Once for Each Item) — sends each product to Ollama for AI summarization, parses response, builds the `content_items` row
- Node 5: Code node (Run Once for Each Item) — upserts the row to Supabase via REST API using service_role key

**Workflow B — Lenny's Newsletter:**
```
Cron Trigger → Fetch RSS Feed → Parse RSS XML → Summarize with Ollama → Upsert to Supabase
```
- Node 1: Cron trigger (every 6 hours)
- Node 2: HTTP GET to `https://www.lennysnewsletter.com/feed`
- Node 3: Code node (Run Once for All Items) — custom XML parser that extracts `<item>` elements, strips HTML from content, filters to last 14 days
- Node 4: Code node (Run Once for Each Item) — aggressively strips HTML (script, style, svg, picture tags, URLs), sends cleaned text to Ollama, parses JSON response
- Node 5: Code node (Run Once for Each Item) — upserts to Supabase

**1.3 Ollama LLM (localhost:11434)**

| Setting | Value |
|---|---|
| Model | qwen3-vl:30b |
| Temperature | 0.3 (low creativity, high accuracy) |
| Max tokens | 800 |
| Timeout | 900 seconds (set via N8N_RUNNERS_TASK_TIMEOUT) |

**What Ollama produces per item:**
```json
{
  "summary": "3-4 sentence summary covering what it does, who it's for, why it matters",
  "key_insights": ["insight 1", "insight 2", "insight 3", "insight 4"],
  "opinion_prompts": ["PM question 1", "PM question 2", "PM question 3", "PM question 4", "PM question 5"]
}
```

**Prompt strategy:**
- Product Hunt prompts focus on: problem clarity, user persona, competitive moat, metrics, red flags
- Lenny prompts focus on: core argument, applicability, counter-arguments, stage sensitivity, interview takeaways

**1.4 Data Quality Issues (Known)**
- PH API redacts maker names → stored as empty string
- Lenny RSS sometimes has duplicate articles with slightly different URLs → deduplication via `UNIQUE(source, external_id)` constraint
- Ollama occasionally returns malformed JSON → defensive parsing with regex fallback
- Large articles can timeout on 30B model → 900s timeout configured

---

## Layer 2: Database (Supabase PostgreSQL)

### Purpose
Stores all content, user data, and engagement metrics. Enforces data integrity and access control via RLS.

### Project
- **Ref:** nnheztimdtihbgojtunw
- **URL:** https://nnheztimdtihbgojtunw.supabase.co
- **Schema:** public

### Tables

**2.1 content_items** — The core content table

| Column | Type | Description |
|---|---|---|
| id | UUID (PK) | Auto-generated |
| source | TEXT | 'product_hunt' or 'lenny' |
| external_id | TEXT | PH post ID or Lenny article URL |
| source_url | TEXT | Link to original content |
| title | TEXT | Content title |
| tagline | TEXT | Short description (PH only) |
| thumbnail_url | TEXT | Image URL (PH only) |
| author | TEXT | Author/maker names |
| published_at | TIMESTAMPTZ | When the content was originally published |
| ai_summary | TEXT | Ollama-generated summary |
| ai_key_insights | JSONB | Array of 4 insights (stored as JSON string) |
| ai_opinion_prompts | JSONB | Array of 5 PM prompts (stored as JSON string) |
| ai_processed_at | TIMESTAMPTZ | When Ollama processed this item |
| raw_data | JSONB | Original source data for debugging |
| ingested_at | TIMESTAMPTZ | When n8n inserted this row |
| updated_at | TIMESTAMPTZ | Auto-updated via trigger |

**Constraint:** `UNIQUE(source, external_id)` — prevents duplicate content on re-runs. Upsert uses `Prefer: resolution=merge-duplicates`.

**Who writes:** Only n8n (via service_role key, bypasses RLS)
**Who reads:** All authenticated users (via RLS SELECT policy)

---

**2.2 reflections** — User's free-form journal entries

| Column | Type | Description |
|---|---|---|
| id | UUID (PK) | Auto-generated |
| user_id | UUID (FK → auth.users) | The user who wrote this |
| content_item_id | UUID (FK → content_items) | Which content item this is about |
| body | TEXT | The reflection text |
| word_count | INT | Auto-computed from body |

**Constraint:** `UNIQUE(user_id, content_item_id)` — one reflection per item per user
**RLS:** Users can only CRUD their own reflections

---

**2.3 opinion_responses** — Structured answers to PM prompts

| Column | Type | Description |
|---|---|---|
| id | UUID (PK) | Auto-generated |
| user_id | UUID (FK) | The user |
| content_item_id | UUID (FK) | Which content item |
| prompt_index | INT | Which prompt (0-4) |
| prompt_text | TEXT | The prompt question text |
| response_body | TEXT | User's answer |

**Constraint:** `UNIQUE(user_id, content_item_id, prompt_index)` — one answer per prompt per user
**RLS:** Users can only CRUD their own responses

---

**2.4 daily_activity** — One row per user per UTC date

| Column | Type | Description |
|---|---|---|
| id | UUID (PK) | Auto-generated |
| user_id | UUID (FK) | The user |
| activity_date | DATE | UTC date |
| items_read | INT | Count of items read that day |
| reflections_written | INT | Count of reflections |
| opinions_answered | INT | Count of opinions submitted |

**Constraint:** `UNIQUE(user_id, activity_date)`
**Writes:** Only via `upsert_daily_activity()` SECURITY DEFINER function — users cannot write directly

---

**2.5 user_streaks** — Derived streak data

| Column | Type | Description |
|---|---|---|
| user_id | UUID (PK, FK) | The user |
| current_streak | INT | Consecutive active days ending today/yesterday |
| longest_streak | INT | All-time longest streak |
| last_active_date | DATE | Most recent engaged day |
| total_days_active | INT | Total days with engagement |

**Writes:** Only via `recalculate_streak()` SECURITY DEFINER function
**Definition of "active day":** At least 1 reflection written OR 1 opinion answered. Reading alone doesn't count.

---

**2.6 user_profiles** — Extended user metadata

| Column | Type | Description |
|---|---|---|
| user_id | UUID (PK, FK) | The user |
| display_name | TEXT | User's display name |
| pm_experience_level | TEXT | Beginner/Intermediate/Advanced |
| preferred_sources | TEXT[] | Array of preferred content sources |

**Auto-created:** Trigger fires on new auth.users row → inserts default profile + streak row

---

### Database Functions (SECURITY DEFINER)

**`upsert_daily_activity(p_user_id, p_date, p_reflection_delta, p_opinion_delta, p_read_delta)`**
- Atomically increments daily activity counts
- Creates row if it doesn't exist for that date
- Called after every reflection save or opinion submit

**`recalculate_streak(p_user_id)`**
- Walks backwards from today through daily_activity rows
- Computes current consecutive streak, updates longest if higher
- Called after every `upsert_daily_activity`

**`handle_new_user()`**
- Trigger on `auth.users` INSERT
- Creates user_profiles and user_streaks rows with defaults

---

### Row Level Security (RLS)

| Table | Authenticated User | n8n (service_role) |
|---|---|---|
| content_items | SELECT all | Full access (bypasses RLS) |
| reflections | SELECT/INSERT/UPDATE/DELETE own | Full access |
| opinion_responses | SELECT/INSERT/UPDATE own | Full access |
| daily_activity | SELECT own (writes via function) | Full access |
| user_streaks | SELECT own (writes via function) | Full access |
| user_profiles | SELECT/INSERT/UPDATE own | Full access |

---

## Layer 3: Application (Next.js 16 on Vercel)

### Purpose
The user-facing web application. Server-rendered pages, client-side interactivity, API routes for data mutations.

### Architecture
- **Framework:** Next.js 16 (App Router, Turbopack)
- **Language:** TypeScript
- **Styling:** Tailwind CSS v4 with CSS custom properties
- **Auth:** Supabase Auth via `@supabase/ssr` (PKCE flow)
- **Icons:** lucide-react

### Route Structure

**Public routes (no login required):**

| Route | Type | Purpose |
|---|---|---|
| `/` | Redirect | Redirects to `/feed` |
| `/feed` | Server Component | List of all content items, newest first. 5-min ISR cache. Shows signup CTA for anonymous users. |
| `/item/[id]` | Server Component | Item detail — AI summary, key insights, opinion prompts, reflection editor. Prompts/reflections require auth to save. |

**Auth routes:**

| Route | Type | Purpose |
|---|---|---|
| `/login` | Client Component | Email + password login form |
| `/signup` | Client Component | Email + password signup with confirmation |
| `/confirm` | Static | Email confirmation pending page |
| `/api/auth/callback` | API Route | Supabase PKCE callback handler |

**Protected routes (login required):**

| Route | Type | Purpose |
|---|---|---|
| `/journal` | Client Component | Searchable list of user's reflections, joined with content_items |
| `/streak` | Client Component | Current streak, longest streak, 84-day heatmap |
| `/settings` | Client Component | Profile preferences (display name, experience level, sources) |

**API routes:**

| Route | Method | Purpose |
|---|---|---|
| `/api/reflections` | GET/POST | Fetch user reflections; upsert reflection + update streak |
| `/api/reflections/[id]` | DELETE | Delete a reflection |
| `/api/opinions` | GET/POST | Fetch user opinions; upsert opinion + update streak |
| `/api/opinions/[id]` | DELETE | Delete an opinion |
| `/api/activity` | POST | Record a read event |
| `/api/webhooks/n8n` | POST | n8n calls this after ingestion → revalidatePath('/feed') |

### Middleware
- Refreshes Supabase auth session on every request
- Redirects unauthenticated users from protected routes to `/login`
- Redirects authenticated users from auth routes to `/feed`
- `/feed` and `/item` are public — no redirect

### Key Components

**Sidebar (`src/components/nav/Sidebar.tsx`)**
- Fixed left sidebar on desktop (hidden on mobile)
- Shows: Feed for all users; Journal, Streak, Settings, Logout for authenticated; Login, Sign Up for anonymous
- Checks auth state client-side via `supabase.auth.getUser()`

**MobileNav (`src/components/nav/MobileNav.tsx`)**
- Fixed bottom nav on mobile (hidden on desktop)
- Same conditional rendering as Sidebar

**OpinionPrompts (`src/components/item/OpinionPrompts.tsx`)**
- Client component
- Loads existing responses from `/api/opinions`
- 5 prompts with individual textareas and save buttons
- Progress bar showing completion (X/5)
- Each save triggers: upsert opinion → upsert_daily_activity → recalculate_streak

**ReflectionEditor (`src/components/item/ReflectionEditor.tsx`)**
- Client component
- Textarea with 3-second debounce autosave
- Immediate save on blur
- Shows "Saving..." / "Saved" indicator
- Each save triggers: upsert reflection → upsert_daily_activity → recalculate_streak

### Data Flow: User Writes Reflection
```
User types in ReflectionEditor
  → 3s debounce
  → POST /api/reflections { content_item_id, body }
  → Supabase: UPSERT reflections
  → Supabase: SELECT upsert_daily_activity(user_id, today, 1, 0, 0)
  → Supabase: SELECT recalculate_streak(user_id)
  → Response: { reflection, streak }
```

---

## Layer 4: Infrastructure & Deployment

### Hosting

| Service | Purpose | Cost |
|---|---|---|
| Vercel | Next.js hosting, auto-deploy from GitHub main | Free tier |
| Supabase Cloud | PostgreSQL, Auth, REST API | Free tier |
| n8n | Workflow automation | Local (free) |
| Ollama | LLM inference | Local (free) |

### Deployment Flow
```
Developer pushes to main
  → GitHub receives push
  → Vercel auto-builds and deploys
  → Live at pmvibe-52h8.vercel.app
```

### Caching
- Feed page: `revalidate = 300` (ISR, 5 minutes)
- n8n webhook: calls `revalidatePath('/feed')` for immediate cache bust after ingestion
- Item detail pages: dynamic (no cache), always fresh from Supabase

### Environment Variables

**Next.js (.env.local on Vercel):**
- `NEXT_PUBLIC_SUPABASE_URL` — Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` — Public anon key (safe for client)
- `SUPABASE_SERVICE_ROLE_KEY` — Server-only, bypasses RLS
- `N8N_WEBHOOK_SECRET` — Shared secret for webhook auth

**n8n (hardcoded in nodes, free plan):**
- Product Hunt token (Bearer)
- Supabase service_role key
- Ollama URL (http://127.0.0.1:11434)

### Security
- All tables have RLS policies
- Streak/activity writes go through SECURITY DEFINER functions (users can't manipulate streaks)
- Auth uses `getUser()` server-side (not `getSession()` which can be spoofed)
- n8n webhook validates `x-n8n-secret` header
- Service role key only used server-side and in n8n

---

## Current State Summary

| Metric | Value |
|---|---|
| Content items in DB | ~32 (20 PH + 12 Lenny) |
| Active data sources | 2 (Product Hunt, Lenny) |
| n8n workflows | 2 (manual trigger, not yet scheduled) |
| Registered users | 1 (you) |
| Pages | 8 (feed, item, journal, streak, settings, login, signup, confirm) |
| API routes | 7 |
| Database tables | 6 |
| Database functions | 3 |
