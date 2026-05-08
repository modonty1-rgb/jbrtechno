/**
 * Migrate Category tree from key-based parentKey to parentId, and backfill Transaction.categoryId.
 *
 * Run:
 *   pnpm tsx scripts/migrate-category-hierarchy.ts
 */
/* eslint-disable no-console */

if (!process.env.DATABASE_URL) {
  try {
    require('dotenv').config();
  } catch {
    // optional
  }
}

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const ALLOWED_TYPES = ['EXPENSE', 'REVENUE'] as const;

function isJsonObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function getFirstBatch(value: unknown): unknown[] {
  if (!isJsonObject(value)) return [];
  const cursor = value.cursor;
  if (!isJsonObject(cursor)) return [];
  const firstBatch = cursor.firstBatch;
  return Array.isArray(firstBatch) ? firstBatch : [];
}

async function normalizeCategoryType() {
  console.log('1) Normalizing Category.type...');

  await prisma.$runCommandRaw({
    update: 'Category',
    updates: [
      {
        q: {
          $or: [
            { type: { $exists: false } },
            { type: { $nin: [...ALLOWED_TYPES] } },
          ],
        },
        u: { $set: { type: 'EXPENSE' } },
        multi: true,
      },
    ],
  });
}

async function backfillParentId() {
  console.log('2) Backfilling Category.parentId from parentKey...');

  const result = await prisma.$runCommandRaw({
    aggregate: 'Category',
    pipeline: [
      { $project: { _id: 1, key: 1, parentKey: 1 } },
      { $addFields: { id: { $toString: '$_id' } } },
      { $project: { _id: 0, id: 1, key: 1, parentKey: 1 } },
    ],
    cursor: {},
  });

  const rows = getFirstBatch(result)
    .map((row) => (isJsonObject(row) ? row : null))
    .filter((row): row is Record<string, unknown> => row !== null)
    .map((row) => ({
      id: typeof row.id === 'string' ? row.id : '',
      key: typeof row.key === 'string' ? row.key : undefined,
      parentKey:
        typeof row.parentKey === 'string' ? row.parentKey : row.parentKey === null ? null : undefined,
    }))
    .filter((row) => row.id.length > 0);

  const keyToId = new Map<string, string>();
  for (const row of rows) {
    if (row?.key && row?.id) keyToId.set(row.key, row.id);
  }

  let updated = 0;
  for (const row of rows) {
    const childKey = row?.key;
    const parentKey = row?.parentKey ?? null;
    if (!childKey || !parentKey) continue;

    const parentId = keyToId.get(parentKey);
    if (!parentId) continue;

    await prisma.$runCommandRaw({
      update: 'Category',
      updates: [
        {
          q: { key: childKey },
          u: [{ $set: { parentId: { $toObjectId: parentId } } }],
          multi: true,
        },
      ],
    });
    updated += 1;
  }

  console.log(`   Updated parentId for ${updated} categories.`);
}

async function backfillTransactionCategoryId() {
  console.log('3) Backfilling Transaction.categoryId from Transaction.category...');

  const categoriesResult = await prisma.$runCommandRaw({
    aggregate: 'Category',
    pipeline: [
      { $project: { _id: 1, key: 1 } },
      { $addFields: { id: { $toString: '$_id' } } },
      { $project: { _id: 0, id: 1, key: 1 } },
    ],
    cursor: {},
  });

  const categoryRows = getFirstBatch(categoriesResult)
    .map((row) => (isJsonObject(row) ? row : null))
    .filter((row): row is Record<string, unknown> => row !== null)
    .map((row) => ({
      id: typeof row.id === 'string' ? row.id : '',
      key: typeof row.key === 'string' ? row.key : '',
    }))
    .filter((row) => row.id.length > 0 && row.key.length > 0);

  const keyToId = new Map<string, string>();
  for (const row of categoryRows) keyToId.set(row.key, row.id);

  const txResult = await prisma.$runCommandRaw({
    aggregate: 'Transaction',
    pipeline: [
      {
        $match: {
          category: { $type: 'string', $ne: '' },
          $or: [{ categoryId: null }, { categoryId: { $exists: false } }],
        },
      },
      { $addFields: { id: { $toString: '$_id' } } },
      { $project: { _id: 0, id: 1, category: 1 } },
    ],
    cursor: {},
  });

  const txRows = getFirstBatch(txResult)
    .map((row) => (isJsonObject(row) ? row : null))
    .filter((row): row is Record<string, unknown> => row !== null)
    .map((row) => ({
      id: typeof row.id === 'string' ? row.id : '',
      category: typeof row.category === 'string' ? row.category : '',
    }))
    .filter((row) => row.id.length > 0 && row.category.length > 0);

  let updated = 0;
  for (const tx of txRows) {
    const categoryId = keyToId.get(tx.category);
    if (!categoryId) continue;

    await prisma.$runCommandRaw({
      update: 'Transaction',
      updates: [
        {
          q: { _id: { $oid: tx.id } },
          u: [{ $set: { categoryId: { $toObjectId: categoryId } } }],
          multi: false,
        },
      ],
    });

    updated += 1;
  }

  console.log(`   Updated categoryId for ${updated} transactions.`);
}

async function main() {
  console.log('Starting Category migration...');
  await normalizeCategoryType();
  await backfillParentId();
  await backfillTransactionCategoryId();
  console.log('Done.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });


