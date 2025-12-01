import { defineConfig } from "sanity";
import { deskTool } from "sanity/desk";
import { visionTool } from "@sanity/vision";
import schemaTypes from "./sanity/schemas";

// Debug tool to show current Sanity configuration
const projectInfoTool = () => ({
  name: 'project-info',
  title: 'Project Info',
  component: () => {
    const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || "hqga2p7i";
    const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || "production";
    const hasAuthToken = !!process.env.SANITY_AUTH_TOKEN;

    return (
      <div style={{ padding: '20px', fontFamily: 'monospace' }}>
        <h2>Sanity Project Configuration</h2>
        <p><strong>Project ID:</strong> {projectId}</p>
        <p><strong>Dataset:</strong> {dataset}</p>
        <p><strong>Auth Token:</strong> {hasAuthToken ? '✅ Configured' : '❌ Missing (read-only mode)'}</p>
        {process.env.NODE_ENV === 'development' && (
          <p><em>This tool only appears in development mode</em></p>
        )}
      </div>
    );
  }
});

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
    visionTool(),
    ...(process.env.NODE_ENV === 'development' ? [projectInfoTool()] : [])
  ],
  schema: {
    types: schemaTypes
  }
});

