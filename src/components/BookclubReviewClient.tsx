"use client";

import { useState } from "react";
import { useFormState, useFormStatus } from "react-dom";
import {
  saveTranscriptAction,
  type BookclubActionState,
} from "@/app/bookclub/actions";
import type { BookclubTranscriptLine } from "@/types/domain";

const initial: BookclubActionState = { error: "" };

export default function BookclubReviewClient({
  bookclubId,
  initialTranscript,
}: {
  bookclubId: string;
  initialTranscript: BookclubTranscriptLine[];
}) {
  const [lines, setLines] = useState<BookclubTranscriptLine[]>(
    initialTranscript.length > 0 ? initialTranscript : [{ speaker: "Y", text: "" }]
  );
  const [state, action] = useFormState(saveTranscriptAction, initial);

  function update(i: number, patch: Partial<BookclubTranscriptLine>) {
    setLines((prev) => prev.map((l, idx) => (idx === i ? { ...l, ...patch } : l)));
  }
  function addLine() {
    const lastSpeaker = lines[lines.length - 1]?.speaker ?? "Y";
    const next = lastSpeaker === "Y" ? "H" : "Y";
    setLines((prev) => [...prev, { speaker: next, text: "" }]);
  }
  function removeLine(i: number) {
    setLines((prev) => prev.filter((_, idx) => idx !== i));
  }
  function moveUp(i: number) {
    if (i === 0) return;
    setLines((prev) => {
      const arr = [...prev];
      [arr[i - 1], arr[i]] = [arr[i], arr[i - 1]];
      return arr;
    });
  }

  return (
    <form action={action}>
      <input type="hidden" name="id" value={bookclubId} />
      <input
        type="hidden"
        name="transcript"
        value={JSON.stringify(lines.filter((l) => l.text.trim()))}
      />

      <div className="col gap-8" style={{ marginBottom: 16 }}>
        {lines.map((line, i) => {
          const cls = line.speaker === "Y" ? "y" : "h";
          return (
            <div
              key={i}
              className="card-flat"
              style={{
                padding: 12,
                background: "var(--paper-2)",
                border: "1px solid var(--line)",
              }}
            >
              <div className="row gap-8" style={{ marginBottom: 8, flexWrap: "wrap" }}>
                <div
                  className="row gap-4"
                  style={{
                    padding: 2,
                    background: "var(--paper-ink)",
                    borderRadius: "var(--r-md)",
                  }}
                >
                  <button
                    type="button"
                    className={`btn btn-sm ${line.speaker === "Y" ? "btn-y" : "btn-ghost"}`}
                    style={{ padding: "4px 10px" }}
                    onClick={() => update(i, { speaker: "Y" })}
                  >
                    Y
                  </button>
                  <button
                    type="button"
                    className={`btn btn-sm ${line.speaker === "H" ? "btn-h" : "btn-ghost"}`}
                    style={{ padding: "4px 10px" }}
                    onClick={() => update(i, { speaker: "H" })}
                  >
                    H
                  </button>
                </div>
                <span className={`avatar-mini ${cls}`}>
                  {line.speaker}
                </span>
                <div style={{ marginLeft: "auto" }} className="row gap-4">
                  <button
                    type="button"
                    className="btn btn-ghost btn-sm"
                    onClick={() => moveUp(i)}
                    disabled={i === 0}
                    title="위로"
                  >
                    ↑
                  </button>
                  <button
                    type="button"
                    className="btn btn-ghost btn-sm"
                    onClick={() => removeLine(i)}
                    disabled={lines.length === 1}
                    style={{ color: "var(--danger)" }}
                    title="삭제"
                  >
                    ✕
                  </button>
                </div>
              </div>
              <textarea
                className="textarea"
                rows={2}
                value={line.text}
                onChange={(e) => update(i, { text: e.target.value })}
                placeholder="대화 내용을 적어주세요…"
              />
            </div>
          );
        })}
      </div>

      <button
        type="button"
        className="btn"
        onClick={addLine}
        style={{ width: "100%", marginBottom: 16 }}
      >
        ＋ 라인 추가
      </button>

      {state.error && (
        <div
          className="meta"
          style={{ color: "var(--danger)", marginBottom: 10, fontSize: 13 }}
        >
          {state.error}
        </div>
      )}
      {state.ok && (
        <div
          className="meta"
          style={{ color: "var(--success)", marginBottom: 10, fontSize: 13 }}
        >
          ✓ 저장됨
        </div>
      )}

      <div className="row" style={{ justifyContent: "flex-end" }}>
        <SaveBtn />
      </div>
    </form>
  );
}

function SaveBtn() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" className="btn btn-primary" disabled={pending}>
      {pending ? "저장 중…" : "transcript 저장"}
    </button>
  );
}
