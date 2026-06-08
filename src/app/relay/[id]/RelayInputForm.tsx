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
  void author;
  const [state, action] = useFormState(appendSentenceAction, initial);
  const [text, setText] = useState("");
  const [skipAi, setSkipAi] = useState(false);

  useEffect(() => {
    if (state.ok) setText("");
  }, [state.ok]);

  return (
    <form
      className="card"
      style={{ marginTop: 24, borderColor: "var(--y-line)" }}
      action={action}
    >
      <input type="hidden" name="relayId" value={relayId} />
      {skipAi && <input type="hidden" name="skipAi" value="on" />}
      <div className="row gap-8" style={{ marginBottom: 12 }}>
        <div>
          <div style={{ fontSize: 14, fontWeight: 500 }}>다음 문장 쓰기</div>
          <div className="meta" style={{ fontSize: 12 }}>
            {skipAi
              ? "AI 응답 없이 이 문장만 저장"
              : "저장 후 AI가 다음 한 문장을 이어 적어요"}
          </div>
        </div>
        <span className="meta" style={{ marginLeft: "auto" }}>
          {text.length}/200
        </span>
      </div>
      <textarea
        className="textarea"
        placeholder="한 문장을 적어주세요…"
        maxLength={200}
        disabled={blocked}
        rows={3}
        name="text"
        value={text}
        onChange={(e) => setText(e.target.value)}
      />
      <div className="row-between" style={{ marginTop: 12, flexWrap: "wrap", gap: 8 }}>
        <div className="row gap-12" style={{ flexWrap: "wrap" }}>
          <label
            className="meta"
            style={{ display: "flex", gap: 6, alignItems: "center", fontSize: 12 }}
          >
            <input type="checkbox" name="agreeComplete" disabled={blocked} /> 이 문장으로 완결
          </label>
          <label
            className="meta"
            style={{ display: "flex", gap: 6, alignItems: "center", fontSize: 12 }}
          >
            <input
              type="checkbox"
              checked={skipAi}
              onChange={(e) => setSkipAi(e.target.checked)}
              disabled={blocked}
            />{" "}
            AI 응답 안 받기
          </label>
        </div>
        <SubmitBtn blocked={blocked || !text.trim()} skipAi={skipAi} />
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

function SubmitBtn({
  blocked,
  skipAi,
}: {
  blocked: boolean;
  skipAi: boolean;
}) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      className="btn btn-primary"
      disabled={pending || blocked}
    >
      {pending
        ? skipAi
          ? "저장 중…"
          : "쓰는 중 (AI 응답 대기)…"
        : skipAi
        ? "이 문장만 저장"
        : "이어쓰기 → AI"}
    </button>
  );
}
