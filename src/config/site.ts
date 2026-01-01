/**
 * Site Configuration - Single Source of Truth
 * See docs/settings.md for full documentation
 */

// ============================================================================
// Types
// ============================================================================

interface SiteInfo {
  name: string;
  tagline: string;
  url: string;
  locale: string;
}

interface ContentConfig {
  featuredRecipeSlugs: string[];
}

interface SearchConfig {
  enabled: boolean;
  provider: 'pagefind';
}

interface UnitToggleConfig {
  enabled: boolean;
  default: 'metric' | 'us';
}

interface RecipeScalingConfig {
  enabled: boolean;
  defaultServings: number;
}

interface CookingModeConfig {
  enabled: boolean;
  keepAwake: boolean;
}

interface PrintConfig {
  enabled: boolean;
}

interface ShareConfig {
  enabled: boolean;
  socialLinks?: boolean;
}

interface AdsenseConfig {
  clientId: string;
  sidebarSlotId: string;
  bottomSlotId: string;
}

interface AdsConfig {
  enabled: boolean;
  provider: 'adsense';
  slots: {
    sidebar: boolean;
    bottomBanner: boolean;
  };
  adsense: AdsenseConfig;
  personalization: 'nonPersonalizedByDefault' | 'personalizedAllowed';
}

interface AnalyticsConfig {
  enabled: boolean;
  provider: 'none' | 'umami' | 'plausible' | 'ga4' | 'custom';
  umami?: { websiteId: string; scriptUrl?: string };
  plausible?: { domain: string; scriptUrl?: string };
  ga4?: { measurementId: string };
  custom?: { scriptUrl?: string; inline?: string };
}

interface GiscusConfig {
  repo: string;
  repoId: string;
  category: string;
  categoryId: string;
  mapping?: 'pathname' | 'url' | 'title' | 'og:title' | 'specific';
  strict?: boolean;
  reactionsEnabled?: boolean;
  emitMetadata?: boolean;
  inputPosition?: 'top' | 'bottom';
  theme?: string;
  lang?: string;
}

interface CommentsConfig {
  enabled: boolean;
  provider: 'giscus';
  giscus: GiscusConfig;
}

interface NewsletterEndpointConfig {
  actionUrl: string;
  method?: 'POST' | 'GET';
  fieldName?: string;
  hiddenFields?: Record<string, string>;
}

interface NewsletterConfig {
  enabled: boolean;
  provider: 'embed' | 'endpoint' | 'none';
  title?: string;
  description?: string;
  embed?: { html: string };
  endpoint?: NewsletterEndpointConfig;
  showOnRecipes?: boolean;
}

interface SeoConfig {
  sitemap: boolean;
  robots: boolean;
  ogImages: boolean;
  jsonLdRecipe: boolean;
  defaultDescription: string;
  twitterHandle: string;
  ogImagePath: string;
}

interface LegalConfig {
  consentBanner: boolean;
  consentVersion: string;
  privacyPage: boolean;
  cookiePage: boolean;
}

interface DevConfig {
  showDrafts: boolean;
  showUiDemo: boolean;
}

interface FeaturesConfig {
  search: SearchConfig;
  unitToggle: UnitToggleConfig;
  recipeScaling: RecipeScalingConfig;
  cookingMode: CookingModeConfig;
  print: PrintConfig;
  share: ShareConfig;
  ads: AdsConfig;
  analytics: AnalyticsConfig;
  comments: CommentsConfig;
  newsletter: NewsletterConfig;
  seo: SeoConfig;
  legal: LegalConfig;
  dev: DevConfig;
}

export interface SiteConfig {
  site: SiteInfo;
  content: ContentConfig;
  features: FeaturesConfig;
}

// ============================================================================
// Configuration
// ============================================================================

export const siteConfig: SiteConfig = {
  site: {
    name: 'Top Shelf Kitchen',
    tagline: 'Only the keepers.',
    url: 'https://example.com', // Update before deploying
    locale: 'en',
  },

  content: {
    featuredRecipeSlugs: [
      'chicken-tinga-tacos',
      'miso-butter-salmon-charred-broccoli',
      'dark-chocolate-olive-oil-cake',
      'tamago-soft-scramble-soy-butter-rice',
      'roasted-mushrooms-smoked-paprika-lime',
    ],
  },

  features: {
    // Core recipe features (enabled by default)
    search: {
      enabled: true,
      provider: 'pagefind',
    },

    unitToggle: {
      enabled: true,
      default: 'metric',
    },

    recipeScaling: {
      enabled: false,
      defaultServings: 4,
    },

    cookingMode: {
      enabled: false,
      keepAwake: true,
    },

    print: {
      enabled: false,
    },

    share: {
      enabled: false,
      socialLinks: false,
    },

    // Monetization & engagement (disabled by default for template)
    ads: {
      enabled: false,
      provider: 'adsense',
      slots: {
        sidebar: true,
        bottomBanner: true,
      },
      adsense: {
        clientId: '', // e.g., 'ca-pub-XXXXXXXXXXXXXXXX'
        sidebarSlotId: '', // e.g., '1234567890'
        bottomSlotId: '', // e.g., '0987654321'
      },
      personalization: 'nonPersonalizedByDefault',
    },

    analytics: {
      enabled: false,
      provider: 'none',
      umami: { websiteId: '' },
      plausible: { domain: '' },
      ga4: { measurementId: '' },
      custom: {},
    },

    comments: {
      enabled: false,
      provider: 'giscus',
      giscus: {
        repo: '', // e.g., 'username/repo'
        repoId: '', // from giscus.app setup
        category: '', // e.g., 'Announcements'
        categoryId: '', // from giscus.app setup
        mapping: 'pathname',
        strict: true,
        reactionsEnabled: true,
        emitMetadata: false,
        inputPosition: 'bottom',
        theme: 'noborder_dark', // Matches our dark glass aesthetic
        lang: 'en',
      },
    },

    newsletter: {
      enabled: false,
      provider: 'none',
      title: 'Stay in the loop',
      description: 'New recipes, no fluff. Unsubscribe anytime.',
      embed: { html: '' },
      endpoint: {
        actionUrl: '',
        method: 'POST',
        fieldName: 'email',
        hiddenFields: {},
      },
      showOnRecipes: false,
    },

    // SEO features (enabled by default)
    seo: {
      sitemap: true,
      robots: true,
      ogImages: true,
      jsonLdRecipe: true,
      defaultDescription: 'Curated recipes for people tired of fluffy food-blog filler. Every recipe is a banger.',
      twitterHandle: '', // e.g., '@topshelfkitchen'
      ogImagePath: '/og/default.png', // Can be missing, will be generated later
    },

    // Legal compliance
    legal: {
      consentBanner: true, // Shows if ads or analytics enabled
      consentVersion: '1', // Bump to force consent renewal
      privacyPage: true,
      cookiePage: true,
    },

    // Development options
    dev: {
      showDrafts: false,
      showUiDemo: false,
    },
  },
};

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Get a specific feature flag value
 * @example getFeatureFlag('search') // returns { enabled: true, provider: 'pagefind' }
 */
export function getFeatureFlag<K extends keyof FeaturesConfig>(
  name: K
): FeaturesConfig[K] {
  return siteConfig.features[name];
}

/**
 * Check if a feature is enabled using dot-notation path
 * @example isFeatureEnabled('comments.enabled') // returns false
 * @example isFeatureEnabled('search.enabled') // returns true
 */
export function isFeatureEnabled(path: string): boolean {
  const parts = path.split('.');
  let current: unknown = siteConfig.features;

  for (const part of parts) {
    if (current === null || current === undefined) {
      return false;
    }
    if (typeof current === 'object' && part in current) {
      current = (current as Record<string, unknown>)[part];
    } else {
      return false;
    }
  }

  return Boolean(current);
}

/**
 * Check if consent banner should be shown
 * (Only if legal.consentBanner is true AND ads or analytics are enabled)
 */
export function shouldShowConsentBanner(): boolean {
  const { legal, ads, analytics } = siteConfig.features;
  return legal.consentBanner && (ads.enabled || analytics.enabled);
}

// ============================================================================
// Exports
// ============================================================================

export default siteConfig;

