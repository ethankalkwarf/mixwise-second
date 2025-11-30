const collection = {
  name: "collection",
  title: "Collection",
  type: "document",
  fields: [
    {
      name: "name",
      title: "Name",
      type: "string",
      validation: (Rule: { required: () => unknown }) => Rule.required(),
    },
    {
      name: "slug",
      title: "Slug",
      type: "slug",
      options: {
        source: "name",
        maxLength: 96,
      },
      validation: (Rule: { required: () => unknown }) => Rule.required(),
    },
    {
      name: "description",
      title: "Description",
      type: "text",
      rows: 3,
    },
    {
      name: "image",
      title: "Cover Image",
      type: "image",
      options: {
        hotspot: true,
      },
    },
    {
      name: "cocktails",
      title: "Cocktails",
      type: "array",
      of: [{ type: "reference", to: [{ type: "cocktail" }] }],
      description: "Cocktails in this collection",
    },
    {
      name: "featured",
      title: "Featured",
      type: "boolean",
      initialValue: false,
      description: "Show this collection on the homepage",
    },
    {
      name: "order",
      title: "Order",
      type: "number",
      description: "Order in which to display (lower numbers first)",
      initialValue: 0,
    },
  ],
  orderings: [
    {
      title: "Order",
      name: "orderAsc",
      by: [{ field: "order", direction: "asc" as const }],
    },
    {
      title: "Name",
      name: "nameAsc",
      by: [{ field: "name", direction: "asc" as const }],
    },
  ],
  preview: {
    select: {
      title: "name",
      subtitle: "description",
      media: "image",
    },
  },
};

export default collection;
