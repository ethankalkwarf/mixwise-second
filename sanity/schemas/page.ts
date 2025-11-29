const page = {
  name: "page",
  title: "Page",
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
      options: { source: "title", maxLength: 96 }
    },
    {
      name: "body",
      title: "Body",
      type: "array",
      of: [{ type: "block" }]
    }
  ]
};

export default page;

