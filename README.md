# Top Shelf Kitchen

A dark, heavy-glass, minimalist recipe site for people tired of fluffy food-blog filler. Every recipe is a "banger".

## Development

```bash
# Install dependencies
npm install

# Start dev server (localhost:4321)
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Format code
npm run format

# Check formatting
npm run format:check
```

## Documentation

Consult `docs/` for design spec and feature toggles:

- `docs/design.md` — Design decisions, stack, content model
- `docs/settings.md` — Feature toggles and configuration

## Privacy & Consent

A functional consent banner is included and automatically appears when ads or analytics are enabled.

**Consent categories:**
- `necessary` — Always on, essential site functions
- `ads` — Off by default, enables AdSense
- `analytics` — Off by default, enables analytics scripts

**Storage:**
- Cookie: `tsk_consent` (1 year, for pre-hydration reads)
- localStorage: `tsk.consent` (mirror for convenience)

**AdSense + EEA/UK Note:**
The built-in consent banner provides basic cookie consent. For serving **personalized ads** to users in the EEA/UK, Google requires a [Google-certified CMP](https://support.google.com/admanager/answer/9566541). By default, this template uses `nonPersonalizedByDefault` mode. If you need personalized ads in those regions, integrate a certified CMP or use Google's [Funding Choices](https://support.google.com/fundingchoices).

**Versioning:**
Change `features.legal.consentVersion` in `src/config/site.ts` to force users to re-consent (e.g., after policy changes).
