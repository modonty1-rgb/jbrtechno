/**
 * Seed Source of Income Script
 * 
 * Extracts income sources from modonty data files and creates SourceOfIncome records in the database.
 * 
 * Usage:
 *   pnpm seed:source-of-income
 *   OR
 *   tsx scripts/seed-source-of-income.ts
 */

if (!process.env.DATABASE_URL) {
  try {
    require('dotenv').config();
  } catch {
    // dotenv not available, that's okay
  }
}

import { PrismaClient, SourceOfIncomeType } from '@prisma/client';

const prisma = new PrismaClient();

// Subscription plans from modonty-landing-content.json
const subscriptionPlans = [
  {
    name: 'بيسك',
    description: '2 مقالات شهريًا لمدة 18 شهر - 2,499 ريال سنويًا',
    type: SourceOfIncomeType.SUBSCRIPTION,
    amount: 2499,
  },
  {
    name: 'ستاندارد',
    description: '4 مقالات شهريًا لمدة 18 شهر - 3,999 ريال سنويًا',
    type: SourceOfIncomeType.SUBSCRIPTION,
    amount: 3999,
  },
  {
    name: 'برو',
    description: '8 مقالات شهريًا لمدة 18 شهر - 6,999 ريال سنويًا',
    type: SourceOfIncomeType.SUBSCRIPTION,
    amount: 6999,
  },
  {
    name: 'بريميوم',
    description: '12 مقال شهريًا لمدة 18 شهر - 9,999 ريال سنويًا',
    type: SourceOfIncomeType.SUBSCRIPTION,
    amount: 9999,
  },
];

// Add-ons - converted to ONE_TIME type
const addOns = [
  {
    name: 'إعادة استخدام المحتوى لوسائل التواصل الاجتماعي',
    description: 'تحويل المقالات إلى محتوى مناسب لوسائل التواصل الاجتماعي',
    type: SourceOfIncomeType.ONE_TIME,
    amount: 0,
  },
  {
    name: 'تكامل التسويق عبر البريد الإلكتروني',
    description: 'دمج المحتوى مع حملات التسويق عبر البريد الإلكتروني',
    type: SourceOfIncomeType.ONE_TIME,
    amount: 0,
  },
  {
    name: 'إنتاج محتوى فيديو',
    description: 'تحويل المقالات إلى محتوى فيديو احترافي',
    type: SourceOfIncomeType.ONE_TIME,
    amount: 0,
  },
  {
    name: 'تحسين قوائم المنتجات',
    description: 'تحسين وصف المنتجات وتحسين محركات البحث',
    type: SourceOfIncomeType.ONE_TIME,
    amount: 0,
  },
];

async function seedSourceOfIncome() {
  try {
    console.log('🌱 Starting source of income seeding...\n');

    // Seed subscription plans
    console.log('Creating subscription plans...');
    for (const plan of subscriptionPlans) {
      try {
        const existing = await prisma.sourceOfIncome.findFirst({
          where: { name: plan.name, type: plan.type },
        });

        if (existing) {
          console.log(`  ⏭️  Subscription plan "${plan.name}" already exists, skipping...`);
          continue;
        }

        await prisma.sourceOfIncome.create({
          data: {
            name: plan.name,
            description: plan.description,
            type: plan.type,
            amount: plan.amount,
            date: new Date(),
          },
        });

        console.log(`  ✅ Created subscription plan: ${plan.name}`);
      } catch (error: any) {
        console.error(`  ❌ Error creating subscription plan "${plan.name}":`, error.message);
      }
    }

    console.log('\nCreating add-ons...');
    // Seed add-ons
    for (const addOn of addOns) {
      try {
        const existing = await prisma.sourceOfIncome.findFirst({
          where: { name: addOn.name, type: addOn.type },
        });

        if (existing) {
          console.log(`  ⏭️  Add-on "${addOn.name}" already exists, skipping...`);
          continue;
        }

        await prisma.sourceOfIncome.create({
          data: {
            name: addOn.name,
            description: addOn.description,
            type: addOn.type,
            amount: addOn.amount,
            date: new Date(),
          },
        });

        console.log(`  ✅ Created add-on: ${addOn.name}`);
      } catch (error: any) {
        console.error(`  ❌ Error creating add-on "${addOn.name}":`, error.message);
      }
    }

    console.log('\n✅ Source of income seeding completed successfully!');
  } catch (error) {
    console.error('\n❌ Fatal error during source of income seeding:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

seedSourceOfIncome();












