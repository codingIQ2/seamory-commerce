"use client";

import { useRouter } from "next/navigation";

import { authClient } from "@/features/auth/auth-client";

export function SignOutButton() {
  const router = useRouter();
  return (
    <button
      className="text-button"
      onClick={async () => {
        await authClient.signOut();
        router.push("/");
        router.refresh();
      }}
      type="button"
    >
      로그아웃
    </button>
  );
}
