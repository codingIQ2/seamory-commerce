import "server-only";

import { PrismaPg } from "@prisma/adapter-pg";

import { PrismaClient } from "@/generated/prisma/client";
import { getDatabaseEnv } from "@/server/env";

const globalForPrisma = globalThis as unknown as {
  hukupukuDb?: PrismaClient;
};

export function getDb(): PrismaClient {
  if (globalForPrisma.hukupukuDb) {
    return globalForPrisma.hukupukuDb;
  }

  const adapter = new PrismaPg({
    connectionString: getDatabaseEnv().DATABASE_URL,
  });
  const client = new PrismaClient({ adapter });

  if (process.env.NODE_ENV !== "production") {
    globalForPrisma.hukupukuDb = client;
  }

  return client;
}
