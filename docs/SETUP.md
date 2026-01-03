# Setup Guide

Step-by-step setup for Top Shelf Kitchen. Complete each section relevant to your needs.

## Prerequisites

- [ ] Node.js 18.17.1+ installed (20+ recommended)
- [ ] npm 9+ or pnpm
- [ ] Git for version control
- [ ] Code editor (VS Code recommended)

## Initial Setup

### 1. Clone and Install

```bash
git clone <your-repo-url>
cd top-shelf-kitchen
npm install
```

### 2. Configure Site Metadata

Edit `src/config/site.ts`:

```typescript
site: {
  name: 'Your Site Name',
  tagline: 'Your tagline',
  url: 'https://your-domain.com', // Required for SEO
  locale: 'en',
}
```

### 3. Test Development Server

```bash
npm run dev
```

Visit `http://localhost:4321` to verify the site loads.

---

## Feature Configuration

### Search (Pagefind)

Search is enabled by default.

- [ ] Verify `features.search.enabled: true` in `src/config/site.ts`
- [ ] Verify `search.enabled: true` in `src/config/buildFlags.json`
- [ ] Run `npm run build` and confirm `dist/pagefind/` is created
- [ ] Test search functionality in preview: `npm run preview`

To disable search:
1. Set `features.search.enabled: false` in `src/config/site.ts`
2. Set `search.enabled: false` in `src/config/buildFlags.json`

---

### Recipe Features

Enable interactive recipe features in `src/config/site.ts`:

**Recipe Scaling**
- [ ] Set `features.recipeScaling.enabled: true`
- [ ] Adjust `defaultServings` if needed (default: 4)

**Unit Toggle (Metric/US)**
- [ ] Verify `features.unitToggle.enabled: true` (default)
- [ ] Set `features.unitToggle.default` to `'metric'` or `'us'`

**Cooking Mode**
- [ ] Set `features.cookingMode.enabled: true`
- [ ] Set `features.cookingMode.keepAwake: true` for screen wake lock

**Print and Share**
- [ ] Set `features.print.enabled: true`
- [ ] Set `features.share.enabled: true`

---

### AdSense Integration

**Before enabling:**
- You need an approved AdSense account
- You need ad unit IDs for each slot

**Setup steps:**

- [ ] Set `features.ads.enabled: true`
- [ ] Add your AdSense client ID:
  ```typescript
  adsense: {
    clientId: 'ca-pub-XXXXXXXXXXXXXXXX',
    sidebarSlotId: '1234567890',
    bottomSlotId: '0987654321',
  }
  ```
- [ ] Choose personalization mode:
  - `'nonPersonalizedByDefault'` - Recommended for GDPR compliance
  - `'personalizedAllowed'` - Only if you have a certified CMP
- [ ] Test ad slots in development (they may not render without real traffic)

**Ad slot locations:**
- Sidebar: Desktop only, right column on recipe pages
- Bottom banner: All screen sizes, sticky footer

**EEA/UK compliance:**
For personalized ads in the European Economic Area or UK, you must integrate a [Google-certified CMP](https://support.google.com/admanager/answer/9566541).

---

### Analytics

**Supported providers:**
- Umami
- Plausible
- Google Analytics 4
- Custom script

**Setup steps:**

- [ ] Set `features.analytics.enabled: true`
- [ ] Set `features.analytics.provider` to your choice
- [ ] Configure provider-specific settings:

**Umami:**
```typescript
analytics: {
  enabled: true,
  provider: 'umami',
  umami: {
    websiteId: 'your-website-id',
    scriptUrl: 'https://your-umami-instance.com/script.js', // optional
  },
}
```

**Plausible:**
```typescript
analytics: {
  enabled: true,
  provider: 'plausible',
  plausible: {
    domain: 'your-domain.com',
    scriptUrl: 'https://plausible.io/js/script.js', // optional
  },
}
```

**Google Analytics 4:**
```typescript
analytics: {
  enabled: true,
  provider: 'ga4',
  ga4: {
    measurementId: 'G-XXXXXXXXXX',
  },
}
```

---

### Comments (Giscus)

Giscus uses GitHub Discussions for comments. Free and ad-free.

**Prerequisites:**
- Public GitHub repository
- [Giscus app](https://github.com/apps/giscus) installed on your repo
- Discussions enabled on your repo

**Setup steps:**

- [ ] Go to [giscus.app](https://giscus.app) and configure your settings
- [ ] Copy the generated values
- [ ] Set `features.comments.enabled: true`
- [ ] Add Giscus configuration:
  ```typescript
  comments: {
    enabled: true,
    provider: 'giscus',
    giscus: {
      repo: 'username/repo',
      repoId: 'R_xxxxx',
      category: 'Announcements',
      categoryId: 'DIC_xxxxx',
      mapping: 'pathname',
      theme: 'noborder_dark',
    },
  }
  ```

---

### Newsletter Signup

**Supported modes:**
- `'embed'` - Paste raw HTML from your newsletter provider
- `'endpoint'` - POST to a custom API endpoint
- `'none'` - Disabled

**Embed mode (Mailchimp, ConvertKit, etc.):**

- [ ] Get embed code from your newsletter provider
- [ ] Set `features.newsletter.enabled: true`
- [ ] Set `features.newsletter.provider: 'embed'`
- [ ] Paste HTML in `embed.html`:
  ```typescript
  newsletter: {
    enabled: true,
    provider: 'embed',
    embed: {
      html: '<form action="...">...</form>',
    },
  }
  ```

**Endpoint mode:**

- [ ] Set `features.newsletter.enabled: true`
- [ ] Set `features.newsletter.provider: 'endpoint'`
- [ ] Configure endpoint settings:
  ```typescript
  newsletter: {
    enabled: true,
    provider: 'endpoint',
    endpoint: {
      actionUrl: 'https://your-api.com/subscribe',
      method: 'POST',
      fieldName: 'email',
      hiddenFields: { list_id: 'abc123' },
    },
  }
  ```

---

### Legal and Consent

**Consent banner:**
Automatically shown when ads or analytics are enabled.

- [ ] Verify `features.legal.consentBanner: true`
- [ ] Set `features.legal.consentVersion: '1'`
- [ ] Update version number when privacy policy changes (forces re-consent)

**Legal pages:**
- Privacy page: `src/pages/privacy.astro`
- [ ] Update privacy policy text for your jurisdiction
- [ ] Link to your actual data controller details

---

## Content Setup

### Adding Your First Recipe

1. Create a new file: `src/content/recipes/my-recipe.md`
2. Add required frontmatter (see README for schema)
3. Set `status: 'published'`
4. Restart dev server to pick up new content

### Featured Recipes

Edit `src/config/site.ts`:

```typescript
content: {
  featuredRecipeSlugs: [
    'your-best-recipe',
    'another-great-one',
  ],
}
```

### Removing Demo Recipes

Delete files from `src/content/recipes/` that you don't want:

```bash
rm src/content/recipes/chicken-tinga-tacos.md
# ... repeat for other demo recipes
```

Update `featuredRecipeSlugs` to remove references to deleted recipes.

---

## Pre-Deployment

Before going live, complete the [Ship Checklist](./SHIP-CHECKLIST.md).

