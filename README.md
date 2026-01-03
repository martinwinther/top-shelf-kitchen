# Top Shelf Kitchen

A dark, heavy-glass, minimalist recipe site for people tired of fluffy food-blog filler. Every recipe is a "banger".

Built with Astro, React islands, and Tailwind CSS v4. Designed for speed, usability in the kitchen, and easy customization.

## Features

### Recipe Collection
- Markdown-based recipes with structured frontmatter (Zod validation)
- Category and cuisine filtering
- Recipe scaling by servings
- Metric/US unit toggle
- Cooking mode with step-by-step view and screen keep-awake
- Print-optimized stylesheet
- Share tools (copy link, native share, social links)

### Search and SEO
- Pagefind static search index (fast, no server required)
- Recipe JSON-LD structured data
- Sitemap and robots.txt generation
- OpenGraph and Twitter card meta tags

### Monetization and Engagement
- Google AdSense integration (sidebar + bottom banner slots)
- Built-in consent manager for GDPR compliance
- Comments via Giscus (GitHub Discussions)
- Newsletter signup module (supports embed or endpoint)

### Analytics
- Provider adapters: Umami, Plausible, GA4, or custom
- Consent-aware loading (respects user preferences)

### Design System
- "Liquid Glass" dark-first aesthetic
- CSS custom properties for easy theming
- Reusable UI components (GlassCard, Button, Badge, Modal, Toggle)
- Respects `prefers-reduced-motion`

## Quickstart

### Requirements
- Node.js 18.17.1 or higher (20+ recommended)
- npm 9+ or pnpm

### Commands

```bash
# Install dependencies
npm install

# Start development server (localhost:4321)
npm run dev

# Build for production (includes Pagefind indexing)
npm run build

# Preview production build locally
npm run preview

# Format code with Prettier
npm run format

# Check formatting
npm run format:check
```

## Configuration

All site configuration lives in `src/config/site.ts`. This is the single source of truth for feature toggles, site metadata, and third-party integrations.

### Site Metadata

```typescript
site: {
  name: 'Top Shelf Kitchen',
  tagline: 'Only the keepers.',
  url: 'https://example.com', // Set before deploying
  locale: 'en',
}
```

### Feature Toggles

| Feature | Default | Description |
|---------|---------|-------------|
| `search.enabled` | `true` | Pagefind static search |
| `unitToggle.enabled` | `true` | Metric/US unit switcher |
| `unitToggle.default` | `'metric'` | Default unit system |
| `recipeScaling.enabled` | `false` | Servings scaler |
| `cookingMode.enabled` | `false` | Step-by-step cooking view |
| `cookingMode.keepAwake` | `true` | Prevent screen sleep |
| `print.enabled` | `false` | Print button |
| `share.enabled` | `false` | Share tools |
| `ads.enabled` | `false` | AdSense integration |
| `analytics.enabled` | `false` | Analytics tracking |
| `comments.enabled` | `false` | Giscus comments |
| `newsletter.enabled` | `false` | Newsletter signup |

### Build Flags

The file `src/config/buildFlags.json` mirrors search configuration for the build script. This avoids brittle TypeScript parsing at build time.

```json
{
  "search": { "enabled": true }
}
```

Keep this in sync with `site.ts` when changing search settings.

## Content

### Adding Recipes

Recipes are stored as Markdown files in `src/content/recipes/`. Each recipe uses frontmatter for structured data.

Create a new file: `src/content/recipes/my-new-recipe.md`

### Frontmatter Schema

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `title` | string | Yes | Recipe title |
| `description` | string | Yes | Brief summary |
| `category` | enum | Yes | `breakfast`, `lunch`, `dinner`, `dessert`, `snacks` |
| `cuisine` | string | Yes | e.g., "Mexican", "Japanese" |
| `servingsDefault` | number | Yes | Default serving count |
| `times.prepMinutes` | number | Yes | Prep time in minutes |
| `times.cookMinutes` | number | Yes | Cook time in minutes |
| `difficulty` | enum | No | `easy`, `medium`, `hard` |
| `ingredients` | array | Yes | Structured ingredient list |
| `steps` | array | Yes | Cooking steps (strings) |
| `tags` | array | No | Searchable tags |
| `status` | enum | Yes | `draft` or `published` |
| `image` | string | No | Path to recipe image |
| `imageAlt` | string | No | Alt text for image |

### Ingredient Structure

```yaml
ingredients:
  - amount: 600
    unit: "g"
    name: "chicken thighs"
    note: "boneless, skinless"
```

### Example Recipe

```markdown
---
title: "One-Pan Chicken Tinga Tacos"
description: "Smoky, spicy chicken tinga made in one pan."
category: "dinner"
cuisine: "Mexican"
servingsDefault: 4
times:
  prepMinutes: 10
  cookMinutes: 30
difficulty: "easy"
ingredients:
  - amount: 600
    unit: "g"
    name: "chicken thighs"
    note: "boneless, skinless"
  - amount: 1
    name: "onion"
    note: "sliced"
steps:
  - "Heat oil in a large pan over medium-high."
  - "Season chicken with salt and brown on both sides."
tags:
  - "dinner"
  - "one-pan"
status: "published"
---

Optional body text for notes, substitutions, or serving suggestions.
```

### Featured Recipes

Configure featured recipes in `src/config/site.ts`:

```typescript
content: {
  featuredRecipeSlugs: [
    'chicken-tinga-tacos',
    'miso-butter-salmon-charred-broccoli',
  ],
}
```

## Deploy

This is a static site. Build output is in `dist/`.

### Netlify (Recommended)

1. Connect your repository to Netlify
2. Set build command: `npm run build`
3. Set publish directory: `dist`
4. Deploy

### Other Platforms

The site works on any static hosting platform (Vercel, Cloudflare Pages, GitHub Pages, etc.). Ensure:

- Build command runs `npm run build` (not just `astro build`)
- Publish directory is `dist`
- Node.js version is 18.17.1+

### Pagefind Assets

The build script automatically runs Pagefind after Astro build. Search assets are generated in `dist/pagefind/`. These must be included in your deployment.

## Ads and Consent

### Enabling AdSense

1. Set `features.ads.enabled: true` in `src/config/site.ts`
2. Add your AdSense credentials:

```typescript
ads: {
  enabled: true,
  provider: 'adsense',
  slots: {
    sidebar: true,
    bottomBanner: true,
  },
  adsense: {
    clientId: 'ca-pub-XXXXXXXXXXXXXXXX',
    sidebarSlotId: '1234567890',
    bottomSlotId: '0987654321',
  },
  personalization: 'nonPersonalizedByDefault',
}
```

### Consent Manager

A built-in consent banner appears when ads or analytics are enabled. Users can opt in to:

- **Analytics**: Off by default
- **Ads personalization**: Off by default

Consent is stored in:
- Cookie: `tsk_consent` (1 year expiry, for pre-hydration reads)
- localStorage: `tsk.consent` (mirror for client-side access)

### EEA/UK Compliance

By default, ads run in non-personalized mode. For personalized ads in the European Economic Area or UK, you must integrate a [Google-certified CMP](https://support.google.com/admanager/answer/9566541) or use [Funding Choices](https://support.google.com/fundingchoices).

### Consent Versioning

Bump `features.legal.consentVersion` to force users to re-consent after policy changes:

```typescript
legal: {
  consentVersion: '2', // was '1'
}
```

## Search

Search is powered by [Pagefind](https://pagefind.app/), a static search library.

### How It Works

1. During `npm run build`, Astro generates static HTML
2. Pagefind indexes the HTML output
3. Search assets are placed in `dist/pagefind/`
4. The search modal loads these assets on demand

### Disabling Search

1. Set `features.search.enabled: false` in `src/config/site.ts`
2. Set `search.enabled: false` in `src/config/buildFlags.json`
3. Build will skip Pagefind indexing

## Customization

### Design Tokens

Core design tokens are in `src/styles/global.css`:

```css
:root {
  /* Base colors */
  --bg: #0a0a0b;
  --text: #f5f5f7;
  --muted: #8e8e93;

  /* Glass effect */
  --glass-bg: rgba(255, 255, 255, 0.05);
  --glass-border: rgba(255, 255, 255, 0.12);
  --glass-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);

  /* Accent */
  --accent: #ff6b35;

  /* Radius */
  --radius-xl: 1.5rem;
  --radius-md: 0.75rem;
}
```

### UI Components

Reusable components are in `src/components/ui/`:

- `GlassCard.astro` - Translucent card with blur effect
- `Button.astro` - Primary and secondary buttons
- `Badge.astro` - Category and tag badges
- `Modal.astro` - Accessible modal dialog
- `Toggle.astro` - Toggle switch input
- `IconButton.astro` - Icon-only button

### Layouts

The main layout is `src/layouts/SiteLayout.astro`. It includes:

- Skip link for accessibility
- Header with navigation
- Main content area
- Footer
- Consent banner (conditional)

## Documentation

- `docs/design.md` - Design principles, stack, content model
- `docs/settings.md` - Feature toggles reference
- `docs/SETUP.md` - Step-by-step setup guide
- `docs/SHIP-CHECKLIST.md` - Pre-launch checklist

## License

See [LICENSE](./LICENSE) for details.
