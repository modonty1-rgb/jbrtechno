# Prisma Monorepo Shared Schema Strategy

## 📋 Overview

This document outlines the strategy to centralize Prisma schema management in a monorepo setup, allowing both `Homepage` and `dashboard` projects to share a single Prisma schema from the `DataLayer` folder without creating duplicate package.json files or node_modules.

## 🎯 Goals

1. **Single Source of Truth**: One Prisma schema in `DataLayer/prisma/schema.prisma`
2. **Shared Generated Client**: Prisma Client generated once in a shared location
3. **No Duplication**: Avoid creating package.json files in unexpected locations
4. **Type Safety**: Consistent types across all projects
5. **Maintainability**: Easy schema updates that propagate to all projects

## 🔍 Current Situation

### Current Structure

```
JBRTECHNO/
├── DataLayer/
│   └── prisma/
│       ├── schema.prisma
│       └── seed.ts
├── Homepage/
│   ├── lib/
│   │   └── prisma.ts (imports from '@prisma/client')
│   ├── package.json (has @prisma/client & prisma)
│   └── node_modules/ (Prisma Client generated here)
└── dashboard/
    ├── lib/
    │   └── prisma.ts (imports from '@prisma/client')
    ├── package.json (has @prisma/client & prisma)
    └── node_modules/ (Prisma Client generated here)
```

### Current Problems

- Prisma Client is generated separately in each project's `node_modules/@prisma/client`
- Build script uses `--schema=../DataLayer/prisma/schema.prisma` but client still generates locally
- Potential for version mismatches between projects
- Duplicate generation increases build time

## ✅ Proposed Solution: Custom Output Path Strategy

### New Structure

```
JBRTECHNO/
├── DataLayer/
│   ├── prisma/
│   │   ├── schema.prisma (with custom output path)
│   │   └── seed.ts
│   ├── generated/
│   │   └── prisma-client/ (Generated Prisma Client - gitignored)
│   └── package.json (Optional: for Prisma scripts only)
├── Homepage/
│   ├── lib/
│   │   └── prisma.ts (imports from '../../DataLayer/generated/prisma-client')
│   ├── package.json (still has @prisma/client & prisma as dependencies)
│   └── .gitignore (updated to exclude DataLayer/generated/)
└── dashboard/
    ├── lib/
    │   └── prisma.ts (imports from '../../DataLayer/generated/prisma-client')
    └── package.json (still has @prisma/client & prisma as dependencies)
```

## 📝 Implementation Steps

### Step 1: Update Prisma Schema Configuration

**File**: `DataLayer/prisma/schema.prisma`

**Change**: Update the generator block to specify custom output path

```prisma
generator client {
  provider = "prisma-client-js"
  output   = "../generated/prisma-client"  // NEW: Custom output path
}

datasource db {
  provider = "mongodb"
  url      = env("DATABASE_URL")
}
```

**Why**: This tells Prisma to generate the client code in `DataLayer/generated/prisma-client/` instead of the default `node_modules/@prisma/client/`.

---

### Step 2: Create DataLayer package.json (Optional but Recommended)

**File**: `DataLayer/package.json` (NEW FILE)

```json
{
  "name": "@jbrtechno/datalayer",
  "version": "1.0.0",
  "private": true,
  "scripts": {
    "prisma:generate": "prisma generate --schema=./prisma/schema.prisma",
    "prisma:migrate": "prisma migrate dev --schema=./prisma/schema.prisma",
    "prisma:studio": "prisma studio --schema=./prisma/schema.prisma",
    "prisma:format": "prisma format --schema=./prisma/schema.prisma",
    "prisma:validate": "prisma validate --schema=./prisma/schema.prisma"
  },
  "dependencies": {
    "@prisma/client": "^6.18.0"
  },
  "devDependencies": {
    "prisma": "^6.18.0"
  }
}
```

**Important Notes**:

- This package.json is **ONLY for scripts** (prisma generate, migrate, etc.)
- With pnpm workspace, dependencies will be hoisted to root `node_modules`
- **NO node_modules folder will be created in DataLayer** if workspace is configured correctly
- This file just provides convenient scripts to manage Prisma from DataLayer

---

### Step 3: Update Homepage Build Script

**File**: `Homepage/package.json`

**Change**: Update the build script

**Before**:

```json
"build": "prisma generate --schema=../DataLayer/prisma/schema.prisma && next build"
```

**After**:

```json
"build": "prisma generate --schema=../DataLayer/prisma/schema.prisma && next build",
"prisma:generate": "prisma generate --schema=../DataLayer/prisma/schema.prisma"
```

**Why**: Separate prisma:generate script for clarity, build script still works the same.

**Note**: Dependencies (`@prisma/client` and `prisma`) remain in `Homepage/package.json` - they're still needed for TypeScript types and the Prisma CLI.

---

### Step 4: Update Homepage Prisma Client Import

**File**: `Homepage/lib/prisma.ts`

**Change**: Update the import path

**Before**:

```typescript
import { PrismaClient } from '@prisma/client';
```

**After**:

```typescript
import { PrismaClient } from '../../DataLayer/generated/prisma-client';
```

**Rest of the file stays the same**:

```typescript
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}
```

---

### Step 5: Update Dashboard (Same Pattern)

**File**: `dashboard/lib/prisma.ts`

**Change**: Same import path update

```typescript
import { PrismaClient } from '../../DataLayer/generated/prisma-client';
// ... rest stays the same
```

**File**: `dashboard/package.json`

**Change**: Same build script update (if it exists)

---

### Step 6: Update .gitignore Files

**File**: `Homepage/.gitignore`

**Add**:

```gitignore
# DataLayer generated Prisma Client (shared)
../DataLayer/generated/
```

**OR** create/update root `.gitignore`:

**File**: `JBRTECHNO/.gitignore` (or update existing)

```gitignore
# Prisma generated client
DataLayer/generated/
```

**Why**: The generated Prisma Client code should not be committed (it's generated code, similar to node_modules).

---

### Step 7: Update All Script Files Using PrismaClient

**Files to check and update**:

- `Homepage/scripts/*.ts` files that import `@prisma/client`
- Any other files importing PrismaClient

**Search for**: `import { PrismaClient } from '@prisma/client';`

**Change to**: `import { PrismaClient } from '../../DataLayer/generated/prisma-client';`

**Files likely affected**:

- `Homepage/scripts/fix-database-data.ts`
- `Homepage/scripts/migrate-*.ts`
- `Homepage/scripts/seed-*.ts`
- Any other scripts in `Homepage/scripts/`

---

### Step 8: Create Generated Folder Structure (Optional)

**Action**: Create `DataLayer/generated/.gitkeep` file

**Why**: To ensure the folder exists in git (the generated files will be ignored, but the folder structure is tracked).

**Content**: Empty file or with a comment:

```
# This folder contains generated Prisma Client code
# Generated files are gitignored, but folder structure is tracked
```

---

## 🔄 Migration Process

### Phase 1: Preparation (No Breaking Changes)

1. Update `DataLayer/prisma/schema.prisma` with custom output path
2. Create `DataLayer/package.json` (if using)
3. Update `.gitignore` files
4. Create `DataLayer/generated/` folder structure

### Phase 2: Generation (Test)

1. Run `cd DataLayer && pnpm prisma:generate` (or `npx prisma generate --schema=./prisma/schema.prisma`)
2. Verify `DataLayer/generated/prisma-client/` is created
3. Verify no errors in generation

### Phase 3: Update Imports (Breaking Changes)

1. Update `Homepage/lib/prisma.ts`
2. Update all scripts in `Homepage/scripts/`
3. Update `dashboard/lib/prisma.ts` (if exists)
4. Test that imports work correctly

### Phase 4: Cleanup (Optional)

1. Remove old generated clients from `node_modules/@prisma/client` (they'll be regenerated if needed)
2. Verify builds work correctly
3. Test both Homepage and dashboard projects

---

## ✅ Verification Checklist

After implementation, verify:

- [ ] `DataLayer/generated/prisma-client/` folder exists after running `prisma generate`
- [ ] `Homepage/lib/prisma.ts` imports from `../../DataLayer/generated/prisma-client`
- [ ] `dashboard/lib/prisma.ts` imports from `../../DataLayer/generated/prisma-client`
- [ ] All scripts using PrismaClient have updated imports
- [ ] `Homepage` build works: `cd Homepage && pnpm build`
- [ ] `dashboard` build works: `cd dashboard && pnpm build`
- [ ] No TypeScript errors related to PrismaClient imports
- [ ] Runtime works: Both projects can connect to database
- [ ] `.gitignore` properly excludes `DataLayer/generated/`
- [ ] No `node_modules` created in `DataLayer/` (if using pnpm workspace)

---

## 📊 Expected Benefits

1. **Single Generation**: Prisma Client generated once, used everywhere
2. **Faster Builds**: No duplicate generation in each project
3. **Type Consistency**: All projects use the exact same types
4. **Easier Maintenance**: Schema changes propagate automatically
5. **Cleaner Structure**: Clear separation of concerns
6. **No Package Pollution**: DataLayer doesn't need its own node_modules

---

## ⚠️ Important Notes

### Why Dependencies Still Needed in Homepage/Dashboard

Even though Prisma Client is generated in DataLayer, both projects still need:

- `@prisma/client` in dependencies (for TypeScript type definitions and runtime)
- `prisma` in devDependencies (for Prisma CLI commands)

**However**, the generated client code will come from `DataLayer/generated/prisma-client/` instead of `node_modules/@prisma/client/`.

### About DataLayer package.json

- **It's optional** - You can generate from Homepage/dashboard scripts instead
- **It's for convenience** - Makes it easy to run Prisma commands from DataLayer
- **Won't create node_modules** - With pnpm workspace, dependencies hoist to root
- **No harm if exists** - It's just metadata for scripts

### TypeScript Path Resolution

TypeScript needs to be able to resolve the import path. The relative path `../../DataLayer/generated/prisma-client` should work, but if you have issues, you can add path aliases in `tsconfig.json`:

```json
{
  "compilerOptions": {
    "paths": {
      "@prisma/client": ["../DataLayer/generated/prisma-client"]
    }
  }
}
```

**However**, this is usually not necessary - relative paths work fine.

---

## 🚨 Potential Issues & Solutions

### Issue 1: TypeScript Cannot Find Module

**Symptom**: `Cannot find module '../../DataLayer/generated/prisma-client'`

**Solution**:

1. Make sure `prisma generate` has been run first
2. Check that the path is correct relative to the file
3. Add path alias in tsconfig.json if needed (see above)

### Issue 2: Build Fails in CI/CD

**Symptom**: Build fails because generated client doesn't exist

**Solution**:

1. Ensure build script runs `prisma generate` before `next build`
2. Verify `.gitignore` doesn't accidentally ignore necessary files
3. Consider committing generated types (but not recommended)

### Issue 3: Multiple Prisma Clients

**Symptom**: Still seeing Prisma Client in node_modules/@prisma/client

**Solution**:

- This is normal - the package still exists for types
- The actual client code is in DataLayer/generated/prisma-client
- You can safely ignore node_modules/@prisma/client (it's just a stub)

### Issue 4: Workspace Dependency Hoisting

**Symptom**: Confusion about where dependencies actually are

**Solution**:

- With pnpm workspace, dependencies hoist to root node_modules
- This is expected and correct behavior
- DataLayer package.json dependencies will be in root node_modules, not DataLayer/node_modules

---

## 📚 References

- [Prisma Monorepo Guide](https://www.prisma.io/docs/guides/turborepo)
- [Prisma Generator Output](https://www.prisma.io/docs/orm/reference/prisma-schema-reference#output)
- [pnpm Workspaces](https://pnpm.io/workspaces)

---

## 🎯 Summary

This strategy centralizes Prisma schema management by:

1. **Configuring custom output path** in schema.prisma
2. **Generating client once** in DataLayer/generated/prisma-client
3. **Importing from shared location** in both projects
4. **Maintaining dependencies** in each project (for types/CLI)
5. **Using workspace hoisting** (no DataLayer node_modules)

**Result**: Clean, maintainable monorepo setup with single source of truth for database schema, following Prisma's official best practices.

---

**Document Version**: 1.0  
**Last Updated**: 2025-01-XX  
**Status**: Ready for Implementation Review
