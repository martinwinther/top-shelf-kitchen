# Settings & Feature Toggles

Single source of truth: `src/config/site.ts`

## Required fields
- site.name
- site.tagline
- site.url (used for canonical URLs + sitemap)
- site.locale (default: en)
- site.theme (dark-first glass tokens)

## Feature toggles (v0)
features:
- search: { enabled: true, provider: "pagefind" }
- recipeScaling: { enabled: true }
- unitToggle: { enabled: true, default: "metric" }
- cookingMode: { enabled: true, keepAwake: true }
- print: { enabled: true }
- share: { enabled: true }
- ads:
  - enabled: false (default off for template)
  - provider: "adsense"
  - slots: { sidebar: true, bottomBanner: true }
  - adsense: { clientId: "", sidebarSlotId: "", bottomSlotId: "" }
  - personalization: "nonPersonalizedByDefault"

  **Note on personalized ads (EEA/UK):** To serve personalized ads in the European Economic Area or UK, you must integrate a Google-certified Consent Management Platform (CMP). Without a certified CMP, ads default to non-personalized mode. See [Google's GDPR requirements](https://support.google.com/adsense/answer/7670013) for details.

- analytics:
  - enabled: false
  - provider: "cloudflare" | "umami" | "plausible" | "ga4" | "custom"
  - ids/scripts per provider
- comments:
  - enabled: false
  - provider: "giscus"
  - giscus: { repo: "", repoId: "", category: "", categoryId: "" }
- newsletter:
  - enabled: false
  - provider: "mailchimp" | "convertkit" | "buttondown" | "custom"
  - embedHtml or endpoint config
- seo:
  - sitemap: true
  - robots: true
  - ogImages: true
  - jsonLdRecipe: true
- legal:
  - consentBanner: true (if analytics or ads are enabled)
  - consentVersion: "1" (bump to force consent renewal)
  - privacyPage: true
  - cookiePage: true
- dev:
  - showDrafts: false