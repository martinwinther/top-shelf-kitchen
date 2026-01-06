#!/usr/bin/env node
/**
 * Build script that runs Astro build and conditionally runs Pagefind indexing.
 * Gates Pagefind based on buildFlags.json (avoids brittle regex parsing of TypeScript).
 * 
 * NOTE: Keep src/config/buildFlags.json in sync with src/config/site.ts
 */

import { execSync } from 'node:child_process';
import { readFileSync, existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const projectRoot = resolve(__dirname, '..');

/**
 * Check if search is enabled using buildFlags.json as the authoritative source.
 * Falls back to regex parsing of site.ts only if JSON file is missing (with warning).
 */
function isSearchEnabled() {
  const jsonPath = resolve(projectRoot, 'src/config/buildFlags.json');
  
  // Primary: Read from JSON file (authoritative source)
  if (existsSync(jsonPath)) {
    try {
      const flags = JSON.parse(readFileSync(jsonPath, 'utf-8'));
      if (flags?.search?.enabled !== undefined) {
        return Boolean(flags.search.enabled);
      }
      console.warn('WARNING: buildFlags.json exists but search.enabled is missing. Defaulting to enabled.');
      return true;
    } catch (error) {
      console.error('ERROR: Could not parse buildFlags.json:', error.message);
      console.error('Please fix buildFlags.json or remove it to use fallback.');
      process.exit(1);
    }
  }
  
  // Fallback: Parse site.ts with regex (legacy support, deprecated)
  console.warn('WARNING: buildFlags.json not found. Using fallback regex parsing of site.ts.');
  console.warn('This is deprecated. Create src/config/buildFlags.json for stable build gating.');
  
  try {
    const configPath = resolve(projectRoot, 'src/config/site.ts');
    const configContent = readFileSync(configPath, 'utf-8');
    
    // Look for the search config block and check if enabled is true
    // Pattern matches: search: { enabled: true, ... }
    const searchBlockMatch = configContent.match(
      /search:\s*\{[\s\S]*?enabled:\s*(true|false)[\s\S]*?\}/
    );
    
    if (searchBlockMatch) {
      return searchBlockMatch[1] === 'true';
    }
    
    console.warn('WARNING: Could not find search config in site.ts, defaulting to enabled');
    return true;
  } catch (error) {
    console.warn('WARNING: Could not read site config, defaulting to search enabled');
    return true;
  }
}

/**
 * Run a command and stream output
 */
function run(command, description) {
  console.log(`\n> ${description}`);
  console.log(`  Running: ${command}\n`);
  
  try {
    execSync(command, { 
      cwd: projectRoot, 
      stdio: 'inherit',
      env: { ...process.env }
    });
    return true;
  } catch (error) {
    console.error(`\nERROR: Failed: ${description}`);
    process.exit(error.status || 1);
  }
}

// Main build process
console.log('Top Shelf Kitchen Build\n');

// Step 1: Run Astro build
run('npx astro build', 'Building Astro site');

// Step 2: Conditionally run Pagefind
if (isSearchEnabled()) {
  run('npx pagefind --site dist', 'Indexing site with Pagefind');
  console.log('\nBuild complete with search index');
} else {
  console.log('\nBuild complete (search disabled, skipping Pagefind)');
}


