"use client";

import { useState } from "react";
import Link from "next/link";
import { useFormState, useFormStatus } from "react-dom";
import { startRelayAction, type RelayActionState } from "@/app/relay/actions";

const initial: RelayActionState = { error: "" };

type Props = {
  author: "Y" | "H";
  displayName: string;
};

export default function RelayNewForm({ author, displayName }: Props) {
  const [state, action] = useFormState(startRelayAction, initial);
  const [title, setTitle] = useState("");
  const [first, setFirst] = useState("");
  const cls = author === "Y" ? "y" : "h";

  return (
    <form action={action}>
      <div className="card">
        <label className="label">제목</label>
        <input
          className="input"
          name="title"
          placeholder="비가 오는 날이면"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />
        <div style={{ marginTop: 18 }}>
          <div className="row-between" style={{ marginBottom: 6 }}>
            <label className="label" style={{ marginBottom: 0 }}>
              첫 문장 (200자 이내)
            </label>
            <span className="meta">{first.length}/200</span>
          </div>
          <textarea
            className="textarea"
            name="first"
            rows={4}
            maxLength={200}
            value={first}
            onChange={(e) => setFirst(e.target.value)}
            placeholder="비가 오는 날이면 항상 그 골목이 생각난다."
            required
          />
        </div>
        <div
          className="row gap-8"
          style={{
            marginTop: 14,
            padding: "10px 12px",
            background: "var(--paper-ink)",
            borderRadius: "var(--r-md)",
          }}
        >
          <span className={`avatar-mini ${cls}`}>{author}</span>
          <span className="meta">
            {displayName}로 시작합니다. 다음 문장은 상대만 적을 수 있어요.
          </span>
        </div>
        {state.error && (
          <div
            className="meta"
            style={{ color: "var(--danger)", marginTop: 10, fontSize: 13 }}
          >
            {state.error}
          </div>
        )}
      </div>
      <div className="row-between" style={{ marginTop: 20 }}>
        <Link href="/relay" className="btn btn-ghost">
          취소
        </Link>
        <SubmitBtn disabled={!title.trim() || !first.trim()} />
      </div>
    </form>
  );
}

function SubmitBtn({ disabled }: { disabled: boolean }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      className="btn btn-primary"
      disabled={pending || disabled}
    >
      {pending ? "시작하는 중…" : "시작하기"}
    </button>
  );
}
