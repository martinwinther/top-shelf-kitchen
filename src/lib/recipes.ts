/**
 * Recipe helper functions - Server-only utilities
 */

import { getCollection, type CollectionEntry } from 'astro:content';

type RecipeEntry = CollectionEntry<'recipes'>;

/**
 * Get all published recipes from the collection
 */
export async function getPublishedRecipes(): Promise<RecipeEntry[]> {
  const allRecipes = await getCollection('recipes');
  return allRecipes.filter((recipe) => recipe.data.status === 'published');
}

/**
 * Calculate total minutes (prep + cook) for a recipe
 */
export function getTotalMinutes(recipe: RecipeEntry): number {
  return recipe.data.times.prepMinutes + recipe.data.times.cookMinutes;
}

/**
 * Pick featured recipes by their slugs
 * Returns recipes in the order of the slugs array
 */
export function pickFeatured(
  recipes: RecipeEntry[],
  slugs: string[]
): RecipeEntry[] {
  const recipeMap = new Map<string, RecipeEntry>();
  
  recipes.forEach((recipe) => {
    const slug = recipe.data.slug || recipe.id.replace(/\.md$/, '');
    recipeMap.set(slug, recipe);
  });

  return slugs
    .map((slug) => recipeMap.get(slug))
    .filter((recipe): recipe is RecipeEntry => recipe !== undefined);
}

/**
 * Get recipe slug from entry (uses data.slug or derives from id)
 */
export function getRecipeSlug(recipe: RecipeEntry): string {
  return recipe.data.slug || recipe.id.replace(/\.md$/, '');
}

