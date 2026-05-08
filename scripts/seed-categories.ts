/**
 * Seed Categories Script
 * 
 * Extracts categories from finance-data.json and creates Category records in the database.
 * 
 * Usage:
 *   pnpm seed:categories
 *   OR
 *   tsx scripts/seed-categories.ts
 */

if (!process.env.DATABASE_URL) {
  try {
    require('dotenv').config();
  } catch {
    // dotenv not available, that's okay
  }
}

import { PrismaClient, CategoryType } from '@prisma/client';

const prisma = new PrismaClient();

// Category definitions extracted from finance-data.json structure
const mainCategories: Array<{
  slug: string;
  label: string;
  type: CategoryType;
  order: number;
}> = [
  { slug: 'leadership', label: 'فريق القيادة', type: 'EXPENSE' as CategoryType, order: 1 },
  { slug: 'technical', label: 'الفريق التقني', type: 'EXPENSE' as CategoryType, order: 2 },
  { slug: 'content', label: 'فريق المحتوى', type: 'EXPENSE' as CategoryType, order: 3 },
  { slug: 'marketing-sales', label: 'التسويق والمبيعات', type: 'EXPENSE' as CategoryType, order: 4 },
  { slug: 'operations', label: 'الفريق التشغيلي', type: 'EXPENSE' as CategoryType, order: 5 },
  { slug: 'infrastructure', label: 'البنية التحتية والتقنية', type: 'EXPENSE' as CategoryType, order: 6 },
  { slug: 'overhead', label: 'المصروفات الإدارية', type: 'EXPENSE' as CategoryType, order: 7 },
  { slug: 'marketing', label: 'التسويق والإعلان', type: 'EXPENSE' as CategoryType, order: 8 },
];

const subcategories: Array<{
  slug: string;
  label: string;
  parentSlug: string;
  type: CategoryType;
  order: number;
}> = [
    // Infrastructure subcategories
    { slug: 'hosting', label: 'الاستضافة', parentSlug: 'infrastructure', type: 'EXPENSE' as CategoryType, order: 1 },
    { slug: 'database', label: 'قاعدة البيانات', parentSlug: 'infrastructure', type: 'EXPENSE' as CategoryType, order: 2 },
    { slug: 'storage', label: 'التخزين', parentSlug: 'infrastructure', type: 'EXPENSE' as CategoryType, order: 3 },
    { slug: 'seo-tools', label: 'أدوات SEO', parentSlug: 'infrastructure', type: 'EXPENSE' as CategoryType, order: 4 },
    { slug: 'analytics', label: 'التحليلات', parentSlug: 'infrastructure', type: 'EXPENSE' as CategoryType, order: 5 },
    { slug: 'development', label: 'أدوات التطوير', parentSlug: 'infrastructure', type: 'EXPENSE' as CategoryType, order: 6 },
    { slug: 'monitoring', label: 'المراقبة', parentSlug: 'infrastructure', type: 'EXPENSE' as CategoryType, order: 7 },
    { slug: 'project-management', label: 'إدارة المشاريع', parentSlug: 'infrastructure', type: 'EXPENSE' as CategoryType, order: 8 },
    { slug: 'domain', label: 'النطاق و SSL', parentSlug: 'infrastructure', type: 'EXPENSE' as CategoryType, order: 9 },
    { slug: 'email', label: 'خدمة البريد الإلكتروني', parentSlug: 'infrastructure', type: 'EXPENSE' as CategoryType, order: 10 },

    // Overhead subcategories
    { slug: 'office', label: 'إيجار المكتب', parentSlug: 'overhead', type: 'EXPENSE' as CategoryType, order: 1 },
    { slug: 'utilities', label: 'المرافق والإنترنت', parentSlug: 'overhead', type: 'EXPENSE' as CategoryType, order: 2 },
    { slug: 'legal', label: 'التأمين والقانوني', parentSlug: 'overhead', type: 'EXPENSE' as CategoryType, order: 3 },
    { slug: 'misc', label: 'مصروفات إدارية متنوعة', parentSlug: 'overhead', type: 'EXPENSE' as CategoryType, order: 4 },

    // Marketing subcategories
    { slug: 'media', label: 'الإعلانات', parentSlug: 'marketing', type: 'EXPENSE' as CategoryType, order: 1 },

    // Marketing-Sales subcategories
    { slug: 'sales', label: 'المبيعات', parentSlug: 'marketing-sales', type: 'EXPENSE' as CategoryType, order: 1 },
  ];

async function seedCategories() {
  try {
    console.log('🌱 Starting category seeding...\n');

    // Seed main categories
    console.log('Creating main categories...');
    const slugToId = new Map<string, string>();
    for (const category of mainCategories) {
      try {
        const existing = await prisma.category.findFirst({
          where: { label: category.label, type: category.type, parentId: null },
          select: { id: true },
        });

        if (existing) {
          slugToId.set(category.slug, existing.id);
          console.log(`  ⏭️  Category "${category.slug}" already exists, skipping...`);
          continue;
        }

        const created = await prisma.category.create({
          data: {
            label: category.label,
            parentId: null,
            type: category.type,
            order: category.order,
          },
        });
        slugToId.set(category.slug, created.id);

        console.log(`  ✅ Created category: ${category.slug} - ${category.label}`);
      } catch (error: unknown) {
        const message = error instanceof Error ? error.message : String(error);
        console.error(`  ❌ Error creating category "${category.slug}":`, message);
      }
    }

    console.log('\nCreating subcategories...');
    // Seed subcategories
    for (const subcategory of subcategories) {
      try {
        const parentId = slugToId.get(subcategory.parentSlug);
        if (!parentId) {
          console.error(`  ❌ Parent category "${subcategory.parentSlug}" not found for "${subcategory.slug}", skipping...`);
          continue;
        }

        const existing = await prisma.category.findFirst({
          where: { label: subcategory.label, type: subcategory.type, parentId },
          select: { id: true },
        });

        if (existing) {
          console.log(`  ⏭️  Subcategory "${subcategory.slug}" already exists, skipping...`);
          continue;
        }

        await prisma.category.create({
          data: {
            label: subcategory.label,
            parentId,
            type: subcategory.type,
            order: subcategory.order,
          },
        });

        console.log(`  ✅ Created subcategory: ${subcategory.slug} - ${subcategory.label} (parent: ${subcategory.parentSlug})`);
      } catch (error: unknown) {
        const message = error instanceof Error ? error.message : String(error);
        console.error(`  ❌ Error creating subcategory "${subcategory.slug}":`, message);
      }
    }

    console.log('\n✅ Category seeding completed successfully!');
  } catch (error) {
    console.error('\n❌ Fatal error during category seeding:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

seedCategories();

