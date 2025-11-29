const cocktail = {
  name: "cocktail",
  title: "Cocktail",
  type: "document",
  fields: [
    {
      name: "name",
      title: "Name",
      type: "string",
      validation: (Rule: any) => Rule.required()
    },
    {
      name: "slug",
      title: "Slug",
      type: "slug",
      options: { source: "name", maxLength: 96 },
      validation: (Rule: any) => Rule.required()
    },
    {
      name: "description",
      title: "Description",
      type: "text"
    },
    {
      name: "image",
      title: "Image (Upload)",
      type: "image",
      options: { hotspot: true },
      description: "Upload a custom image, or use External Image URL below"
    },
    {
      name: "externalImageUrl",
      title: "External Image URL",
      type: "url",
      description: "URL to an external image (e.g., from TheCocktailDB)"
    },
    {
      name: "glass",
      title: "Glass Type",
      type: "string",
      options: {
        list: [
          { title: "Rocks", value: "rocks" },
          { title: "Highball", value: "highball" },
          { title: "Coupe", value: "coupe" },
          { title: "Martini", value: "martini" },
          { title: "Collins", value: "collins" },
          { title: "Nick & Nora", value: "nick-nora" },
          { title: "Flute", value: "flute" },
          { title: "Wine Glass", value: "wine" },
          { title: "Copper Mug", value: "copper-mug" },
          { title: "Hurricane", value: "hurricane" },
          { title: "Tiki Mug", value: "tiki" },
          { title: "Shot Glass", value: "shot" },
          { title: "Other", value: "other" }
        ]
      }
    },
    {
      name: "method",
      title: "Method",
      type: "string",
      options: {
        list: [
          { title: "Shaken", value: "shaken" },
          { title: "Stirred", value: "stirred" },
          { title: "Built", value: "built" },
          { title: "Blended", value: "blended" },
          { title: "Muddled", value: "muddled" },
          { title: "Layered", value: "layered" }
        ]
      }
    },
    {
      name: "instructions",
      title: "Instructions",
      type: "array",
      of: [{ type: "block" }]
    },
    {
      name: "ingredients",
      title: "Ingredients",
      type: "array",
      of: [
        {
          type: "object",
          name: "cocktailIngredient",
          title: "Cocktail Ingredient",
          fields: [
            {
              name: "ingredient",
              title: "Ingredient",
              type: "reference",
              to: [{ type: "ingredient" }]
            },
            {
              name: "amount",
              title: "Amount",
              type: "string",
              description: "e.g., 2 oz, 1 dash, 3 drops"
            },
            {
              name: "isOptional",
              title: "Optional?",
              type: "boolean",
              initialValue: false
            },
            {
              name: "notes",
              title: "Notes",
              type: "string",
              description: "e.g., fresh, chilled, muddled"
            }
          ],
          preview: {
            select: {
              title: "ingredient.name",
              amount: "amount"
            },
            prepare({ title, amount }: { title?: string; amount?: string }) {
              return {
                title: title || "Unknown ingredient",
                subtitle: amount
              };
            }
          }
        }
      ]
    },
    {
      name: "garnish",
      title: "Garnish",
      type: "string"
    },
    {
      name: "tags",
      title: "Tags",
      type: "array",
      of: [{ type: "string" }],
      options: { layout: "tags" }
    },
    {
      name: "categories",
      title: "Categories",
      type: "array",
      of: [{ type: "reference", to: [{ type: "category" }] }]
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
      title: "name",
      subtitle: "primarySpirit",
      media: "image"
    },
    prepare({
      title,
      subtitle,
      media
    }: {
      title?: string;
      subtitle?: string;
      media?: any;
    }) {
      return {
        title,
        subtitle: subtitle ? `Primary: ${subtitle}` : undefined,
        media
      };
    }
  },
  orderings: [
    {
      title: "Name, A-Z",
      name: "nameAsc",
      by: [{ field: "name", direction: "asc" }]
    },
    {
      title: "Name, Z-A",
      name: "nameDesc",
      by: [{ field: "name", direction: "desc" }]
    }
  ]
};

export default cocktail;
