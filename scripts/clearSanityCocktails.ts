/**
 * Clear Cocktail Documents from Sanity CMS
 *
 * Deletes all cocktail-related documents from Sanity CMS.
 * This script is manual-only and should be run with caution.
 *
 * Usage: npm run clear:sanity-cocktails
 */

import { createClient } from '@sanity/client';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

// Sanity client setup with write permissions
const sanityClient = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET!,
  apiVersion: '2023-01-01',
  useCdn: false, // Disable CDN for write operations
  token: process.env.SANITY_WRITE_TOKEN!, // Required for write operations
});

/**
 * Clear all cocktail documents from Sanity
 */
async function clearSanityCocktails() {
  console.log('🧹 Starting Sanity cocktail cleanup...');
  console.log('⚠️  WARNING: This will permanently delete all cocktail documents from Sanity!');
  console.log('   Make sure you have backed up your data before proceeding.\n');

  // Ask for confirmation
  const readline = require('readline');
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  const confirm = await new Promise<string>((resolve) => {
    rl.question('Type "YES" to confirm deletion: ', (answer: string) => {
      rl.close();
      resolve(answer);
    });
  });

  if (confirm !== 'YES') {
    console.log('❌ Operation cancelled.');
    return;
  }

  try {
    // Define cocktail-related document types to delete
    const cocktailTypes = [
      'cocktail',
      // Add any other cocktail-related types if they exist
    ];

    let totalDeleted = 0;

    for (const docType of cocktailTypes) {
      console.log(`🗑️  Deleting documents of type: ${docType}`);

      // Fetch all documents of this type
      const documents = await sanityClient.fetch(`*[_type == "${docType}"]{_id, name, slug}`);

      if (documents.length === 0) {
        console.log(`   No documents found for type: ${docType}`);
        continue;
      }

      console.log(`   Found ${documents.length} documents to delete`);

      // Delete documents in batches
      const batchSize = 10;
      for (let i = 0; i < documents.length; i += batchSize) {
        const batch = documents.slice(i, i + batchSize);

        // Create transaction for batch delete
        const transaction = sanityClient.transaction();

        for (const doc of batch) {
          transaction.delete(doc._id);
          console.log(`   Deleting: ${doc.name || doc.slug?.current || doc._id}`);
        }

        // Commit the transaction
        await transaction.commit();
        totalDeleted += batch.length;

        console.log(`   Deleted batch of ${batch.length} documents`);
      }
    }

    console.log(`\n✅ Successfully deleted ${totalDeleted} cocktail documents from Sanity!`);

  } catch (error) {
    console.error('❌ Error clearing Sanity cocktails:', error);
    process.exit(1);
  }
}

// Run the cleanup
clearSanityCocktails().then(() => {
  console.log('✅ Sanity cocktail cleanup complete!');
  process.exit(0);
}).catch((error) => {
  console.error('❌ Sanity cocktail cleanup failed:', error);
  process.exit(1);
});
