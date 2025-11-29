const category = {
  name: "category",
  title: "Category",
  type: "document",
  fields: [
    {
      name: "title",
      title: "Title",
      type: "string",
      validation: (Rule: any) => Rule.required()
    },
    {
      name: "slug",
      title: "Slug",
      type: "slug",
      options: { source: "title", maxLength: 96 },
      validation: (Rule: any) => Rule.required()
    },
    {
      name: "categoryType",
      title: "Category Type",
      type: "string",
      options: {
        list: [
          { title: "Cocktail Category", value: "cocktail" },
          { title: "Article Category", value: "article" },
          { title: "Education Category", value: "education" },
          { title: "General", value: "general" }
        ]
      },
      description: "What type of content this category applies to"
    },
    {
      name: "description",
      title: "Description",
      type: "text"
    },
    {
      name: "image",
      title: "Image",
      type: "image",
      options: { hotspot: true }
    },
    {
      name: "color",
      title: "Brand Color",
      type: "string",
      description: "Hex color for this category (e.g., #84cc16)"
    },
    {
      name: "icon",
      title: "Icon",
      type: "string",
      description: "Emoji or icon identifier for this category"
    },
    {
      name: "parent",
      title: "Parent Category",
      type: "reference",
      to: [{ type: "category" }],
      description: "Optional parent category for nested organization"
    },
    {
      name: "order",
      title: "Display Order",
      type: "number",
      description: "Lower numbers appear first"
    }
  ],
  preview: {
    select: {
      title: "title",
      subtitle: "categoryType",
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
        cocktail: "🍸 Cocktail",
        article: "📰 Article",
        education: "🎓 Education",
        general: "📁 General"
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
      title: "Display Order",
      name: "orderAsc",
      by: [
        { field: "order", direction: "asc" },
        { field: "title", direction: "asc" }
      ]
    },
    {
      title: "Title, A-Z",
      name: "titleAsc",
      by: [{ field: "title", direction: "asc" }]
    }
  ]
};

export default category;
