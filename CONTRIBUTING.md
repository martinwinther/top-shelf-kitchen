# Contributing

Thank you for your interest in contributing to Top Shelf Kitchen.

## Development Setup

1. Clone the repository:
   ```bash
   git clone <repo-url>
   cd top-shelf-kitchen
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

4. Open `http://localhost:4321` in your browser.

## Code Style

This project uses Prettier for code formatting.

```bash
# Check formatting
npm run format:check

# Fix formatting
npm run format
```

Run `npm run format` before committing.

## Commit Messages

Keep commit messages short and lowercase. Focus on what changed, not why.

Good:
- `add recipe scaling feature`
- `fix search modal keyboard navigation`
- `update readme with deployment instructions`

Avoid:
- `Added recipe scaling feature because users requested it`
- `Fix: Search modal keyboard navigation was broken`

## Pull Requests

1. Create a feature branch from `main`
2. Make your changes
3. Run `npm run format` and `npm run build`
4. Open a pull request with a clear description

## Project Structure

```
src/
  components/     # Astro and React components
  config/         # Site configuration
  content/        # Recipe markdown files
  layouts/        # Page layouts
  lib/            # Utility functions
  pages/          # Astro pages (routes)
  styles/         # Global CSS
```

## Adding Features

Feature toggles live in `src/config/site.ts`. New features should:

1. Be disabled by default
2. Have a clear toggle in the config
3. Include documentation in the README

## Questions

Open an issue for questions or feature requests.

