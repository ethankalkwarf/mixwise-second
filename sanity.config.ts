import { defineConfig } from "sanity";
import { deskTool } from "sanity/desk";
import { visionTool } from "@sanity/vision";
import schemaTypes from "./sanity/schemas";

// Note: This file must remain a pure Sanity config with no JSX.
// Debug UI components should be moved to separate React components in the app directory.

// Read Sanity configuration from environment variables with fallbacks
const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || "hqga2p7i";
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || "production";

// Auth token for Studio write access (required for Sanity v3)
const authToken = process.env.SANITY_AUTH_TOKEN;

export default defineConfig({
  name: "mixwise",
  title: "MixWise Studio",
  projectId,
  dataset,
  basePath: "/studio",
  auth: authToken ? { token: authToken } : undefined,
  plugins: [
    deskTool(),
    visionTool()
  ],
  schema: {
    types: schemaTypes
  }
});

