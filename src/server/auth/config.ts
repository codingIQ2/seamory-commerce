import "server-only";

import { prismaAdapter } from "better-auth/adapters/prisma";
import { betterAuth } from "better-auth";

import { getDb } from "@/server/db/client";
import { getAuthEnv } from "@/server/env";

const authEnv = getAuthEnv();
const authAttemptLimit = process.env.NODE_ENV === "production" ? 5 : 100;

export const auth = betterAuth({
  appName: "HUKUPUKU",
  baseURL: authEnv.BETTER_AUTH_URL,
  secret: authEnv.BETTER_AUTH_SECRET,
  database: prismaAdapter(getDb(), {
    provider: "postgresql",
  }),
  emailAndPassword: {
    enabled: true,
    minPasswordLength: 10,
  },
  rateLimit: {
    enabled: true,
    window: 60,
    max: 60,
    customRules: {
      "/sign-in/email": { window: 60, max: authAttemptLimit },
      "/sign-up/email": { window: 60, max: authAttemptLimit },
    },
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
