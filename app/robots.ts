import { MetadataRoute } from "next";
import { SITE_CONFIG } from "@/lib/seo";
import { isLearnPublic } from "@/lib/learnAccess";

export default function robots(): MetadataRoute.Robots {
  const disallow = [
    "/studio/",
    "/api/",
    "/join",
    "/join/",
    "/account$",
    "/account/",
    "/saved",
    "/saved/",
    "/onboarding",
    "/onboarding/",
    "/reset-password",
    "/unsubscribe",
    "/auth/",
    "/dashboard",
    "/dashboard/",
    "/shopping-list",
    "/dev",
    "/dev/",
    "/brand/system",
    "/brand/system/",
  ];
  if (!isLearnPublic()) {
    disallow.push("/learn", "/learn/");
  }

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow,
      },
      {
        userAgent: "GPTBot",
        allow: "/",
        disallow,
      },
      {
        userAgent: "OAI-SearchBot",
        allow: "/",
        disallow,
      },
      {
        userAgent: "ChatGPT-User",
        allow: "/",
        disallow,
      },
      {
        userAgent: "ClaudeBot",
        allow: "/",
        disallow,
      },
      {
        userAgent: "Claude-SearchBot",
        allow: "/",
        disallow,
      },
      {
        userAgent: "PerplexityBot",
        allow: "/",
        disallow,
      },
      {
        userAgent: "Google-Extended",
        allow: "/",
        disallow,
      },
      {
        userAgent: "Applebot-Extended",
        allow: "/",
        disallow,
      },
    ],
    sitemap: `${SITE_CONFIG.url}/sitemap.xml`,
  };
}
