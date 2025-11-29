const educationModule = {
  name: "educationModule",
  title: "Education Module",
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
      name: "description",
      title: "Description",
      type: "text",
      description: "Brief overview of what this module covers"
    },
    {
      name: "image",
      title: "Cover Image",
      type: "image",
      options: { hotspot: true }
    },
    {
      name: "difficulty",
      title: "Difficulty Level",
      type: "string",
      options: {
        list: [
          { title: "Beginner", value: "beginner" },
          { title: "Intermediate", value: "intermediate" },
          { title: "Advanced", value: "advanced" },
          { title: "Expert", value: "expert" }
        ]
      },
      validation: (Rule: any) => Rule.required()
    },
    {
      name: "duration",
      title: "Estimated Duration",
      type: "string",
      description: "e.g., 15 min, 1 hour"
    },
    {
      name: "category",
      title: "Category",
      type: "reference",
      to: [{ type: "category" }]
    },
    {
      name: "prerequisites",
      title: "Prerequisites",
      type: "array",
      of: [{ type: "reference", to: [{ type: "educationModule" }] }],
      description: "Modules that should be completed before this one"
    },
    {
      name: "content",
      title: "Content",
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
          name: "videoEmbed",
          title: "Video Embed",
          fields: [
            {
              name: "url",
              title: "Video URL",
              type: "url",
              description: "YouTube or Vimeo URL"
            },
            { name: "caption", title: "Caption", type: "string" }
          ],
          preview: {
            select: { url: "url" },
            prepare({ url }: { url?: string }) {
              return { title: `🎥 Video: ${url || "No URL"}` };
            }
          }
        },
        {
          type: "object",
          name: "tip",
          title: "Pro Tip",
          fields: [{ name: "content", title: "Tip Content", type: "text" }],
          preview: {
            select: { content: "content" },
            prepare({ content }: { content?: string }) {
              return {
                title: `💡 Tip: ${content?.substring(0, 50) || "..."}...`
              };
            }
          }
        },
        {
          type: "object",
          name: "quiz",
          title: "Quiz Question",
          fields: [
            { name: "question", title: "Question", type: "string" },
            {
              name: "options",
              title: "Options",
              type: "array",
              of: [{ type: "string" }]
            },
            {
              name: "correctAnswer",
              title: "Correct Answer Index",
              type: "number",
              description: "0-based index of the correct option"
            },
            { name: "explanation", title: "Explanation", type: "text" }
          ],
          preview: {
            select: { question: "question" },
            prepare({ question }: { question?: string }) {
              return { title: `❓ ${question || "Quiz Question"}` };
            }
          }
        }
      ]
    },
    {
      name: "relatedCocktails",
      title: "Related Cocktails",
      type: "array",
      of: [{ type: "reference", to: [{ type: "cocktail" }] }],
      description: "Cocktails that relate to this module's content"
    },
    {
      name: "relatedArticles",
      title: "Related Articles",
      type: "array",
      of: [{ type: "reference", to: [{ type: "article" }] }]
    },
    {
      name: "nextModule",
      title: "Next Module",
      type: "reference",
      to: [{ type: "educationModule" }],
      description: "Suggested next module after completing this one"
    },
    {
      name: "order",
      title: "Display Order",
      type: "number",
      description: "Order within its category (lower numbers first)"
    },
    {
      name: "isPublished",
      title: "Published",
      type: "boolean",
      initialValue: false
    }
  ],
  preview: {
    select: {
      title: "title",
      subtitle: "difficulty",
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
      const difficultyLabels: Record<string, string> = {
        beginner: "🟢 Beginner",
        intermediate: "🟡 Intermediate",
        advanced: "🟠 Advanced",
        expert: "🔴 Expert"
      };
      return {
        title,
        subtitle: subtitle ? difficultyLabels[subtitle] || subtitle : undefined,
        media
      };
    }
  },
  orderings: [
    {
      title: "Order",
      name: "orderAsc",
      by: [{ field: "order", direction: "asc" }]
    },
    {
      title: "Difficulty",
      name: "difficultyAsc",
      by: [{ field: "difficulty", direction: "asc" }]
    },
    {
      title: "Title, A-Z",
      name: "titleAsc",
      by: [{ field: "title", direction: "asc" }]
    }
  ]
};

export default educationModule;
