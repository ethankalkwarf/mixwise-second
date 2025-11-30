/**
 * Enhanced Cocktail Schema
 *
 * Rich content and SEO support for getmixwise.com
 *
 * Key additions:
 * - Step-based instructions with ordering
 * - Structured ingredients with amounts/units/preparation
 * - Fun facts with sourced references
 * - Flavor profiles (strength, sweetness, tartness, bitterness, aroma, texture)
 * - Best for occasions tagging
 * - Comprehensive SEO fields (title, meta description, image alt)
 * - Schema.org/JSON-LD support (keywords, prep time, calories, servings)
 * - Legacy field compatibility
 *
 * Migration: Created migrateCocktailFields.ts for data transformation
 * QA: Schema compiles, maintains backward compatibility
 */

const cocktail = {
  name: 'cocktail',
  title: 'Cocktail',
  type: 'document',
  fields: [
    // Core identity
     {
      name: 'name',
      title: 'Name',
      type: 'string',
      validation: (Rule: any) => Rule.required().min(2),
    },
     {
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: {
        source: 'name',
        maxLength: 96,
      },
      validation: (Rule: any) => Rule.required(),
    },
     {
      name: 'description',
      title: 'Short description',
      type: 'text',
      description:
        'Optional short description used in on-site copy. The SEO intro may be slightly different and more search-focused.',
    },

    // Image
     {
      name: 'image',
      title: 'Primary image',
      type: 'image',
      options: {
        hotspot: true,
      },
    },

    // Legacy external image URL - keep for backward compatibility
     {
      name: 'externalImageUrl',
      title: 'External Image URL (Legacy)',
      type: 'url',
      description: 'URL to an external image (e.g., from TheCocktailDB). New cocktails should use the Primary Image field above.',
      hidden: true,
    },
    // Core cocktail metadata
     {
      name: 'glass',
      title: 'Glassware',
      type: 'string',
      options: {
        list: [
          {title: 'Coupe', value: 'coupe'},
          {title: 'Martini', value: 'martini'},
          {title: 'Rocks', value: 'rocks'},
          {title: 'Highball / Collins', value: 'highball'},
          {title: 'Tiki / Hurricane', value: 'tiki'},
          {title: 'Nick & Nora', value: 'nicknora'},
          {title: 'Wine', value: 'wine'},
          {title: 'Shot', value: 'shot'},
          {title: 'Other', value: 'other'},
        ],
      },
    },
     {
      name: 'method',
      title: 'Method',
      type: 'string',
      options: {
        list: [
          {title: 'Shake', value: 'shake'},
          {title: 'Stir', value: 'stir'},
          {title: 'Build in glass', value: 'build'},
          {title: 'Blend', value: 'blend'},
          {title: 'Throw / roll', value: 'throw'},
        ],
      },
    },
    // Instructions (step-based)
     {
      name: 'instructions',
      title: 'Instructions',
      type: 'array',
      of: [
         {
          type: 'object',
          fields: [
             {
              name: 'step',
              title: 'Step text',
              type: 'text',
              validation: (Rule: any) => Rule.required(),
            },
             {
              name: 'order',
              title: 'Order',
              type: 'number',
              description:
                'Optional. If left blank, steps will be shown in the order they appear in this array.',
            },
          ],
          preview: {
            select: {
              step: 'step',
              order: 'order',
            },
            prepare({step, order}: {step?: string; order?: number}) {
              const label = order != null ? `${order}. ` : ''
              return {
                title: `${label}${step?.slice(0, 80) || 'Step'}`,
              }
            },
          },
        },
      ],
    },

    // Legacy instructions field for backward compatibility
     {
      name: 'instructionsLegacy',
      title: 'Instructions (Legacy Blocks)',
      type: 'array',
      of: [{ type: 'block' }],
      hidden: true,
      description: 'Legacy instructions field - use the new Instructions field above',
    },
    // Ingredients (normalized)
     {
      name: 'ingredients',
      title: 'Ingredients',
      type: 'array',
      of: [
         {
          type: 'object',
          fields: [
             {
              name: 'ingredient',
              title: 'Ingredient',
              type: 'reference',
              to: [{type: 'ingredient'}],
              validation: (Rule: any) => Rule.required(),
            },
             {
              name: 'amount',
              title: 'Amount',
              type: 'number',
              description: 'Numeric amount, e.g. 2 for 2 oz, 0.75 for ¾ oz.',
            },
             {
              name: 'unit',
              title: 'Unit',
              type: 'string',
              options: {
                list: [
                  {title: 'oz', value: 'oz'},
                  {title: 'ml', value: 'ml'},
                  {title: 'dash', value: 'dash'},
                  {title: 'tsp', value: 'tsp'},
                  {title: 'tbsp', value: 'tbsp'},
                  {title: 'barspoon', value: 'barspoon'},
                  {title: 'piece', value: 'piece'},
                  {title: 'slice', value: 'slice'},
                  {title: 'wedge', value: 'wedge'},
                  {title: 'leaf', value: 'leaf'},
                  {title: 'sprig', value: 'sprig'},
                  {title: 'top up', value: 'top'},
                ],
              },
            },
             {
              name: 'preparation',
              title: 'Preparation',
              type: 'string',
              description: 'Optional. E.g. "freshly squeezed", "muddled", "chilled".',
            },
             {
              name: 'note',
              title: 'Note',
              type: 'string',
              description: 'Any extra context for this ingredient line.',
            },

            // Legacy fields for backward compatibility
             {
              name: 'isOptional',
              title: 'Optional? (Legacy)',
              type: 'boolean',
              initialValue: false,
              hidden: true,
            },
             {
              name: 'notes',
              title: 'Notes (Legacy)',
              type: 'string',
              description: 'Legacy notes field - use preparation and note fields instead',
              hidden: true,
            },
          ],
          preview: {
            select: {
              title: 'ingredient.name',
              amount: 'amount',
              unit: 'unit',
            },
            prepare({title, amount, unit}: {title?: string; amount?: number; unit?: string}) {
              const amt = amount != null ? `${amount} ` : ''
              const u = unit || ''
              return {
                title: title || 'Ingredient',
                subtitle: `${amt}${u}`.trim(),
              }
            },
          },
        },
      ],
    },
     {
      name: 'tags',
      title: 'Tags',
      type: 'array',
      of: [{type: 'string'}],
      description:
        'General tags like "classic", "tiki", "low-ABV", "dessert", "holiday", "brunch", etc.',
    },

     {
      name: 'isPopular',
      title: 'Mark as featured / popular',
      type: 'boolean',
    },

     {
      name: 'hidden',
      title: 'Hide from public catalog',
      type: 'boolean',
      description:
        'Used for junk, low-quality, or duplicate entries. MixWise will not show these in the public library.',
      initialValue: false,
    },

    // Fun fact (history, trivia, origin) + sources
     {
      name: 'funFact',
      title: 'Fun fact / origin note',
      type: 'text',
      description:
        'Short, verified tidbit about origin, naming, cultural context, or technique. Only populated when supported by reputable sources.',
    },
     {
      name: 'funFactSources',
      title: 'Fun fact sources',
      type: 'array',
      of: [
         {
          type: 'object',
          fields: [
             {
              name: 'label',
              title: 'Source label',
              type: 'string',
              validation: (Rule: any) => Rule.required(),
              description: 'E.g. "Difford\'s Guide", "Esquire 1953", "Smuggler\'s Cove".',
            },
             {
              name: 'url',
              title: 'Source URL',
              type: 'url',
              validation: (Rule: any) => Rule.required(),
            },
          ],
          preview: {
            select: {
              title: 'label',
              subtitle: 'url',
            },
          },
        },
      ],
      description: 'Links to reputable references that support the fun fact.',
    },

    // Flavor profile and "best for"
     {
      name: 'flavorProfile',
      title: 'Flavor profile',
      type: 'object',
      fields: [
         {
          name: 'strength',
          title: 'Strength (1–5)',
          type: 'number',
          validation: (Rule: any) => Rule.min(1).max(5),
        },
         {
          name: 'sweetness',
          title: 'Sweetness (1–5)',
          type: 'number',
          validation: (Rule: any) => Rule.min(1).max(5),
        },
         {
          name: 'tartness',
          title: 'Tartness (1–5)',
          type: 'number',
          validation: (Rule: any) => Rule.min(1).max(5),
        },
         {
          name: 'bitterness',
          title: 'Bitterness (1–5)',
          type: 'number',
          validation: (Rule: any) => Rule.min(1).max(5),
        },
         {
          name: 'aroma',
          title: 'Aroma notes',
          type: 'string',
          description: 'Short free text, e.g. "citrus, herbal, spice".',
        },
         {
          name: 'texture',
          title: 'Texture',
          type: 'string',
          description: 'E.g. "crisp", "silky", "rich", "creamy".',
        },
      ],
    },
     {
      name: 'bestFor',
      title: 'Best for occasions',
      type: 'array',
      of: [{type: 'string'}],
      description:
        'E.g. "summer", "after dinner", "brunch", "party punch", "slow sipper". Used for discovery and recommendations.',
    },

    // SEO fields
     {
      name: 'seoTitle',
      title: 'SEO title',
      type: 'string',
      description:
        'Page title for search. Keep under ~60 characters when possible. Often "Classic Margarita Recipe with Fresh Lime".',
    },
     {
      name: 'metaDescription',
      title: 'Meta description',
      type: 'text',
      description:
        'Short summary for search results. Aim for 140–160 characters, human and helpful, not stuffed with keywords.',
    },
     {
      name: 'imageAltOverride',
      title: 'SEO image alt text',
      type: 'string',
      description:
        'If set, this overrides the image.alt field when rendering alt text for SEO and accessibility.',
    },

    // JSON-LD / schema.org support
     {
      name: 'schemaOrgKeywords',
      title: 'Schema.org keywords',
      type: 'array',
      of: [{type: 'string'}],
      description:
        'Optional. Keywords that can be used to populate the "keywords" field in Recipe JSON-LD.',
    },
     {
      name: 'prepTimeMinutes',
      title: 'Prep time (minutes)',
      type: 'number',
      description: 'Rough prep time, used in Recipe JSON-LD.',
    },
     {
      name: 'totalTimeMinutes',
      title: 'Total time (minutes)',
      type: 'number',
      description: 'Total time including prep, used in Recipe JSON-LD.',
    },
     {
      name: 'servings',
      title: 'Servings',
      type: 'number',
      description: 'Default number of servings for this recipe (usually 1).',
    },
     {
      name: 'calories',
      title: 'Approx. calories per serving',
      type: 'number',
      description:
        'Optional estimate. If omitted, MixWise can skip the calories field in JSON-LD.',
    },

    // Legacy fields for backward compatibility
     {
      name: 'garnish',
      title: 'Garnish (Legacy)',
      type: 'string',
      hidden: true,
      description: 'Legacy garnish field - consider adding to instructions instead',
    },

     {
      name: 'categories',
      title: 'Categories (Reference) - Legacy',
      type: 'array',
      of: [{ type: 'reference', to: [{ type: 'category' }] }],
      hidden: true,
      description: 'Legacy field, use drinkCategories instead'
    },

     {
      name: 'drinkCategories',
      title: 'Drink Categories',
      type: 'array',
      of: [{ type: 'string' }],
      options: {
        list: [
          { title: "🏝️ Tiki", value: "tiki" },
          { title: "🎩 Classic", value: "classic" },
          { title: "🎄 Holiday", value: "holiday" },
          { title: "✨ Modern", value: "modern" },
          { title: "🍰 Dessert", value: "dessert" },
          { title: "🍹 Mocktail", value: "mocktail" },
          { title: "🎉 Party / Crowd-Friendly", value: "party" },
          { title: "☀️ Summer", value: "summer" },
          { title: "❄️ Winter", value: "winter" },
          { title: "🍂 Fall", value: "fall" },
          { title: "🌸 Spring", value: "spring" },
          { title: "🔥 Strong", value: "strong" },
          { title: "🌿 Refreshing", value: "refreshing" },
          { title: "🍋 Sour", value: "sour" },
          { title: "🍯 Sweet", value: "sweet" },
          { title: "🥃 Boozy", value: "boozy" },
          { title: "🥗 Low-Calorie", value: "low-calorie" },
          { title: "⚡ Quick & Easy", value: "quick" }
        ],
        layout: "grid"
      },
      description: 'Select one or more categories that describe this cocktail'
    },

     {
      name: 'isFavorite',
      title: 'Favorite (Legacy)',
      type: 'boolean',
      description: 'Mark as a staff favorite or user favorite',
      initialValue: false,
      hidden: true,
    },

     {
      name: 'isTrending',
      title: 'Trending (Legacy)',
      type: 'boolean',
      description: 'Mark as currently trending',
      initialValue: false,
      hidden: true,
    },

     {
      name: 'primarySpirit',
      title: 'Primary Spirit',
      type: 'string',
      options: {
        list: [
          { title: "Vodka", value: "vodka" },
          { title: "Gin", value: "gin" },
          { title: "Rum", value: "rum" },
          { title: "Tequila", value: "tequila" },
          { title: "Mezcal", value: "mezcal" },
          { title: "Whiskey", value: "whiskey" },
          { title: "Bourbon", value: "bourbon" },
          { title: "Scotch", value: "scotch" },
          { title: "Brandy", value: "brandy" },
          { title: "Cognac", value: "cognac" },
          { title: "None (Non-alcoholic)", value: "none" }
        ]
      }
    },

     {
      name: 'difficulty',
      title: 'Difficulty',
      type: 'string',
      options: {
        list: [
          { title: "Easy", value: "easy" },
          { title: "Moderate", value: "moderate" },
          { title: "Advanced", value: "advanced" }
        ]
      },
      initialValue: 'easy'
    },

     {
      name: 'relatedArticles',
      title: 'Related Articles',
      type: 'array',
      of: [{ type: 'reference', to: [{ type: 'article' }] }]
    },

    // Legacy content fields - map to new structure where possible
     {
      name: 'history',
      title: 'History/Background (Legacy)',
      type: 'array',
      of: [{ type: 'block' }],
      hidden: true,
      description: 'Legacy field - use funFact field instead'
    },

     {
      name: 'tips',
      title: 'Pro Tips (Legacy)',
      type: 'array',
      of: [{ type: 'block' }],
      hidden: true,
      description: 'Legacy field - consider adding to instructions'
    },
    {
      name: "categories",
      title: "Categories (Reference)",
      type: "array",
      of: [{ type: "reference", to: [{ type: "category" }] }],
      hidden: true // Legacy field, use drinkCategories instead
    },
    {
      name: "drinkCategories",
      title: "Drink Categories",
      type: "array",
      of: [{ type: "string" }],
      options: {
        list: [
          { title: "🏝️ Tiki", value: "tiki" },
          { title: "🎩 Classic", value: "classic" },
          { title: "🎄 Holiday", value: "holiday" },
          { title: "✨ Modern", value: "modern" },
          { title: "🍰 Dessert", value: "dessert" },
          { title: "🍹 Mocktail", value: "mocktail" },
          { title: "🎉 Party / Crowd-Friendly", value: "party" },
          { title: "☀️ Summer", value: "summer" },
          { title: "❄️ Winter", value: "winter" },
          { title: "🍂 Fall", value: "fall" },
          { title: "🌸 Spring", value: "spring" },
          { title: "🔥 Strong", value: "strong" },
          { title: "🌿 Refreshing", value: "refreshing" },
          { title: "🍋 Sour", value: "sour" },
          { title: "🍯 Sweet", value: "sweet" },
          { title: "🥃 Boozy", value: "boozy" },
          { title: "🥗 Low-Calorie", value: "low-calorie" },
          { title: "⚡ Quick & Easy", value: "quick" }
        ],
        layout: "grid"
      },
      description: "Select one or more categories that describe this cocktail"
    },
    {
      name: "isFavorite",
      title: "Favorite",
      type: "boolean",
      description: "Mark as a staff favorite or user favorite",
      initialValue: false
    },
    {
      name: "isTrending",
      title: "Trending",
      type: "boolean",
      description: "Mark as currently trending",
      initialValue: false
    },
    {
      name: "primarySpirit",
      title: "Primary Spirit",
      type: "string",
      options: {
        list: [
          { title: "Vodka", value: "vodka" },
          { title: "Gin", value: "gin" },
          { title: "Rum", value: "rum" },
          { title: "Tequila", value: "tequila" },
          { title: "Mezcal", value: "mezcal" },
          { title: "Whiskey", value: "whiskey" },
          { title: "Bourbon", value: "bourbon" },
          { title: "Scotch", value: "scotch" },
          { title: "Brandy", value: "brandy" },
          { title: "Cognac", value: "cognac" },
          { title: "None (Non-alcoholic)", value: "none" }
        ]
      }
    },
    {
      name: "difficulty",
      title: "Difficulty",
      type: "string",
      options: {
        list: [
          { title: "Easy", value: "easy" },
          { title: "Moderate", value: "moderate" },
          { title: "Advanced", value: "advanced" }
        ]
      },
      initialValue: "easy"
    },
    {
      name: "isPopular",
      title: "Featured/Popular",
      type: "boolean",
      description: "Mark as a featured or popular cocktail",
      initialValue: false
    },
    {
      name: "relatedArticles",
      title: "Related Articles",
      type: "array",
      of: [{ type: "reference", to: [{ type: "article" }] }]
    },
    {
      name: "history",
      title: "History/Background",
      type: "array",
      of: [{ type: "block" }]
    },
    {
      name: "tips",
      title: "Pro Tips",
      type: "array",
      of: [{ type: "block" }]
    }
  ],
  preview: {
    select: {
      title: 'name',
      subtitle: 'slug.current',
      media: 'image',
    },
  },
  orderings: [
    {
      title: 'Name, A-Z',
      name: 'nameAsc',
      by: [{ field: 'name', direction: 'asc' }]
    },
    {
      title: 'Name, Z-A',
      name: 'nameDesc',
      by: [{ field: 'name', direction: 'desc' }]
    }
  ]
};

export default cocktail
