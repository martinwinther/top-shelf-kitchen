# Recipe Template

<!-- Frontmatter: Website/SEO metadata only -->
<!-- category options: breakfast, lunch, dinner, dessert, snacks -->
<!-- difficulty options: easy, medium, hard (optional) -->
<!-- status options: draft, published -->

---
title: "Recipe Title Here"
description: "Brief description of the recipe. This appears in search results and recipe cards."
image:
  src: "<https://example.com/image.jpg>"
  alt: "Descriptive alt text for the image"
category: "breakfast"
cuisine: "Italian"
servingsDefault: 4
times:
  prepMinutes: 10
  cookMinutes: 15
difficulty: "easy"

tags: ["tag1", "tag2", "quick"]

status: "published"
publishedAt: "2024-01-01"
---

## Ingredients

<!-- Ingredients are stored in a YAML code block -->
<!-- Each ingredient needs: amount (number), name (string) -->
<!-- Optional: unit (string), note (string) -->
<!-- Use amount: 0 for items like "salt, to taste" -->

```yaml
- amount: 200
  unit: "g"
  name: "flour"
- amount: 2
  name: "eggs"
- amount: 100
  unit: "ml"
  name: "milk"
- amount: 1
  unit: "tsp"
  name: "vanilla extract"
  note: "optional"
- amount: 0
  unit: "tsp"
  name: "salt"
  note: "to taste"
```

## Steps

<!-- Steps are written as a numbered list (1., 2., 3., etc.) -->
<!-- Each step should be clear and actionable -->

1. First step of the recipe. Be specific and clear.
2. Second step continues the process.
3. Third step adds more detail.
4. Final step completes the recipe.

---

<!-- Notes section: Everything below the separator (---) is rendered as markdown -->
<!-- You can include images, paragraphs, links, and other markdown content -->

![Optional image for the notes section](<https://example.com/notes-image.jpg>)

Optional notes, tips, or serving suggestions go here. This is where you can add helpful context, storage instructions, variations, or anything else that doesn't fit in the steps.

You can add multiple paragraphs. Each paragraph will be rendered separately.
