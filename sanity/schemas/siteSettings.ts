import { defineField, defineType } from "sanity";

export default defineType({
  name: "siteSettings",
  title: "Site Settings",
  type: "document",
  fields: [
    defineField({
      name: "heroTitle",
      title: "Hero Title",
      type: "string"
    }),
    defineField({
      name: "heroSubtitle",
      title: "Hero Subtitle",
      type: "text"
    })
  ]
});
