import { MetadataRoute } from "next";
import { SITE_CONFIG } from "@/lib/seo";
import { isLearnPublic } from "@/lib/learnAccess";

export default function robots(): MetadataRoute.Robots {
  const disallow = ["/studio/", "/api/"];
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
    ],
    sitemap: `${SITE_CONFIG.url}/sitemap.xml`,
  };
}





