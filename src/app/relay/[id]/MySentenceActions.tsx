"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  deleteSentenceAction,
  updateSentenceAction,
} from "@/app/relay/actions";

type Props = {
  relayId: string;
  sentenceId: string;
  initialText: string;
};

/**
 * 본인이 작성한 마지막 문장에만 노출되는 인라인 수정/삭제 UI.
 * 다음 사람 문장이 추가되면 더 이상 노출되지 않음 (부모 페이지에서 조건부 렌더).
 */
export default function MySentenceActions({
  relayId,
  sentenceId,
  initialText,
}: Props) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [text, setText] = useState(initialText);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  async function save() {
    setBusy(true);
    setMsg(null);
    const fd = new FormData();
    fd.append("relayId", relayId);
    fd.append("sentenceId", sentenceId);
    fd.append("text", text);
    const res = await updateSentenceAction({ error: "" }, fd);
    setBusy(false);
    if (res.error) {
      setMsg(res.error);
      return;
    }
    setEditing(false);
    setMsg(null);
    router.refresh();
  }

  async function remove() {
    if (!confirm("내 문장을 삭제할까요? (본인 마지막 문장은 단독 삭제 가능)")) return;
    setBusy(true);
    setMsg(null);
    const fd = new FormData();
    fd.append("relayId", relayId);
    fd.append("sentenceId", sentenceId);
    const res = await deleteSentenceAction({ error: "" }, fd);
    setBusy(false);
    if (res.error) {
      setMsg(res.error);
      return;
    }
    router.refresh();
  }

  if (editing) {
    return (
      <div
        style={{
          marginTop: 10,
          padding: 10,
          background: "var(--paper-2)",
          border: "1px solid var(--line)",
          borderRadius: "var(--r-sm)",
        }}
      >
        <textarea
          className="textarea"
          rows={2}
          value={text}
          onChange={(e) => setText(e.target.value)}
          maxLength={200}
          autoFocus
        />
        <div className="row-between" style={{ marginTop: 8, gap: 6 }}>
          <span className="meta" style={{ fontSize: 11 }}>
            {text.length}/200
          </span>
          <div className="row gap-6">
            <button
              type="button"
              className="btn btn-ghost btn-sm"
              onClick={() => {
                setEditing(false);
                setText(initialText);
                setMsg(null);
              }}
              disabled={busy}
              style={{ fontSize: 12 }}
            >
              취소
            </button>
            <button
              type="button"
              className="btn btn-primary btn-sm"
              onClick={save}
              disabled={busy || !text.trim() || text === initialText}
              style={{ fontSize: 12 }}
            >
              {busy ? "저장 중…" : "저장"}
            </button>
          </div>
        </div>
        {msg && (
          <div
            className="meta"
            style={{ marginTop: 6, color: "var(--danger)", fontSize: 11 }}
          >
            {msg}
          </div>
        )}
      </div>
    );
  }

  return (
    <div
      className="row gap-6"
      style={{ marginTop: 8, justifyContent: "flex-end", fontSize: 11 }}
    >
      <button
        type="button"
        className="btn btn-ghost btn-sm"
        onClick={() => setEditing(true)}
        disabled={busy}
        style={{ fontSize: 12 }}
      >
        ✎ 수정
      </button>
      <button
        type="button"
        className="btn btn-ghost btn-sm"
        onClick={remove}
        disabled={busy}
        style={{ fontSize: 12, color: "var(--danger)" }}
      >
        🗑 삭제
      </button>
      {msg && (
        <span className="meta" style={{ color: "var(--danger)", fontSize: 11 }}>
          {msg}
        </span>
      )}
    </div>
  );
}
