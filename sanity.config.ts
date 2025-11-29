import { defineConfig } from "sanity";
import { deskTool } from "sanity/desk";
import { visionTool } from "@sanity/vision";
import schemaTypes from "./sanity/schemas";

// Read Sanity configuration from environment variables with fallbacks
const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || "hqga2p7i";
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || "production";

export default defineConfig({
  name: "mixwise",
  title: "MixWise Studio",
  projectId,
  dataset,
  basePath: "/studio",
  plugins: [deskTool(), visionTool()],
  schema: {
    types: schemaTypes
  }
});

