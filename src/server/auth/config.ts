import "server-only";

import { prismaAdapter } from "better-auth/adapters/prisma";
import { betterAuth } from "better-auth";

import { getDb } from "@/server/db/client";
import { getAuthEnv } from "@/server/env";

const authEnv = getAuthEnv();

export const auth = betterAuth({
  appName: "HUKUPUKU",
  baseURL: authEnv.BETTER_AUTH_URL,
  secret: authEnv.BETTER_AUTH_SECRET,
  database: prismaAdapter(getDb(), {
    provider: "postgresql",
  }),
  emailAndPassword: {
    enabled: true,
  },
  user: {
    additionalFields: {
      role: {
        type: ["MEMBER", "ADMIN"],
        required: false,
        defaultValue: "MEMBER",
        input: false,
      },
    },
  },
  advanced: {
    database: {
      generateId: "uuid",
      joins: true,
    },
  },
});
