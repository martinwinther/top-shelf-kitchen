import yaml from 'js-yaml';

interface Ingredient {
	amount: number;
	unit?: string;
	name: string;
	note?: string;
}

interface ParsedRecipeContent {
	ingredients: Ingredient[];
	steps: string[];
	notesMarkdown: string;
}

/**
 * Parses markdown content to extract structured recipe data.
 * Expects ingredients in a YAML code block under "## Ingredients",
 * steps as an ordered list under "## Steps",
 * and notes after the "---" separator.
 */
export function parseRecipeContent(rawContent: string): ParsedRecipeContent {
	const ingredients = extractIngredients(rawContent);
	const steps = extractSteps(rawContent);
	const notesMarkdown = extractNotes(rawContent);

	return { ingredients, steps, notesMarkdown };
}

/**
 * Extracts ingredients from a YAML code block following "## Ingredients" heading.
 */
function extractIngredients(content: string): Ingredient[] {
	// Match content between ## Ingredients heading and the next ## heading (or end)
	const ingredientsSectionMatch = content.match(
		/## Ingredients\s*\n([\s\S]*?)(?=\n## |\n---|\$)/
	);

	if (!ingredientsSectionMatch) {
		console.warn('No ingredients section found in recipe content');
		return [];
	}

	const ingredientsSection = ingredientsSectionMatch[1];

	// Extract YAML from code block (```yaml ... ```)
	const yamlBlockMatch = ingredientsSection.match(/```yaml\s*\n([\s\S]*?)```/);

	if (!yamlBlockMatch) {
		console.warn('No YAML code block found in ingredients section');
		return [];
	}

	const yamlContent = yamlBlockMatch[1];

	try {
		const parsed = yaml.load(yamlContent) as Ingredient[];
		if (!Array.isArray(parsed)) {
			console.warn('Ingredients YAML is not an array');
			return [];
		}
		return parsed;
	} catch (error) {
		console.error('Failed to parse ingredients YAML:', error);
		return [];
	}
}

/**
 * Extracts steps from an ordered list following "## Steps" heading.
 */
function extractSteps(content: string): string[] {
	// Match content between ## Steps heading and the next ## heading, --- separator, or end
	const stepsSectionMatch = content.match(
		/## Steps\s*\n([\s\S]*?)(?=\n## |\n---|\$)/
	);

	if (!stepsSectionMatch) {
		console.warn('No steps section found in recipe content');
		return [];
	}

	const stepsSection = stepsSectionMatch[1];

	// Match ordered list items: lines starting with number followed by period
	const stepMatches = stepsSection.matchAll(/^\d+\.\s+(.+)$/gm);

	const steps: string[] = [];
	for (const match of stepMatches) {
		const stepText = match[1].trim();
		if (stepText) {
			steps.push(stepText);
		}
	}

	return steps;
}

/**
 * Extracts notes content from after the "---" separator.
 * Returns raw markdown that can be rendered separately.
 */
function extractNotes(content: string): string {
	// Find the horizontal rule separator (---) that comes after the Steps section
	// The --- must be on its own line
	const separatorMatch = content.match(/\n---\s*\n([\s\S]*?)$/);

	if (!separatorMatch) {
		return '';
	}

	return separatorMatch[1].trim();
}
