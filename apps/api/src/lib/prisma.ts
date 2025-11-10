// apps/api/src/lib/prisma.ts
import { PrismaClient } from "@prisma/client";

declare global {
  // prevent multiple instances in dev
  var _prisma?: PrismaClient;
}

export const prisma = global._prisma ?? new PrismaClient();

if (process.env.NODE_ENV === "development") global._prisma = prisma;
