const author = {
  name: "author",
  title: "Author",
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
      name: "avatar",
      title: "Avatar",
      type: "image",
      options: { hotspot: true }
    },
    {
      name: "bio",
      title: "Bio",
      type: "array",
      of: [{ type: "block" }]
    },
    {
      name: "shortBio",
      title: "Short Bio",
      type: "text",
      description: "A brief one-liner for bylines"
    },
    {
      name: "role",
      title: "Role",
      type: "string",
      options: {
        list: [
          { title: "Founder", value: "founder" },
          { title: "Editor", value: "editor" },
          { title: "Writer", value: "writer" },
          { title: "Mixologist", value: "mixologist" },
          { title: "Guest Contributor", value: "guest" }
        ]
      }
    },
    {
      name: "email",
      title: "Email",
      type: "string",
      validation: (Rule: any) => Rule.email()
    },
    {
      name: "social",
      title: "Social Links",
      type: "object",
      fields: [
        { name: "twitter", title: "Twitter/X", type: "url" },
        { name: "instagram", title: "Instagram", type: "url" },
        { name: "linkedin", title: "LinkedIn", type: "url" },
        { name: "website", title: "Website", type: "url" }
      ]
    }
  ],
  preview: {
    select: {
      title: "name",
      subtitle: "role",
      media: "avatar"
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
      const roleLabels: Record<string, string> = {
        founder: "Founder",
        editor: "Editor",
        writer: "Writer",
        mixologist: "Mixologist",
        guest: "Guest Contributor"
      };
      return {
        title,
        subtitle: subtitle ? roleLabels[subtitle] || subtitle : undefined,
        media
      };
    }
  }
};

export default author;
