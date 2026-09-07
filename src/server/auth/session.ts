import "server-only";

import { headers } from "next/headers";

import { auth } from "@/server/auth/config";

export async function getCurrentSession() {
  return auth.api.getSession({ headers: await headers() });
}

export function safeReturnTo(value?: string | null) {
  return value && value.startsWith("/") && !value.startsWith("//") ? value : "/";
}
