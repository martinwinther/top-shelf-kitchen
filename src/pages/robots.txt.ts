import type { APIRoute } from 'astro';
import { siteConfig } from '../config/site';

export const GET: APIRoute = () => {
  const { seo, site } = siteConfig.features;

  // If robots.txt is disabled, disallow all
  if (!seo.robots) {
    return new Response('User-agent: *\nDisallow: /', {
      headers: {
        'Content-Type': 'text/plain',
      },
    });
  }

  // Build robots.txt content
  let content = 'User-agent: *\nAllow: /\n';

  // Add sitemap reference if sitemap is enabled and site URL is set
  if (seo.sitemap && siteConfig.site.url && siteConfig.site.url !== 'https://example.com') {
    content += `\nSitemap: ${siteConfig.site.url}/sitemap-index.xml`;
  }

  return new Response(content, {
    headers: {
      'Content-Type': 'text/plain',
    },
  });
};


