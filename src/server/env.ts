import "server-only";

import { z } from "zod";

const databaseEnvSchema = z.object({
  DATABASE_URL: z.string().url().startsWith("postgresql://"),
});

const authEnvSchema = databaseEnvSchema.extend({
  BETTER_AUTH_SECRET: z.string().min(32),
  BETTER_AUTH_URL: z.string().url(),
});

export function getDatabaseEnv() {
  return databaseEnvSchema.parse(process.env);
}

export function getAuthEnv() {
  return authEnvSchema.parse(process.env);
}
