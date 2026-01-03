# Ship Checklist

Pre-launch verification for Top Shelf Kitchen. Complete all applicable items before deploying to production.

## Site Configuration

- [ ] `site.url` is set to your production domain in `src/config/site.ts`
- [ ] `site.name` and `site.tagline` are finalized
- [ ] `site.locale` matches your target audience
- [ ] `featuredRecipeSlugs` contains valid, published recipe slugs
- [ ] Remove or update demo recipes in `src/content/recipes/`

## Build Verification

- [ ] Run `npm run build` and confirm it completes without errors
- [ ] Run `npm run preview` and test the production build locally
- [ ] Confirm `dist/` folder is generated with expected structure
- [ ] Confirm `dist/pagefind/` exists (if search is enabled)

## Search

- [ ] Search modal opens and functions correctly
- [ ] Search returns relevant results for recipe titles and content
- [ ] `buildFlags.json` matches `site.ts` search configuration

## Recipe Pages

- [ ] All recipes load without errors
- [ ] Recipe images display correctly (or fallback gracefully)
- [ ] Ingredients list renders with correct amounts and units
- [ ] Steps are numbered and readable
- [ ] Unit toggle works (if enabled)
- [ ] Recipe scaling works (if enabled)

## Cooking Mode (if enabled)

- [ ] Cooking mode toggle appears on recipe pages
- [ ] Full-screen cooking view displays correctly
- [ ] Step navigation (previous/next) works
- [ ] Keyboard navigation works (arrow keys)
- [ ] Keep-awake prevents screen sleep (test on mobile)
- [ ] Exit button returns to normal view

## Print (if enabled)

- [ ] Print button appears on recipe pages
- [ ] Print preview shows clean, ink-friendly layout
- [ ] Non-essential elements are hidden (header, footer, ads)
- [ ] Recipe content is readable in black and white

## Share (if enabled)

- [ ] Share button appears on recipe pages
- [ ] Copy link functionality works
- [ ] Native share works on mobile (where supported)
- [ ] Social links open correct URLs (if enabled)

## SEO

- [ ] Run build and verify `dist/sitemap-index.xml` exists
- [ ] Verify `dist/robots.txt` exists and allows indexing
- [ ] Spot-check a recipe page for JSON-LD structured data:
  - View page source and search for `application/ld+json`
  - Validate with [Google Rich Results Test](https://search.google.com/test/rich-results)
- [ ] OpenGraph meta tags are present (check with [OpenGraph.xyz](https://www.opengraph.xyz/))
- [ ] Page titles are descriptive and unique

## Ads (if enabled)

- [ ] AdSense client ID is set correctly
- [ ] Ad slot IDs are configured for sidebar and bottom banner
- [ ] Ads load on recipe pages (may require production domain)
- [ ] Ads do not appear until user consents (if required)
- [ ] Personalization mode is appropriate for your audience

## Consent Banner (if ads or analytics enabled)

- [ ] Banner appears on first visit
- [ ] "Necessary only" dismisses banner and sets minimal cookies
- [ ] "Accept all" enables analytics and ad personalization
- [ ] Consent preferences persist across sessions
- [ ] Check `tsk_consent` cookie is set correctly
- [ ] Banner reappears after clearing cookies
- [ ] Bumping `consentVersion` forces re-consent

## Analytics (if enabled)

- [ ] Analytics script loads after consent
- [ ] Page views are tracked in your analytics dashboard
- [ ] No tracking before consent is given

## Comments (if enabled)

- [ ] Giscus loads on recipe pages
- [ ] Comments display in dark theme (matches site)
- [ ] Users can sign in with GitHub and post comments
- [ ] Comments appear in your GitHub Discussions

## Newsletter (if enabled)

- [ ] Signup form appears where expected
- [ ] Form submits successfully
- [ ] Success/error states display correctly
- [ ] Email is added to your newsletter list

## Legal Pages

- [ ] Privacy page (`/privacy`) loads and contains accurate information
- [ ] Privacy policy reflects actual data collection practices
- [ ] Cookie information is accurate
- [ ] Links in footer work

## Accessibility

- [ ] Skip link appears on keyboard focus
- [ ] All interactive elements are keyboard accessible
- [ ] Focus states are visible
- [ ] Color contrast meets WCAG AA (check with browser DevTools)
- [ ] Images have alt text

## Performance (Lighthouse)

Run Lighthouse audit on key pages:

- [ ] Home page scores 90+ on Performance
- [ ] Recipe page scores 90+ on Performance
- [ ] Accessibility score is 90+
- [ ] Best Practices score is 90+
- [ ] SEO score is 90+

## Mobile Testing

- [ ] Site is usable on mobile viewport (375px width)
- [ ] Touch targets are appropriately sized
- [ ] Cooking mode works on mobile
- [ ] No horizontal scrolling issues
- [ ] Text is readable without zooming

## Cross-Browser Testing

Test in at least:
- [ ] Chrome/Edge (Chromium)
- [ ] Firefox
- [ ] Safari (if targeting macOS/iOS users)

## Deployment

- [ ] Hosting platform is configured (Netlify, Vercel, etc.)
- [ ] Build command is set to `npm run build`
- [ ] Publish directory is set to `dist`
- [ ] Node.js version is 18.17.1+
- [ ] Custom domain is configured (if applicable)
- [ ] HTTPS is enabled
- [ ] Deploy preview works correctly

## Post-Launch

- [ ] Verify site loads on production domain
- [ ] Test search on production
- [ ] Verify ads load on production (if enabled)
- [ ] Submit sitemap to Google Search Console
- [ ] Monitor for errors in browser console
- [ ] Check analytics data is flowing (if enabled)

---

## Quick Commands

```bash
# Full build with search
npm run build

# Preview production build
npm run preview

# Check formatting
npm run format:check

# Format code
npm run format
```

