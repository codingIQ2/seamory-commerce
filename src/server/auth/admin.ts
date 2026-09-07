import "server-only";

import { redirect } from "next/navigation";

import { UserRole } from "@/generated/prisma/client";
import { getCurrentSession } from "@/server/auth/session";
import { getDb } from "@/server/db/client";

export class AdminAuthorizationError extends Error {
  constructor() {
    super("관리자 권한이 필요합니다.");
  }
}

export async function getCurrentAdmin() {
  const session = await getCurrentSession();
  if (!session) return null;
  return getDb().user.findFirst({
    where: { id: session.user.id, role: UserRole.ADMIN },
    select: { id: true, name: true, email: true, role: true },
  });
}

export async function requireAdmin() {
  const session = await getCurrentSession();
  if (!session) redirect("/login?returnTo=%2Fadmin%2Fproducts");
  const admin = await getDb().user.findFirst({
    where: { id: session.user.id, role: UserRole.ADMIN },
    select: { id: true, name: true, email: true, role: true },
  });
  if (!admin) redirect("/forbidden");
  return admin;
}

export async function assertAdmin() {
  const admin = await getCurrentAdmin();
  if (!admin) throw new AdminAuthorizationError();
  return admin;
}
