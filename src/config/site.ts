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
  personalization: 'nonPersonalizedByDefault' | 'personalized';
}

interface AnalyticsConfig {
  enabled: boolean;
  provider: 'cloudflare' | 'umami' | 'plausible' | 'ga4' | 'custom' | 'none';
  cloudflare?: { token: string };
  umami?: { websiteId: string; scriptUrl: string };
  plausible?: { domain: string; scriptUrl: string };
  ga4?: { measurementId: string };
  custom?: { script: string };
}

interface GiscusConfig {
  repo: string;
  repoId: string;
  category: string;
  categoryId: string;
}

interface CommentsConfig {
  enabled: boolean;
  provider: 'giscus';
  giscus: GiscusConfig;
}

interface NewsletterConfig {
  enabled: boolean;
  provider: 'mailchimp' | 'convertkit' | 'buttondown' | 'custom';
  embedHtml?: string;
  endpoint?: string;
}

interface SeoConfig {
  sitemap: boolean;
  robots: boolean;
  ogImages: boolean;
  jsonLdRecipe: boolean;
}

interface LegalConfig {
  consentBanner: boolean;
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
      enabled: true,
      defaultServings: 4,
    },

    cookingMode: {
      enabled: true,
      keepAwake: true,
    },

    print: {
      enabled: true,
    },

    share: {
      enabled: true,
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
      cloudflare: { token: '' },
      umami: { websiteId: '', scriptUrl: '' },
      plausible: { domain: '', scriptUrl: '' },
      ga4: { measurementId: '' },
      custom: { script: '' },
    },

    comments: {
      enabled: false,
      provider: 'giscus',
      giscus: {
        repo: '', // e.g., 'username/repo'
        repoId: '', // from giscus.app setup
        category: '', // e.g., 'Announcements'
        categoryId: '', // from giscus.app setup
      },
    },

    newsletter: {
      enabled: false,
      provider: 'buttondown',
      embedHtml: '',
      endpoint: '',
    },

    // SEO features (enabled by default)
    seo: {
      sitemap: true,
      robots: true,
      ogImages: true,
      jsonLdRecipe: true,
    },

    // Legal compliance
    legal: {
      consentBanner: true, // Shows if ads or analytics enabled
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

