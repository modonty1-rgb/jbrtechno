/**
 * Database Migration Script
 * 
 * This script copies all data from the current database to a new database named "jbrtechno".
 * 
 * IMPORTANT:
 * - This script COPIES data (does not move or delete)
 * - Old database remains completely untouched
 * - Both databases will exist simultaneously
 * - Old database can be kept as permanent backup
 * 
 * Usage:
 *   npx ts-node --compiler-options {"module":"CommonJS"} scripts/migrate-database-to-jbrtechno.ts [old-db-name]
 * 
 * If old-db-name is not provided, it will be extracted from DATABASE_URL environment variable.
 */

// Load environment variables
// In Node.js, process.env is available by default
// dotenv is optional - check if DATABASE_URL exists, if not try to load from .env
if (!process.env.DATABASE_URL) {
  try {
    require('dotenv').config();
  } catch {
    // dotenv not available, that's okay
  }
}

// MongoDB client import
let MongoClient: any;
let Db: any;

try {
  const mongodb = require('mongodb');
  MongoClient = mongodb.MongoClient;
  Db = mongodb.Db;
} catch (error) {
  console.error('');
  console.error('❌ Error: mongodb package is not installed');
  console.error('');
  console.error('Please install the required dependency:');
  console.error('   pnpm add mongodb');
  console.error('   OR');
  console.error('   npm install mongodb');
  console.error('');
  process.exit(1);
}

const NEW_DATABASE_NAME = 'jbrtechno';

// All Prisma collection names (MongoDB uses lowercase, pluralized)
const COLLECTIONS = [
  'User',
  'Account',
  'Session',
  'VerificationToken',
  'Application',
  'Phase1Requirement',
  'Transaction',
  'ContactMessage',
  'InterviewResult',
];

/**
 * Extract database name from MongoDB connection string
 */
function extractDatabaseName(connectionString: string): string | null {
  try {
    const url = new URL(connectionString);
    const pathname = url.pathname;
    if (pathname && pathname.length > 1) {
      return pathname.substring(1).split('?')[0]; // Remove leading '/' and query params
    }
  } catch (error) {
    console.error('Error parsing connection string:', error);
  }
  return null;
}

/**
 * Replace database name in connection string
 */
function replaceDatabaseName(connectionString: string, newDbName: string): string {
  try {
    const url = new URL(connectionString);
    url.pathname = `/${newDbName}`;
    return url.toString();
  } catch (error) {
    // Fallback: simple string replacement
    return connectionString.replace(/\/[^/?]+(\?|$)/, `/${newDbName}$1`);
  }
}

/**
 * Copy collection from source to target database
 */
async function copyCollection(
  sourceDb: any,
  targetDb: any,
  collectionName: string
): Promise<{ count: number; success: boolean; error?: string }> {
  try {
    const sourceCollection = sourceDb.collection(collectionName);
    const targetCollection = targetDb.collection(collectionName);

    // Check if collection exists in source
    const collections = await sourceDb.listCollections({ name: collectionName }).toArray();
    if (collections.length === 0) {
      console.log(`   ⏭️  Collection "${collectionName}" does not exist in source database, skipping...`);
      return { count: 0, success: true };
    }

    // Get all documents from source
    const documents = await sourceCollection.find({}).toArray();
    const count = documents.length;

    if (count === 0) {
      console.log(`   ✓ Collection "${collectionName}" is empty, skipping...`);
      return { count: 0, success: true };
    }

    // Insert documents into target (only if target is empty)
    const targetCount = await targetCollection.countDocuments();
    if (targetCount > 0) {
      console.log(`   ⚠️  Collection "${collectionName}" already has ${targetCount} documents in target database`);
      console.log(`   ℹ️  Skipping to preserve existing data. Delete target collection first if you want to re-copy.`);
      return { count: targetCount, success: true };
    }

    if (documents.length > 0) {
      await targetCollection.insertMany(documents, { ordered: false });
    }

    // Copy indexes (simplified - MongoDB/Prisma will recreate indexes via schema)
    try {
      const indexes = await sourceCollection.indexes();
      for (const index of indexes) {
        if (index.name !== '_id_') {
          try {
            // Create index on target collection
            const keys: any = index.key || {};
            const options: any = {
              name: index.name,
            };
            if (index.unique) options.unique = true;
            if (index.sparse) options.sparse = true;
            if (index.background) options.background = true;
            
            await targetCollection.createIndex(keys, options);
          } catch (indexError: any) {
            // Index might already exist or have conflicts, that's okay
            console.log(`   ⚠️  Note: Could not recreate index "${index.name}" for "${collectionName}"`);
          }
        }
      }
    } catch (indexError) {
      // Index copying is optional, continue even if it fails
      console.log(`   ⚠️  Note: Index copying encountered issues (this is usually okay)`);
    }

    return { count, success: true };
  } catch (error: any) {
    return {
      count: 0,
      success: false,
      error: error.message || String(error),
    };
  }
}

/**
 * Verify migration by comparing counts
 */
async function verifyMigration(
  sourceDb: any,
  targetDb: any,
  collectionName: string
): Promise<boolean> {
  try {
    const sourceCount = await sourceDb.collection(collectionName).countDocuments();
    const targetCount = await targetDb.collection(collectionName).countDocuments();

    if (sourceCount === targetCount) {
      console.log(`   ✅ Verified: ${sourceCount} documents match`);
      return true;
    } else {
      console.log(`   ❌ Mismatch: Source has ${sourceCount}, Target has ${targetCount}`);
      return false;
    }
  } catch (error) {
    console.log(`   ⚠️  Could not verify: ${error}`);
    return false;
  }
}

/**
 * Main migration function
 */
async function migrateDatabase(oldDbName?: string) {
  const databaseUrl = process.env.DATABASE_URL;

  if (!databaseUrl) {
    console.error('❌ Error: DATABASE_URL environment variable is not set');
    console.error('   Please set DATABASE_URL in your .env file');
    process.exit(1);
  }

  // Extract old database name
  const detectedDbName = extractDatabaseName(databaseUrl);
  const sourceDbName = oldDbName || detectedDbName;

  if (!sourceDbName) {
    console.error('❌ Error: Could not determine source database name');
    console.error('   Please provide the old database name as an argument:');
    console.error('   npx ts-node scripts/migrate-database-to-jbrtechno.ts <old-db-name>');
    process.exit(1);
  }

  if (sourceDbName === NEW_DATABASE_NAME) {
    console.log(`ℹ️  Source database is already "${NEW_DATABASE_NAME}", nothing to migrate`);
    process.exit(0);
  }

  console.log('🔄 Database Migration Script');
  console.log('═══════════════════════════════════════════════════════');
  console.log(`📦 Source Database: ${sourceDbName}`);
  console.log(`📦 Target Database: ${NEW_DATABASE_NAME}`);
  console.log('═══════════════════════════════════════════════════════');
  console.log('');
  console.log('⚠️  IMPORTANT: This script COPIES data (does not delete)');
  console.log('   Your old database will remain completely intact.');
  console.log('');

  let sourceClient: any = null;
  let targetClient: any = null;

  try {
    // Connect to source database
    console.log('🔌 Connecting to source database...');
    sourceClient = new MongoClient(databaseUrl);
    await sourceClient.connect();
    const sourceDb = sourceClient.db(sourceDbName);
    console.log(`✅ Connected to source database: ${sourceDbName}`);

    // Connect to target database (same cluster, different database name)
    console.log('🔌 Connecting to target database...');
    const targetDatabaseUrl = replaceDatabaseName(databaseUrl, NEW_DATABASE_NAME);
    targetClient = new MongoClient(targetDatabaseUrl);
    await targetClient.connect();
    const targetDb = targetClient.db(NEW_DATABASE_NAME);
    console.log(`✅ Connected to target database: ${NEW_DATABASE_NAME}`);
    console.log('');

    // List all collections in source database
    const allCollections = await sourceDb.listCollections().toArray();
    const collectionNames = allCollections.map((col: any) => col.name);
    console.log(`📋 Found ${collectionNames.length} collection(s) in source database:`);
    collectionNames.forEach((name: string) => console.log(`   - ${name}`));
    console.log('');

    // Copy each collection
    console.log('📦 Starting data migration...');
    console.log('');

    const results: Array<{ collection: string; success: boolean; count: number; error?: string }> = [];

    for (const collectionName of collectionNames) {
      console.log(`📄 Copying collection: ${collectionName}`);
      const result = await copyCollection(sourceDb, targetDb, collectionName);
      results.push({ collection: collectionName, ...result });

      if (result.success) {
        if (result.count > 0) {
          console.log(`   ✅ Copied ${result.count} document(s)`);
        }
      } else {
        console.log(`   ❌ Error: ${result.error}`);
      }
      console.log('');
    }

    // Verification
    console.log('🔍 Verifying migration...');
    console.log('');
    let allVerified = true;

    for (const collectionName of collectionNames) {
      console.log(`✓ Verifying: ${collectionName}`);
      const verified = await verifyMigration(sourceDb, targetDb, collectionName);
      if (!verified) {
        allVerified = false;
      }
    }

    console.log('');
    console.log('═══════════════════════════════════════════════════════');
    console.log('📊 Migration Summary');
    console.log('═══════════════════════════════════════════════════════');

    const successful = results.filter((r) => r.success);
    const failed = results.filter((r) => !r.success);
    const totalDocuments = results.reduce((sum, r) => sum + r.count, 0);

    console.log(`✅ Successful: ${successful.length}/${results.length} collections`);
    console.log(`❌ Failed: ${failed.length}/${results.length} collections`);
    console.log(`📄 Total documents copied: ${totalDocuments}`);
    console.log(`✓ Verification: ${allVerified ? 'PASSED' : 'FAILED'}`);

    if (failed.length > 0) {
      console.log('');
      console.log('⚠️  Failed collections:');
      failed.forEach((r) => {
        console.log(`   - ${r.collection}: ${r.error}`);
      });
    }

    console.log('');
    console.log('═══════════════════════════════════════════════════════');
    console.log('🎉 Migration completed!');
    console.log('');
    console.log('📝 Next Steps:');
    console.log(`   1. Verify data in the new database "${NEW_DATABASE_NAME}"`);
    console.log(`   2. Update DATABASE_URL in .env to use "${NEW_DATABASE_NAME}"`);
    console.log(`   3. Restart your application`);
    console.log(`   4. Keep old database "${sourceDbName}" as backup`);
    console.log('');
    console.log('✅ Your old database remains intact and unchanged.');
  } catch (error: any) {
    console.error('');
    console.error('❌ Migration failed:', error.message || error);
    console.error('');
    console.error('⚠️  Your source database was not modified.');
    console.error('   You can safely re-run this script after fixing the issue.');
    process.exit(1);
  } finally {
    if (sourceClient) {
      await sourceClient.close();
    }
    if (targetClient) {
      await targetClient.close();
    }
  }
}

// Run migration
const oldDbName = process.argv[2];
migrateDatabase(oldDbName).catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});

