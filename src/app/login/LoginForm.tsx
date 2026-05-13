"use client";

import { useFormState, useFormStatus } from "react-dom";
import { loginAction, type LoginState } from "./actions";

const initial: LoginState = { error: "" };

export default function LoginForm({ from }: { from?: string }) {
  const [state, action] = useFormState(loginAction, initial);

  return (
    <form action={action} className="space-y-4">
      <input type="hidden" name="from" value={from ?? "/"} />

      <div>
        <label htmlFor="id" className="block text-xs text-ink-soft mb-1.5 tracking-wide">
          아이디
        </label>
        <input
          id="id"
          name="id"
          type="text"
          autoComplete="username"
          placeholder="Y 또는 H"
          required
          className="w-full px-3 py-2 rounded border border-line bg-paper focus:outline-none focus:border-ink/40 text-sm"
        />
      </div>

      <div>
        <label htmlFor="password" className="block text-xs text-ink-soft mb-1.5 tracking-wide">
          비밀번호
        </label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          placeholder="••••••••"
          required
          className="w-full px-3 py-2 rounded border border-line bg-paper focus:outline-none focus:border-ink/40 text-sm"
        />
      </div>

      {state.error && (
        <p className="text-sm text-red-700 bg-red-50 border border-red-200 rounded px-3 py-2">
          {state.error}
        </p>
      )}

      <SubmitButton />
    </form>
  );
}

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="btn w-full py-2.5 disabled:opacity-50"
    >
      {pending ? "확인 중…" : "로그인"}
    </button>
  );
}
