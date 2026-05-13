"use client";

import { useState } from "react";
import { useFormState, useFormStatus } from "react-dom";
import { loginAction, type LoginState } from "./actions";

const initial: LoginState = { error: "" };

export default function LoginForm({ from }: { from?: string }) {
  const [state, action] = useFormState(loginAction, initial);
  const [who, setWho] = useState<"Y" | "H" | "">("");
  const [pw, setPw] = useState("");

  // who 선택 시 자동으로 login id 채움
  const loginId = who === "Y" ? "daeyoung" : who === "H" ? "heeseo" : "";

  return (
    <form action={action}>
      <input type="hidden" name="from" value={from ?? "/"} />
      <input type="hidden" name="id" value={loginId} />

      <div className="row gap-12" style={{ marginBottom: 20 }}>
        <button
          type="button"
          className={`btn flex-1 ${who === "Y" ? "btn-y" : ""}`}
          onClick={() => setWho("Y")}
        >
          <span style={{ fontSize: 16 }}>🌾</span> &nbsp;Y · 대영
        </button>
        <button
          type="button"
          className={`btn flex-1 ${who === "H" ? "btn-h" : ""}`}
          onClick={() => setWho("H")}
        >
          <span style={{ fontSize: 16 }}>🌙</span> &nbsp;H · 희서
        </button>
      </div>

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

      <SubmitBtn disabled={!who || !pw} />
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
