"use client";

import { useEffect, useState } from "react";
import { useFormState, useFormStatus } from "react-dom";
import {
  appendSentenceAction,
  type RelayActionState,
} from "@/app/relay/actions";

const initial: RelayActionState = { error: "" };

export default function RelayInputForm({
  relayId,
  author,
  blocked,
}: {
  relayId: string;
  author: "Y" | "H";
  blocked: boolean;
}) {
  const [state, action] = useFormState(appendSentenceAction, initial);
  const [text, setText] = useState("");
  const name = author === "Y" ? "대영" : "희서";
  const cls = author === "Y" ? "y" : "h";
  const lineVar = author === "Y" ? "var(--y-line)" : "var(--h-line)";

  useEffect(() => {
    if (state.ok) setText("");
  }, [state.ok]);

  return (
    <form
      className="card"
      style={{ marginTop: 24, borderColor: lineVar }}
      action={action}
    >
      <input type="hidden" name="relayId" value={relayId} />
      <div className="row gap-8" style={{ marginBottom: 12 }}>
        <span className={`avatar-mini ${cls}`}>{author}</span>
        <div>
          <div style={{ fontSize: 14, fontWeight: 500 }}>
            {name}로 이어쓰기
          </div>
          {blocked && (
            <div style={{ fontSize: 12, color: "var(--danger)" }}>
              직전 문장의 작성자입니다. 상대를 기다려 주세요.
            </div>
          )}
        </div>
        <span className="meta" style={{ marginLeft: "auto" }}>
          {text.length}/200
        </span>
      </div>
      <textarea
        className="textarea"
        placeholder="한 문장을 이어 적어주세요…"
        maxLength={200}
        disabled={blocked}
        rows={3}
        name="text"
        value={text}
        onChange={(e) => setText(e.target.value)}
      />
      <div className="row-between" style={{ marginTop: 12, flexWrap: "wrap", gap: 8 }}>
        <label
          className="meta"
          style={{ display: "flex", gap: 6, alignItems: "center" }}
        >
          <input type="checkbox" name="agreeComplete" disabled={blocked} /> 이 문장으로 완결 동의
        </label>
        <SubmitBtn blocked={blocked || !text.trim()} />
      </div>
      {state.error && (
        <div
          className="meta"
          style={{ color: "var(--danger)", marginTop: 8, fontSize: 13 }}
        >
          {state.error}
        </div>
      )}
    </form>
  );
}

function SubmitBtn({ blocked }: { blocked: boolean }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      className="btn btn-primary"
      disabled={pending || blocked}
    >
      {pending ? "쓰는 중…" : "이어쓰기"}
    </button>
  );
}
