/**
 * Export Cocktails from Sanity to NDJSON
 *
 * This script queries all cocktails from Sanity and exports them to NDJSON format
 * for backup or migration purposes.
 */

import { createClient } from '@sanity/client'
import fs from 'fs'
import path from 'path'
import * as dotenv from 'dotenv'

// Load environment variables
dotenv.config({ path: '.env.local' })

// Sanity client setup
const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET!,
  apiVersion: '2023-01-01',
  useCdn: false,
  token: process.env.SANITY_WRITE_TOKEN!,
})

async function exportCocktails() {
  // Check environment variables
  if (!process.env.NEXT_PUBLIC_SANITY_PROJECT_ID) {
    throw new Error('NEXT_PUBLIC_SANITY_PROJECT_ID environment variable is required')
  }
  if (!process.env.NEXT_PUBLIC_SANITY_DATASET) {
    throw new Error('NEXT_PUBLIC_SANITY_DATASET environment variable is required')
  }
  if (!process.env.SANITY_WRITE_TOKEN) {
    throw new Error('SANITY_WRITE_TOKEN environment variable is required')
  }

  console.log('🚀 Exporting cocktails from Sanity...')
  console.log(`🎯 Sanity Project: ${process.env.NEXT_PUBLIC_SANITY_PROJECT_ID}/${process.env.NEXT_PUBLIC_SANITY_DATASET}`)

  // Query all cocktails with full data
  const cocktails = await client.fetch('*[_type == "cocktail"]')

  console.log(`📊 Found ${cocktails.length} cocktails`)

  const outputPath = path.join(process.cwd(), 'cocktails.enriched.ndjson')

  // Write to NDJSON file
  const stream = fs.createWriteStream(outputPath)

  for (const cocktail of cocktails) {
    stream.write(JSON.stringify(cocktail) + '\n')
  }

  stream.end()

  console.log(`✅ Export completed!`)
  console.log(`📁 Saved to: ${outputPath}`)
  console.log(`📊 Exported: ${cocktails.length} cocktails`)
}

// Run the export
exportCocktails().catch(err => {
  console.error('💥 Export failed:', err)
  process.exit(1)
})
