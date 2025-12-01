import { createClient } from "@sanity/client";

/**
 * Sanity client configuration
 * 
 * Uses environment variables when available, with fallbacks for development/build.
 * To configure, create a .env.local file with:
 *   NEXT_PUBLIC_SANITY_PROJECT_ID=your_project_id
 *   NEXT_PUBLIC_SANITY_DATASET=production
 */

// Read from environment variables with fallback to default project
// The fallback allows builds to succeed when env vars aren't available
const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || "hqga2p7i";
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || "production";
const apiVersion = process.env.NEXT_PUBLIC_SANITY_API_VERSION || "2024-01-01";

export const sanityClient = createClient({
  projectId,
  dataset,
  // Enable CDN for better performance with ISR revalidation
  useCdn: true,
  apiVersion
});

// Export configuration for use in other files (e.g., sanity.config.ts)
export const sanityConfig = {
  projectId,
  dataset,
  apiVersion
};

