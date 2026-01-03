# Top Shelf Kitchen — Design Doc (v0)

## One-liner
A dark, heavy-glass, minimalist recipe site for people tired of fluffy food-blog filler. Every recipe is a “banger”.

## Product principles
- **Minimalist**: no life story, no SEO-fluff paragraphs.
- **Curated**: quality > quantity. 10 launch recipes.
- **Fast**: ship minimal JS; only interactive islands when needed.
- **Usable in the kitchen**: cooking mode, keep-awake, big typography, strong contrast.
- **Template-first**: every optional feature is behind a toggle in config.

## Target audience
People who want high-quality recipes (Serious Eats vibe), but less nerdy and more curated.

## Stack
- Astro + React islands
- TypeScript
- Tailwind (v4 via Vite plugin) + CSS variables for “Liquid Glass”
- Astro Content Collections for recipes (Zod schema validation)
- Search: Pagefind (static index)
- Comments: Giscus (free, optional)
- Ads: Google AdSense slots (sidebar + bottom banner; no in-content ads)

## Information architecture (v0)
- Home
  - Featured recipes
  - New / Recently updated
  - Category grid
- Recipes
  - All recipes
  - Filter by category + cuisine
  - Search
- Recipe detail
  - Hero (title, summary, key facts)
  - Ingredients (scalable, unit toggle)
  - Steps
  - Cooking mode toggle (step-by-step view + keep-awake)
  - Print + Share
- About (minimal; optional toggle)
- Privacy / Cookies (required if ads/analytics are enabled)

## Content model (recipes)
Stored as Markdown in `src/content/recipes/*.md` using Content Collections.

Recipe frontmatter MUST include structured data so we can scale/convert:
- title, description, slug
- image (optional), alt
- category: one of (breakfast, lunch, dinner, dessert, snacks) — but extensible
- cuisine: string (e.g. Danish, Japanese, Chinese) — extensible
- servingsDefault: number (default 4)
- times: prepMinutes, cookMinutes
- difficulty: easy | medium | hard (optional)
- ingredients: array of structured items (amount + unit + name + optional note)
- steps: array of strings
- tags: string[]
- status: draft | published

Body Markdown is optional and used for:
- short notes, substitutions, serving suggestions (not a blog story)

## “Liquid Glass” design system
Dark-first, heavy glass:
- Background: deep near-black with subtle gradient + noise.
- Surfaces: translucent cards with blur, thin bright border, soft glow.
- Typography: clean system font stack, large sizes, strong hierarchy.
- Motion: subtle (hover glow, card lift), respects prefers-reduced-motion.

### Tokens (conceptual)
- --bg, --text, --muted
- --glass-bg, --glass-border, --glass-shadow
- --accent (single accent color)
- --radius-xl (large rounded corners)

## Core features (must ship)
- Recipe scaling by servings (default 4; “per person” control)
- Metric/US unit toggle (default metric)
- Cooking mode:
  - full-screen-ish, big text
  - keep screen awake (where supported)
  - step navigation, keyboard-friendly
- Print recipe (clean print stylesheet)
- Share:
  - copy link
  - native share (where supported)
  - basic social links (no trackers)
- Search (Pagefind)
- SEO:
  - Recipe JSON-LD
  - OpenGraph/Twitter cards
  - Sitemap + robots.txt
- Ads (toggleable):
  - Sidebar rail (desktop only)
  - Sticky bottom banner (all sizes, tasteful)
  - No in-content ads

## Optional features (toggleable)
- Comments (Giscus)
- Analytics (provider adapters: none / umami / plausible / GA4 / cloudflare)
- Newsletter signup (simple embed; provider-agnostic)
- Related recipes section
- RSS feed
- View transitions
- PWA offline support (later)
- “Collections” beyond recipes: guides, shop, etc. (scaffold-ready)

## Privacy / consent approach
We implement a functional consent manager:
- Necessary (always on)
- Analytics (off by default)
- Ads personalization (off by default)
If AdSense is enabled without a certified CMP:
- default to non-personalized ads mode
- show a clear note in docs about EEA/UK requirements for personalized ads

## Non-goals (v0)
- User accounts
- Ratings
- Heavy editorial / long articles
- Huge tag taxonomy
- Complex CMS workflow