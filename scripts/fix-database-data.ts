/**
 * Fix Database Data Issues Script
 * 
 * Fixes data integrity issues in the database:
 * - Cost records with null `name` fields
 * - SourceOfIncome records with null `name` fields
 * 
 * Usage:
 *   tsx scripts/fix-database-data.ts
 */

if (!process.env.DATABASE_URL) {
  try {
    require('dotenv').config();
  } catch {
    // dotenv not available, that's okay
  }
}

import { PrismaClient } from '@prisma/client';
import { MongoClient } from 'mongodb';

const prisma = new PrismaClient();

// Get MongoDB connection string from Prisma
const getMongoClient = async () => {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    throw new Error('DATABASE_URL is not set');
  }
  const client = new MongoClient(databaseUrl);
  await client.connect();
  return client;
};

async function fixDatabaseData() {
  console.log('🔧 Starting database data fix...\n');

  let fixedCosts = 0;
  let deletedCosts = 0;
  let fixedSources = 0;
  let deletedSources = 0;

  const mongoClient = await getMongoClient();
  const db = mongoClient.db();

  try {
    // Fix Cost records with null name using MongoDB native query
    console.log('📊 Checking Cost records...');
    const costsCollection = db.collection('Cost');
    const costsWithNullName = await costsCollection.find({ name: null }).toArray();

    if (costsWithNullName && costsWithNullName.length > 0) {
      console.log(`   Found ${costsWithNullName.length} Cost records with null name`);

      for (const cost of costsWithNullName) {
        const costId = cost._id;

        // Try to generate a name from description or use a default
        const costType = cost.type || 'FIXED';
        let dateStr = '';
        try {
          const date = new Date(cost.date);
          if (!isNaN(date.getTime())) {
            dateStr = ` - ${date.toISOString().split('T')[0]}`;
          }
        } catch (e) {
          // Invalid date, ignore
        }
        const newName = cost.description
          ? cost.description.substring(0, 50)
          : `Cost ${costType}${dateStr}`;

        // If amount is 0 and no description, likely invalid - delete it
        if (cost.amount === 0 && !cost.description) {
          await costsCollection.deleteOne({ _id: costId });
          deletedCosts++;
          console.log(`   ❌ Deleted invalid Cost record: ${costId.toString()}`);
        } else {
          // Use MongoDB update directly to avoid Prisma validation issues
          await costsCollection.updateOne(
            { _id: costId },
            { $set: { name: newName } }
          );
          fixedCosts++;
          console.log(`   ✅ Fixed Cost record: ${costId.toString()} -> "${newName}"`);
        }
      }
    } else {
      console.log('   ✅ No Cost records with null name found');
    }

    // Fix Cost records with null type
    console.log('\n🔧 Checking Cost records for null type...');
    const costsWithNullType = await costsCollection.find({ type: null }).toArray();
    if (costsWithNullType && costsWithNullType.length > 0) {
      console.log(`   Found ${costsWithNullType.length} Cost records with null type`);
      for (const cost of costsWithNullType) {
        await costsCollection.updateOne(
          { _id: cost._id },
          { $set: { type: 'FIXED' } }
        );
        console.log(`   ✅ Fixed Cost type: ${cost._id.toString()} -> FIXED`);
      }
    }

    // Fix Cost records with null date
    console.log('\n📅 Checking Cost records for null date...');
    const costsWithNullDate = await costsCollection.find({ date: null }).toArray();
    if (costsWithNullDate && costsWithNullDate.length > 0) {
      console.log(`   Found ${costsWithNullDate.length} Cost records with null date`);
      for (const cost of costsWithNullDate) {
        // Use createdAt as fallback, or current date
        const fallbackDate = cost.createdAt || new Date();
        await costsCollection.updateOne(
          { _id: cost._id },
          { $set: { date: fallbackDate } }
        );
        console.log(`   ✅ Fixed Cost date: ${cost._id.toString()} -> ${fallbackDate.toISOString()}`);
      }
    } else {
      console.log('   ✅ No Cost records with null date found');
    }

    // Fix SourceOfIncome records with null name using MongoDB native query
    console.log('\n💰 Checking SourceOfIncome records...');
    const sourcesCollection = db.collection('SourceOfIncome');
    const sourcesWithNullName = await sourcesCollection.find({ name: null }).toArray();

    if (sourcesWithNullName && sourcesWithNullName.length > 0) {
      console.log(`   Found ${sourcesWithNullName.length} SourceOfIncome records with null name`);

      for (const source of sourcesWithNullName) {
        const sourceId = source._id;

        // Try to generate a name from description or use a default
        const sourceType = source.type || 'SUBSCRIPTION';
        let dateStr = '';
        try {
          const date = new Date(source.date);
          if (!isNaN(date.getTime())) {
            dateStr = ` - ${date.toISOString().split('T')[0]}`;
          }
        } catch (e) {
          // Invalid date, ignore
        }
        const newName = source.description
          ? source.description.substring(0, 50)
          : `Source ${sourceType}${dateStr}`;

        // If amount is 0 and no description, likely invalid - delete it
        if (source.amount === 0 && !source.description) {
          await sourcesCollection.deleteOne({ _id: sourceId });
          deletedSources++;
          console.log(`   ❌ Deleted invalid SourceOfIncome record: ${sourceId.toString()}`);
        } else {
          // Use MongoDB update directly to avoid Prisma validation issues
          await sourcesCollection.updateOne(
            { _id: sourceId },
            { $set: { name: newName } }
          );
          fixedSources++;
          console.log(`   ✅ Fixed SourceOfIncome record: ${sourceId.toString()} -> "${newName}"`);
        }
      }
    } else {
      console.log('   ✅ No SourceOfIncome records with null name found');
    }

    // Fix SourceOfIncome records with null amount
    console.log('\n💰 Checking SourceOfIncome records for null amount...');
    const sourcesWithNullAmount = await sourcesCollection.find({ amount: null }).toArray();
    if (sourcesWithNullAmount && sourcesWithNullAmount.length > 0) {
      console.log(`   Found ${sourcesWithNullAmount.length} SourceOfIncome records with null amount`);
      for (const source of sourcesWithNullAmount) {
        // If amount is null and no description, likely invalid - delete it
        if (!source.description) {
          await sourcesCollection.deleteOne({ _id: source._id });
          deletedSources++;
          console.log(`   ❌ Deleted invalid SourceOfIncome record: ${source._id.toString()}`);
        } else {
          // Set amount to 0 as default
          await sourcesCollection.updateOne(
            { _id: source._id },
            { $set: { amount: 0 } }
          );
          fixedSources++;
          console.log(`   ✅ Fixed SourceOfIncome amount: ${source._id.toString()} -> 0`);
        }
      }
    } else {
      console.log('   ✅ No SourceOfIncome records with null amount found');
    }

    // Fix SourceOfIncome records with null date
    console.log('\n📅 Checking SourceOfIncome records for null date...');
    const sourcesWithNullDate = await sourcesCollection.find({ date: null }).toArray();
    if (sourcesWithNullDate && sourcesWithNullDate.length > 0) {
      console.log(`   Found ${sourcesWithNullDate.length} SourceOfIncome records with null date`);
      for (const source of sourcesWithNullDate) {
        // Use createdAt as fallback, or current date
        const fallbackDate = source.createdAt || new Date();
        await sourcesCollection.updateOne(
          { _id: source._id },
          { $set: { date: fallbackDate } }
        );
        console.log(`   ✅ Fixed SourceOfIncome date: ${source._id.toString()} -> ${fallbackDate.toISOString()}`);
      }
    } else {
      console.log('   ✅ No SourceOfIncome records with null date found');
    }

    // Summary
    console.log('\n📋 Summary:');
    console.log(`   Cost records fixed: ${fixedCosts}`);
    console.log(`   Cost records deleted: ${deletedCosts}`);
    console.log(`   SourceOfIncome records fixed: ${fixedSources}`);
    console.log(`   SourceOfIncome records deleted: ${deletedSources}`);

    if (fixedCosts === 0 && deletedCosts === 0 && fixedSources === 0 && deletedSources === 0) {
      console.log('\n✅ No issues found! Database is clean.');
    } else {
      console.log('\n✅ Database data fix completed!');
    }

  } catch (error) {
    console.error('❌ Error fixing database data:', error);
    throw error;
  } finally {
    await mongoClient.close();
    await prisma.$disconnect();
  }
}

fixDatabaseData()
  .then(() => {
    console.log('\n✨ Script completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 Script failed:', error);
    process.exit(1);
  });




