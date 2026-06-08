"use client";

import { useState } from "react";
import { useFormState, useFormStatus } from "react-dom";
import { loginAction, type LoginState } from "./actions";

const initial: LoginState = { error: "" };

export default function LoginForm({ from }: { from?: string }) {
  const [state, action] = useFormState(loginAction, initial);
  const [pw, setPw] = useState("");

  return (
    <form action={action}>
      <input type="hidden" name="from" value={from ?? "/"} />
      <input type="hidden" name="id" value="daeyoung" />

      <label className="label">비밀번호</label>
      <input
        name="password"
        type="password"
        autoComplete="current-password"
        placeholder="••••••••"
        className="input"
        value={pw}
        onChange={(e) => setPw(e.target.value)}
        required
      />

      {state.error && (
        <div
          className="meta"
          style={{
            color: "var(--danger)",
            marginTop: 10,
            fontSize: 13,
            display: "block",
          }}
        >
          {state.error}
        </div>
      )}

      <SubmitBtn disabled={!pw} />
    </form>
  );
}

function SubmitBtn({ disabled }: { disabled: boolean }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      className="btn btn-primary btn-lg"
      style={{ width: "100%", marginTop: 16 }}
      disabled={pending || disabled}
    >
      {pending ? "확인 중…" : "작업실로 들어가기"}
    </button>
  );
}
