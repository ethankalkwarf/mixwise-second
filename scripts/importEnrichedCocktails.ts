/**
 * Import Enriched Cocktails into Sanity
 *
 * Reads cocktails.enriched.ndjson and upserts all documents into Sanity CMS
 * using the API client directly (no CLI).
 *
 * Required ingredient shape (from sanity/schemas/cocktail.ts):
 * - ingredient: reference to 'ingredient' type (required)
 * - amount: number
 * - unit: string (oz, ml, dash, tsp, tbsp, barspoon, piece, slice, wedge, leaf, sprig, top)
 * - preparation: string (optional)
 * - note: string (optional)
 *
 * Normalization handles:
 * - Converting string amounts to numbers
 * - Standardizing unit names (oz/ounce -> oz, ml/milliliter -> ml, etc.)
 * - Ensuring ingredient references are valid
 * - Adding _key fields where missing
 */

import { createClient } from '@sanity/client'
import fs from 'fs'
import readline from 'readline'
import path from 'path'
import { nanoid } from 'nanoid'
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

// Allowed units from the schema
const ALLOWED_UNITS = [
  'oz', 'ml', 'dash', 'tsp', 'tbsp', 'barspoon',
  'piece', 'slice', 'wedge', 'leaf', 'sprig', 'top'
]

/**
 * Normalizes ingredient entries to match the current Sanity schema
 */
function normalizeIngredients(raw: any[]): any[] {
  return raw.map(item => {
    // Handle amount - convert strings to numbers
    let amount = item.amount
    if (typeof amount === 'string') {
      amount = parseFloat(amount.replace(/[^\d.-]/g, '')) || undefined
    }
    if (typeof amount !== 'number' || isNaN(amount)) {
      amount = undefined
    }

    // Handle unit - standardize common variations
    let unit = item.unit?.toLowerCase()?.trim()
    if (!unit) {
      unit = undefined
    } else {
      // Standardize unit names
      if (['oz', 'ounce', 'ounces'].includes(unit)) {
        unit = 'oz'
      } else if (['ml', 'milliliter', 'milliliters'].includes(unit)) {
        unit = 'ml'
      } else if (['dash', 'dashes'].includes(unit)) {
        unit = 'dash'
      } else if (['tsp', 'teaspoon', 'teaspoons'].includes(unit)) {
        unit = 'tsp'
      } else if (['tbsp', 'tablespoon', 'tablespoons'].includes(unit)) {
        unit = 'tbsp'
      } else if (['bar spoon', 'barspoon'].includes(unit)) {
        unit = 'barspoon'
      } else if (['piece', 'pieces'].includes(unit)) {
        unit = 'piece'
      } else if (['slice', 'slices'].includes(unit)) {
        unit = 'slice'
      } else if (['wedge', 'wedges'].includes(unit)) {
        unit = 'wedge'
      } else if (['leaf', 'leaves'].includes(unit)) {
        unit = 'leaf'
      } else if (['sprig', 'sprigs'].includes(unit)) {
        unit = 'sprig'
      } else if (['top', 'top up', 'top-up'].includes(unit)) {
        unit = 'top'
      }

      // Only keep unit if it's in the allowed list
      if (!ALLOWED_UNITS.includes(unit)) {
        unit = undefined
      }
    }

    // Handle ingredient reference
    let ingredient = undefined
    if (typeof item.ingredient === 'object' && item.ingredient?._ref) {
      ingredient = item.ingredient
    } else if (typeof item.ingredient === 'string') {
      // If it's just a string, we can't create a valid reference
      ingredient = undefined
    }

    return {
      _key: item._key || nanoid(),
      ingredient,
      amount,
      unit,
      preparation: item.preparation || undefined,
      note: item.note || undefined
    }
  })
}

/**
 * Main import function
 */
async function run() {
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

  const filePath = path.join(process.cwd(), 'cocktails.enriched.ndjson')

  // Check if file exists
  if (!fs.existsSync(filePath)) {
    throw new Error(`NDJSON file not found: ${filePath}`)
  }

  console.log('🚀 Starting enriched cocktails import...')
  console.log(`📁 Reading from: ${filePath}`)
  console.log(`🎯 Sanity Project: ${process.env.NEXT_PUBLIC_SANITY_PROJECT_ID}/${process.env.NEXT_PUBLIC_SANITY_DATASET}`)

  const rl = readline.createInterface({
    input: fs.createReadStream(filePath),
    crlfDelay: Infinity,
  })

  let count = 0
  let errorCount = 0

  for await (const line of rl) {
    if (!line.trim()) continue

    try {
      const doc = JSON.parse(line)

      if (doc._type !== 'cocktail') {
        console.log(`⚠️  Skipping non-cocktail document: ${doc._type}`)
        continue
      }

      // Normalize ingredients if present
      if (Array.isArray(doc.ingredients)) {
        doc.ingredients = normalizeIngredients(doc.ingredients)
      }

      // Upsert the document
      await client.createOrReplace(doc)

      count++
      if (count % 50 === 0) {
        console.log(`📊 Processed ${count} cocktails...`)
      }
    } catch (error) {
      errorCount++
      console.error(`❌ Error processing document ${count + errorCount}:`, error)
    }
  }

  console.log(`✅ Import completed!`)
  console.log(`📊 Successfully imported: ${count} cocktails`)
  if (errorCount > 0) {
    console.log(`⚠️  Errors encountered: ${errorCount}`)
  }
}

// Run the import
run().catch(err => {
  console.error('💥 Import failed:', err)
  process.exit(1)
})
