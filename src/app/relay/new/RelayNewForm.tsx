"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useFormState, useFormStatus } from "react-dom";
import {
  generateFirstSentenceAction,
  startRelayAction,
  type FirstSentenceState,
  type RelayActionState,
} from "@/app/relay/actions";

const firstInitial: FirstSentenceState = { error: "" };
const startInitial: RelayActionState = { error: "" };

type Props = {
  author: "Y" | "H";
  displayName: string;
};

export default function RelayNewForm({ author, displayName }: Props) {
  void author;
  void displayName;

  const [title, setTitle] = useState("");
  const [mode, setMode] = useState<"choose" | "manual">("choose");
  const [manualFirst, setManualFirst] = useState("");
  const [aiDraft, setAiDraft] = useState<string | null>(null);

  const [firstState, firstAction] = useFormState(
    generateFirstSentenceAction,
    firstInitial
  );
  const [startState, startAction] = useFormState(startRelayAction, startInitial);

  useEffect(() => {
    if (firstState.ok && firstState.text) {
      setAiDraft(firstState.text);
    }
  }, [firstState.ok, firstState.text]);

  const canRequestAi = title.trim().length > 0;
  const hasDraft = !!aiDraft;
  const firstFinal = mode === "manual" ? manualFirst.trim() : (aiDraft ?? "");

  return (
    <div>
      {/* 제목 */}
      <div className="card" style={{ marginBottom: 20 }}>
        <label className="label">제목</label>
        <input
          className="input"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="비가 오는 날이면"
          maxLength={100}
        />
      </div>

      {mode === "choose" && (
        <>
          {/* AI 미리보기 */}
          <form action={firstAction} style={{ marginBottom: 14 }}>
            <input type="hidden" name="title" value={title} />
            <input type="hidden" name="rejectedDraft" value={aiDraft ?? ""} />
            <AiButton
              hasDraft={hasDraft}
              disabled={!canRequestAi}
            />
            {firstState.error && (
              <div
                className="meta"
                style={{
                  color: "var(--danger)",
                  marginTop: 8,
                  fontSize: 13,
                }}
              >
                {firstState.error}
              </div>
            )}
          </form>

          {hasDraft && (
            <div
              className="card"
              style={{
                marginBottom: 14,
                background:
                  "linear-gradient(180deg, oklch(0.96 0.025 250) 0%, var(--paper-2) 60%)",
                borderColor: "oklch(0.85 0.04 250)",
              }}
            >
              <div className="row gap-8" style={{ marginBottom: 8 }}>
                <span
                  className="chip"
                  style={{
                    background: "oklch(0.55 0.13 250)",
                    color: "white",
                    borderColor: "oklch(0.55 0.13 250)",
                    fontSize: 11,
                  }}
                >
                  ✨ AI
                </span>
                <span className="meta">첫 문장 미리보기</span>
              </div>
              <div
                className="serif"
                style={{
                  fontSize: 16.5,
                  lineHeight: 1.85,
                  whiteSpace: "pre-wrap",
                  color: "var(--ink)",
                }}
              >
                {aiDraft}
              </div>
            </div>
          )}

          <div className="row gap-8" style={{ flexWrap: "wrap" }}>
            <button
              type="button"
              className="btn btn-ghost btn-sm"
              onClick={() => {
                setMode("manual");
                if (aiDraft) setManualFirst(aiDraft);
              }}
            >
              ✎ 첫 문장 직접 쓰기
            </button>
          </div>
        </>
      )}

      {mode === "manual" && (
        <div className="card" style={{ marginBottom: 14 }}>
          <div className="row-between" style={{ marginBottom: 6 }}>
            <label className="label" style={{ marginBottom: 0 }}>
              첫 문장 (직접 적기, 200자 이내)
            </label>
            <span className="meta">{manualFirst.length}/200</span>
          </div>
          <textarea
            className="textarea"
            rows={3}
            maxLength={200}
            value={manualFirst}
            onChange={(e) => setManualFirst(e.target.value)}
            placeholder="비가 오는 날이면 항상 그 골목이 생각난다."
          />
          <div className="row gap-8" style={{ marginTop: 10 }}>
            <button
              type="button"
              className="btn btn-ghost btn-sm"
              onClick={() => setMode("choose")}
            >
              ← AI 미리보기로
            </button>
          </div>
        </div>
      )}

      <div
        className="row gap-8"
        style={{
          marginTop: 14,
          padding: "10px 12px",
          background: "var(--paper-ink)",
          borderRadius: "var(--r-md)",
        }}
      >
        <span className="meta">
          한 문장씩 적으면 AI가 다음 문장을 이어 적습니다.
        </span>
      </div>

      <form action={startAction}>
        <input type="hidden" name="title" value={title} />
        <input type="hidden" name="first" value={firstFinal} />
        <input
          type="hidden"
          name="firstSource"
          value={mode === "manual" ? "" : "ai"}
        />
        {startState.error && (
          <div
            className="meta"
            style={{ color: "var(--danger)", marginTop: 10, fontSize: 13 }}
          >
            {startState.error}
          </div>
        )}
        <div className="row-between" style={{ marginTop: 18 }}>
          <Link href="/relay" className="btn btn-ghost">
            취소
          </Link>
          <StartBtn disabled={!title.trim() || !firstFinal} />
        </div>
      </form>
    </div>
  );
}

function AiButton({
  hasDraft,
  disabled,
}: {
  hasDraft: boolean;
  disabled: boolean;
}) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      className="btn"
      style={{ width: "100%" }}
      disabled={disabled || pending}
    >
      {pending ? "AI가 쓰는 중…" : hasDraft ? "↻ 다른 첫 문장으로" : "✨ AI에게 첫 문장 받기"}
    </button>
  );
}

function StartBtn({ disabled }: { disabled: boolean }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      className="btn btn-primary"
      disabled={pending || disabled}
    >
      {pending ? "시작하는 중…" : "이어쓰기 시작"}
    </button>
  );
}
