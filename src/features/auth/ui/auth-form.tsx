"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

import { authClient } from "@/features/auth/auth-client";

type AuthFormProps = { mode: "login" | "signup"; returnTo: string };

export function AuthForm({ mode, returnTo }: AuthFormProps) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setError("");
    const data = new FormData(event.currentTarget);
    const email = String(data.get("email"));
    const password = String(data.get("password"));
    const result =
      mode === "signup"
        ? await authClient.signUp.email({
            email,
            password,
            name: String(data.get("name")),
          })
        : await authClient.signIn.email({ email, password });

    if (result.error) {
      setError(
        mode === "login"
          ? "이메일 또는 비밀번호를 확인해 주세요."
          : "가입할 수 없습니다. 이메일과 비밀번호를 확인해 주세요.",
      );
      setPending(false);
      return;
    }

    await fetch("/api/cart/merge", { method: "POST" });
    router.push(returnTo);
    router.refresh();
  }

  return (
    <form className="auth-form" onSubmit={submit}>
      {mode === "signup" ? (
        <label className="field">
          <span>이름</span>
          <input autoComplete="name" minLength={2} name="name" required />
        </label>
      ) : null}
      <label className="field">
        <span>이메일</span>
        <input autoComplete="email" name="email" required type="email" />
      </label>
      <label className="field">
        <span>비밀번호</span>
        <input
          autoComplete={mode === "signup" ? "new-password" : "current-password"}
          minLength={8}
          name="password"
          required
          type="password"
        />
        {mode === "signup" ? <small>8자 이상 입력해 주세요.</small> : null}
      </label>
      {error ? (
        <p className="form-error" role="alert">
          {error}
        </p>
      ) : null}
      <button className="button button-dark button-full" disabled={pending} type="submit">
        {pending ? "처리 중…" : mode === "login" ? "로그인" : "회원가입"}
      </button>
      <p className="auth-switch">
        {mode === "login" ? "처음 방문하셨나요? " : "이미 계정이 있나요? "}
        <Link
          href={`${mode === "login" ? "/signup" : "/login"}?returnTo=${encodeURIComponent(returnTo)}`}
        >
          {mode === "login" ? "회원가입" : "로그인"}
        </Link>
      </p>
    </form>
  );
}
