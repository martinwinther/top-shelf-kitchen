import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

// Recipe categories - easy to extend by editing this array
const recipeCategories = ['breakfast', 'lunch', 'dinner', 'dessert', 'snacks'] as const;

// Difficulty levels
const difficultyLevels = ['easy', 'medium', 'hard'] as const;

// Ingredient schema - used within recipe schema
const ingredientSchema = z.object({
	amount: z.number().describe('Amount of the ingredient'),
	unit: z.string().optional().describe('Unit of measurement (e.g., "g", "ml", "cups")'),
	name: z.string().describe('Name of the ingredient'),
	note: z.string().optional().describe('Optional note about the ingredient (e.g., "minced", "chopped")'),
});

// Recipe schema matching design doc requirements
const recipeSchema = z.object({
	title: z.string().describe('Recipe title'),
	description: z.string().describe('Brief description/summary of the recipe'),
	slug: z.string().optional().describe('URL slug (auto-generated from filename if not provided)'),
	image: z.string().optional().describe('Path to recipe image'),
	imageAlt: z.string().optional().describe('Alt text for recipe image'),
	category: z.enum(recipeCategories).describe('Recipe category'),
	cuisine: z.string().describe('Cuisine type (e.g., "Danish", "Japanese", "Chinese")'),
	servingsDefault: z.number().describe('Default number of servings (typically 4)'),
	times: z
		.object({
			prepMinutes: z.number().describe('Preparation time in minutes'),
			cookMinutes: z.number().describe('Cooking time in minutes'),
			totalMinutes: z.number().optional().describe('Total time in minutes (auto-calculated if not provided)'),
		})
		.describe('Time breakdown for the recipe'),
	difficulty: z.enum(difficultyLevels).optional().describe('Recipe difficulty level'),
	ingredients: z.array(ingredientSchema).min(1).describe('List of ingredients with amounts and units'),
	steps: z.array(z.string()).min(1).describe('Cooking steps (array of strings)'),
	tags: z.array(z.string()).optional().describe('Tags for categorization and search'),
	status: z.enum(['draft', 'published']).describe('Publication status'),
	publishedAt: z.coerce.date().describe('Publication date (ISO format: YYYY-MM-DD)'),
});

// Define recipes collection using glob loader
const recipesCollection = defineCollection({
	loader: glob({ pattern: './src/content/recipes/**/*.{md,mdx}' }),
	schema: recipeSchema,
});

// Export collections object (required by Astro)
export const collections = {
	recipes: recipesCollection,
};

