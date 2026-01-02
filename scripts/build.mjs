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
 * Check if search is enabled using the build flags JSON file
 * Falls back to regex parsing of site.ts if JSON file doesn't exist
 */
function isSearchEnabled() {
  const jsonPath = resolve(projectRoot, 'src/config/buildFlags.json');
  
  // Primary: Read from JSON file (stable, no parsing issues)
  if (existsSync(jsonPath)) {
    try {
      const flags = JSON.parse(readFileSync(jsonPath, 'utf-8'));
      if (flags?.search?.enabled !== undefined) {
        return Boolean(flags.search.enabled);
      }
    } catch (error) {
      console.warn('⚠ Could not parse buildFlags.json:', error.message);
    }
  }
  
  // Fallback: Parse site.ts with regex (legacy support)
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
    
    console.warn('⚠ Could not find search config in site.ts, defaulting to enabled');
    return true;
  } catch (error) {
    console.warn('⚠ Could not read site config, defaulting to search enabled');
    return true;
  }
}

/**
 * Run a command and stream output
 */
function run(command, description) {
  console.log(`\n▶ ${description}`);
  console.log(`  Running: ${command}\n`);
  
  try {
    execSync(command, { 
      cwd: projectRoot, 
      stdio: 'inherit',
      env: { ...process.env }
    });
    return true;
  } catch (error) {
    console.error(`\n✗ Failed: ${description}`);
    process.exit(error.status || 1);
  }
}

// Main build process
console.log('🏗 Top Shelf Kitchen Build\n');

// Step 1: Run Astro build
run('npx astro build', 'Building Astro site');

// Step 2: Conditionally run Pagefind
if (isSearchEnabled()) {
  run('npx pagefind --site dist', 'Indexing site with Pagefind');
  console.log('\n✓ Build complete with search index');
} else {
  console.log('\n✓ Build complete (search disabled, skipping Pagefind)');
}


