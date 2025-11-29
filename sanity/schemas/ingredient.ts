const ingredient = {
  name: "ingredient",
  title: "Ingredient",
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
      name: "type",
      title: "Type",
      type: "string",
      options: {
        list: [
          { title: "Spirit", value: "spirit" },
          { title: "Liqueur", value: "liqueur" },
          { title: "Wine", value: "wine" },
          { title: "Beer", value: "beer" },
          { title: "Mixer", value: "mixer" },
          { title: "Citrus", value: "citrus" },
          { title: "Syrup", value: "syrup" },
          { title: "Bitters", value: "bitters" },
          { title: "Garnish", value: "garnish" },
          { title: "Other", value: "other" }
        ]
      },
      validation: (Rule: any) => Rule.required()
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
      name: "description",
      title: "Description",
      type: "text"
    },
    {
      name: "abv",
      title: "ABV (%)",
      type: "number",
      description: "Alcohol by volume percentage (e.g., 40 for 40%)",
      validation: (Rule: any) => Rule.min(0).max(100)
    },
    {
      name: "origin",
      title: "Origin/Country",
      type: "string"
    },
    {
      name: "flavorProfile",
      title: "Flavor Profile",
      type: "array",
      of: [{ type: "string" }],
      options: { layout: "tags" },
      description: "Key flavor notes (e.g., citrus, herbal, spicy)"
    },
    {
      name: "isStaple",
      title: "Is Staple?",
      type: "boolean",
      description: "Mark if this is a common household staple (ice, water, sugar)",
      initialValue: false
    },
    {
      name: "substitutes",
      title: "Substitutes",
      type: "array",
      of: [{ type: "reference", to: [{ type: "ingredient" }] }],
      description: "Similar ingredients that can be used as substitutes"
    },
    {
      name: "brands",
      title: "Recommended Brands",
      type: "array",
      of: [{ type: "string" }]
    },
    {
      name: "storageNotes",
      title: "Storage Notes",
      type: "text",
      description: "How to properly store this ingredient"
    }
  ],
  preview: {
    select: {
      title: "name",
      subtitle: "type",
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
      const typeLabels: Record<string, string> = {
        spirit: "🥃 Spirit",
        liqueur: "🏺 Liqueur",
        wine: "🍷 Wine",
        beer: "🍺 Beer",
        mixer: "🥤 Mixer",
        citrus: "🍋 Citrus",
        syrup: "🍯 Syrup",
        bitters: "💧 Bitters",
        garnish: "🍒 Garnish",
        other: "📦 Other"
      };
      return {
        title,
        subtitle: subtitle ? typeLabels[subtitle] || subtitle : undefined,
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
      title: "Type",
      name: "typeAsc",
      by: [
        { field: "type", direction: "asc" },
        { field: "name", direction: "asc" }
      ]
    }
  ]
};

export default ingredient;
