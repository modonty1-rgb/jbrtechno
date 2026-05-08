/**
 * Seed Salary category and its subcategories (2 levels).
 *
 * Creates:
 * - Parent: "Salary" (type: EXPENSE, parentId: null)
 * - Children: "<title> - <name>" where name = filledByEn ?? filledByAr ?? "غير محدد"
 *
 * Run:
 *   pnpm tsx scripts/seed-salary-staff-categories.ts
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

interface StaffRole {
  title: string;
  filledByEn?: string | null;
  filledByAr?: string | null;
}

const ceoRole: StaffRole = {
  title: 'Chief Executive Officer',
  filledByEn: 'CEO',
  filledByAr: 'الرئيس التنفيذي',
};

const leadershipRoles: StaffRole[] = [];
const opsHrFinanceRoles: StaffRole[] = [];
const techRoles: StaffRole[] = [];
const marketingTeamRoles: StaffRole[] = [];

const prisma = new PrismaClient();

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

async function findSalaryRootId(): Promise<string | null> {
  const result = await prisma.$runCommandRaw({
    aggregate: 'Category',
    pipeline: [
      {
        $match: {
          type: 'EXPENSE',
          label: 'Salary',
          $or: [{ parentId: null }, { parentId: { $exists: false } }],
        },
      },
      { $addFields: { id: { $toString: '$_id' } } },
      { $project: { _id: 0, id: 1 } },
      { $limit: 1 },
    ],
    cursor: {},
  });

  const first = getFirstBatch(result)[0];
  if (!isJsonObject(first)) return null;
  return typeof first.id === 'string' ? first.id : null;
}

async function getExistingChildLabels(parentId: string): Promise<Set<string>> {
  const result = await prisma.$runCommandRaw({
    aggregate: 'Category',
    pipeline: [
      { $match: { type: 'EXPENSE', parentId: { $oid: parentId } } },
      { $project: { _id: 0, label: 1 } },
    ],
    cursor: {},
  });

  const labels = new Set<string>();
  for (const row of getFirstBatch(result)) {
    if (!isJsonObject(row)) continue;
    if (typeof row.label === 'string' && row.label.trim()) labels.add(row.label.trim());
  }
  return labels;
}

function roleLabel(title: string, name: string) {
  const safeTitle = title.trim();
  const safeName = (name || 'غير محدد').trim() || 'غير محدد';
  return `${safeTitle} - ${safeName}`.trim();
}

async function main() {
  console.log('Seeding Salary categories (2 levels)...');

  let salaryId = await findSalaryRootId();
  if (!salaryId) {
    const created = await prisma.category.create({
      data: {
        label: 'Salary',
        type: 'EXPENSE',
        parentId: null,
        order: 0,
      },
      select: { id: true },
    });
    salaryId = created.id;
    console.log(`Created Salary parent: ${salaryId}`);
  } else {
    console.log(`Salary parent exists: ${salaryId}`);
  }

  const roles = [
    ceoRole,
    ...leadershipRoles,
    ...opsHrFinanceRoles,
    ...techRoles,
    ...marketingTeamRoles,
  ];

  const desiredLabels = new Set<string>();
  for (const r of roles) {
    const name = r.filledByEn ?? r.filledByAr ?? 'غير محدد';
    desiredLabels.add(roleLabel(r.title, name));
  }

  if (!salaryId) {
    console.error('Failed to create or find Salary parent category');
    return;
  }

  const existingLabels = await getExistingChildLabels(salaryId);

  let createdCount = 0;
  let skippedCount = 0;

  for (const label of desiredLabels) {
    if (existingLabels.has(label)) {
      skippedCount += 1;
      continue;
    }

    await prisma.category.create({
      data: {
        label,
        type: 'EXPENSE',
        parentId: salaryId,
        order: 0,
      },
    });
    createdCount += 1;
  }

  console.log(`Done. created=${createdCount}, skipped=${skippedCount}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });


