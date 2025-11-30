/**
 * Migration script to update cocktail documents from old structure to new structure
 *
 * This script handles the transition from:
 * - Old ingredient format (string amount, isOptional, notes) to new format (number amount, unit, preparation, note)
 * - Old instructions format (blocks) to new step-based format
 * - Maps legacy fields to new equivalents where possible
 *
 * Run this script after deploying the new schema to ensure existing data is preserved.
 */

import { sanityClient } from '../../lib/sanityClient'

interface LegacyIngredient {
  ingredient: {
    _type: 'reference'
    _ref: string
  }
  amount: string // e.g., "2 oz"
  isOptional?: boolean
  notes?: string
}

interface NewIngredient {
  ingredient: {
    _type: 'reference'
    _ref: string
  }
  amount?: number
  unit?: string
  preparation?: string
  note?: string
  // Legacy fields kept for backward compatibility
  isOptional?: boolean
  notes?: string
}

interface LegacyInstruction {
  _type: 'block'
  children: Array<{
    _type: 'span'
    text: string
  }>
}

interface NewInstruction {
  step: string
  order?: number
}

async function migrateCocktails() {
  console.log('Starting cocktail migration...')

  // Fetch all cocktails
  const cocktails = await sanityClient.fetch(`
    *[_type == "cocktail"] {
      _id,
      _rev,
      ingredients,
      instructions,
      history,
      tips
    }
  `)

  console.log(`Found ${cocktails.length} cocktails to migrate`)

  for (const cocktail of cocktails) {
    const updates: any = {}

    // Migrate ingredients
    if (cocktail.ingredients && Array.isArray(cocktail.ingredients)) {
      const migratedIngredients = cocktail.ingredients.map((ing: LegacyIngredient): NewIngredient => {
        // Parse amount string like "2 oz" into number and unit
        let amount: number | undefined
        let unit: string | undefined

        if (ing.amount) {
          // Simple parsing - can be enhanced based on actual data patterns
          const amountMatch = ing.amount.match(/^(\d*\.?\d+)\s*(.*)$/)
          if (amountMatch) {
            amount = parseFloat(amountMatch[1])
            unit = amountMatch[2]?.trim() || 'oz' // Default to oz if no unit
          }
        }

        return {
          ingredient: ing.ingredient,
          amount,
          unit,
          preparation: ing.notes, // Map notes to preparation
          note: undefined, // Can be filled manually if needed
          isOptional: ing.isOptional,
          notes: ing.notes // Keep original for reference
        }
      })

      updates.ingredients = migratedIngredients
    }

    // Migrate instructions
    if (cocktail.instructions && Array.isArray(cocktail.instructions)) {
      // Store old instructions in legacy field
      updates.instructionsLegacy = cocktail.instructions

      // Convert blocks to steps
      const steps: NewInstruction[] = []
      let stepOrder = 1

      for (const block of cocktail.instructions as LegacyInstruction[]) {
        if (block._type === 'block' && block.children) {
          const stepText = block.children
            .filter(child => child._type === 'span')
            .map(child => child.text)
            .join('')

          if (stepText.trim()) {
            steps.push({
              step: stepText.trim(),
              order: stepOrder++
            })
          }
        }
      }

      if (steps.length > 0) {
        updates.instructions = steps
      }
    }

    // Migrate history to funFact
    if (cocktail.history && Array.isArray(cocktail.history) && !cocktail.funFact) {
      // Simple conversion - take first block's text
      const firstBlock = cocktail.history.find((block: any) => block._type === 'block')
      if (firstBlock && firstBlock.children) {
        const funFact = firstBlock.children
          .filter((child: any) => child._type === 'span')
          .map((child: any) => child.text)
          .join('')
          .trim()

        if (funFact) {
          updates.funFact = funFact
        }
      }
    }

    // Migrate tips to instructions notes (if no instructions exist)
    if (cocktail.tips && Array.isArray(cocktail.tips) && (!cocktail.instructions || cocktail.instructions.length === 0)) {
      // Convert tips to instruction steps
      const tipSteps: NewInstruction[] = []
      let stepOrder = 1

      for (const block of cocktail.tips as LegacyInstruction[]) {
        if (block._type === 'block' && block.children) {
          const stepText = block.children
            .filter(child => child._type === 'span')
            .map(child => child.text)
            .join('')

          if (stepText.trim()) {
            tipSteps.push({
              step: `Pro tip: ${stepText.trim()}`,
              order: stepOrder++
            })
          }
        }
      }

      if (tipSteps.length > 0) {
        updates.instructions = tipSteps
      }
    }

    // Only update if there are changes
    if (Object.keys(updates).length > 0) {
      try {
        await sanityClient
          .patch(cocktail._id)
          .set(updates)
          .commit()

        console.log(`Migrated cocktail: ${cocktail._id}`)
      } catch (error) {
        console.error(`Failed to migrate cocktail ${cocktail._id}:`, error)
      }
    }
  }

  console.log('Cocktail migration completed!')
}

// Run the migration
migrateCocktails().catch(console.error)
