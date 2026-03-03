# PMVIBE

**AI-powered PM training ground.**

A daily product intelligence platform that helps Product Managers develop real product intuition — not just frameworks. AI-summarized launches, structured opinion prompts, and streak-based habit tracking turn passive reading into active thinking.

## The Problem

PMs prepare through courses, frameworks, and mock interviews. But everyone does that. The gap isn't knowledge — it's **judgment**. Real PM skill comes from consistently engaging with real-world product decisions, forming opinions under ambiguity, and reflecting on trade-offs. There's no platform that makes this a daily habit.

## What PMVIBE Does

- **Aggregates** daily product launches from Product Hunt and expert insights from Lenny's Newsletter
- **Summarizes** each item using a local LLM (Ollama) — key insights, trade-offs, and context
- **Prompts you to think** with structured PM opinion questions per item (e.g., "What's the competitive moat?", "What would your north star metric be?")
- **Tracks your streak** so you build the habit of daily product reflection
- **Stores your journal** of reflections and opinions — your growing PM portfolio

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 16 (App Router), TypeScript, Tailwind CSS |
| Database + Auth | Supabase (PostgreSQL + Auth + Row Level Security) |
| Automation | n8n (self-hosted, 2 workflows) |
| AI Summarization | Ollama (local, qwen3-vl:30b) |
| Data Sources | Product Hunt GraphQL API, Lenny's Newsletter RSS |
| Hosting | Vercel |

## Architecture

```
Product Hunt API ──┐
                   ├──► n8n ──► Ollama (summarize) ──► Supabase
Lenny RSS Feed ────┘

Supabase ──► Next.js (Vercel) ──► User

User ──► Reflections / Opinions ──► Supabase ──► Streak Tracker
```

## Features

- **Public Feed** — Browse daily curated content without signing up
- **Item Detail** — AI summary, key insights, and 5 structured PM opinion prompts
- **Reflection Journal** — Free-form journaling per item with autosave
- **Streak Dashboard** — Current streak, longest streak, 84-day activity heatmap
- **Mobile Responsive** — Bottom nav on mobile, sidebar on desktop

## Getting Started

### Prerequisites
- Node.js 18+
- Supabase account
- Ollama installed locally
- n8n installed locally
- Product Hunt developer token

### Setup

1. Clone the repo
```bash
git clone https://github.com/AbhayMaslekar33/pmvibe.git
cd pmvibe
npm install
```

2. Set up environment variables
```bash
cp .env.example .env.local
# Fill in your Supabase URL, anon key, and service role key
```

3. Run Supabase migrations
```
Run the SQL files in supabase/migrations/ in order (001, 002, 003)
via the Supabase Dashboard SQL Editor
```

4. Pull the Ollama model
```bash
ollama pull qwen3-vl:30b
```

5. Set up n8n workflows (see docs)

6. Start the dev server
```bash
npm run dev
```

## Live Demo

https://pmvibe-52h8.vercel.app

## License

MIT
