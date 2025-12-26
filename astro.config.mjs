// @ts-check
import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import tailwindcss from '@tailwindcss/vite';
import sitemap from '@astrojs/sitemap';
import { siteConfig } from './src/config/site.ts';

// Only enable sitemap if configured and site URL is set (not example.com)
const shouldEnableSitemap =
  siteConfig.features.seo.sitemap &&
  siteConfig.site.url &&
  siteConfig.site.url !== 'https://example.com';

// https://astro.build/config
export default defineConfig({
  site: shouldEnableSitemap ? siteConfig.site.url : undefined,
  integrations: [
    react(),
    // Only enable sitemap if configured
    ...(shouldEnableSitemap
      ? [
          sitemap({
            changefreq: 'weekly',
            priority: 0.7,
            lastmod: new Date(),
            filter: (page) => {
              // Exclude dev routes
              return !page.includes('/dev/');
            },
          }),
        ]
      : []),
  ],
  vite: {
    plugins: [tailwindcss()],
  },
});
