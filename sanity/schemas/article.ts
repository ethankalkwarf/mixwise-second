const article = {
  name: "article",
  title: "Article",
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
      name: "excerpt",
      title: "Excerpt",
      type: "text",
      description: "A short summary for previews and SEO"
    },
    {
      name: "mainImage",
      title: "Main Image",
      type: "image",
      options: { hotspot: true }
    },
    {
      name: "author",
      title: "Author",
      type: "reference",
      to: [{ type: "author" }]
    },
    {
      name: "categories",
      title: "Categories",
      type: "array",
      of: [{ type: "reference", to: [{ type: "category" }] }]
    },
    {
      name: "publishedAt",
      title: "Published At",
      type: "datetime"
    },
    {
      name: "body",
      title: "Body",
      type: "array",
      of: [
        { type: "block" },
        {
          type: "image",
          options: { hotspot: true },
          fields: [
            { name: "caption", type: "string", title: "Caption" },
            { name: "alt", type: "string", title: "Alt Text" }
          ]
        },
        {
          type: "object",
          name: "cocktailEmbed",
          title: "Cocktail Embed",
          fields: [
            {
              name: "cocktail",
              title: "Cocktail",
              type: "reference",
              to: [{ type: "cocktail" }]
            }
          ],
          preview: {
            select: { title: "cocktail.name" },
            prepare({ title }: { title?: string }) {
              return { title: `🍸 ${title || "Cocktail"}` };
            }
          }
        }
      ]
    },
    {
      name: "relatedCocktails",
      title: "Related Cocktails",
      type: "array",
      of: [{ type: "reference", to: [{ type: "cocktail" }] }]
    },
    {
      name: "tags",
      title: "Tags",
      type: "array",
      of: [{ type: "string" }],
      options: { layout: "tags" }
    },
    {
      name: "isFeatured",
      title: "Featured Article",
      type: "boolean",
      description: "Show this article prominently on the site",
      initialValue: false
    }
  ],
  preview: {
    select: {
      title: "title",
      author: "author.name",
      media: "mainImage"
    },
    prepare({
      title,
      author,
      media
    }: {
      title?: string;
      author?: string;
      media?: any;
    }) {
      return {
        title,
        subtitle: author ? `by ${author}` : undefined,
        media
      };
    }
  },
  orderings: [
    {
      title: "Published Date, Newest",
      name: "publishedAtDesc",
      by: [{ field: "publishedAt", direction: "desc" }]
    },
    {
      title: "Published Date, Oldest",
      name: "publishedAtAsc",
      by: [{ field: "publishedAt", direction: "asc" }]
    },
    {
      title: "Title, A-Z",
      name: "titleAsc",
      by: [{ field: "title", direction: "asc" }]
    }
  ]
};

export default article;
