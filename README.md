# Prisma Client Restructuring Plan for Campuscheers

## Objective
Unify Prisma client generation and usage between the `server` and `app` directories to fix login and user flow issues caused by split Prisma client instances.

## Implementation Steps

1. **Backup Current State**
   - Commit all current changes to version control to ensure a safe rollback point.

2. **Move Prisma Schema to Root**
   - The `prisma/` directory does not currently exist in the root.
   - Move the `server/prisma/` directory to the root as `prisma/`.
   - This makes the schema accessible to both `server` and `app` directories.

3. **Update Package.json Scripts**
   - Centralize Prisma client generation commands in the root `package.json`.
   - Example:
     ```json
     "prisma:generate": "prisma generate --schema=./prisma/schema.prisma",
     "prisma:migrate": "prisma migrate dev --schema=./prisma/schema.prisma"
     ```

4. **Refactor Prisma Client Imports**
   - Generate Prisma client in the root `node_modules/@prisma/client`.
   - Update both `server/src/lib/prisma.ts` and `src/lib/prisma.ts` to import PrismaClient from `@prisma/client`.
   - Use a singleton pattern in both to avoid multiple instances in development.

5. **Adjust Environment Variables**
   - Ensure `DATABASE_URL` and other env vars are accessible in both server and app contexts.

6. **Test Incrementally**
   - After each step, run tests and verify Prisma client initializes correctly.
   - Test login and user flows to confirm fixes.

## Benefits
- Single source of truth for Prisma schema and client.
- Consistent database access and types across server and app.
- Eliminates import and generation conflicts.
- Resolves authentication flow issues.

---

This plan aligns with best practices for monorepos and multi-package projects using Prisma.

---

Proceeding with this plan will fix the broken login and user flow in Campuscheers.
