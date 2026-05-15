"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  deleteRelayAction,
  deleteSentenceAction,
  updateRelayTitleAction,
  updateSentenceAction,
} from "@/app/relay/actions";
import type { RelayWithSentences } from "@/types/domain";

export default function RelayEditForm({
  relay,
  viewer,
}: {
  relay: RelayWithSentences;
  viewer: "Y" | "H";
}) {
  const router = useRouter();
  const [title, setTitle] = useState(relay.title);
  const [titleSaving, setTitleSaving] = useState(false);
  const [titleMsg, setTitleMsg] = useState<string | null>(null);
  const [delSaving, setDelSaving] = useState(false);
  const [delMsg, setDelMsg] = useState<string | null>(null);

  async function requestDelete() {
    if (!confirm("이어쓰기 전체 삭제를 요청할까요? 상대가 승인해야 실제로 삭제돼요.")) return;
    setDelSaving(true);
    setDelMsg(null);
    const fd = new FormData();
    fd.append("relayId", relay.id);
    const res = await deleteRelayAction(fd);
    setDelSaving(false);
    setDelMsg(res.error || "✓ 삭제 요청을 보냈어요 — 상대 승인 대기");
  }

  async function saveTitle() {
    setTitleSaving(true);
    setTitleMsg(null);
    const fd = new FormData();
    fd.append("relayId", relay.id);
    fd.append("title", title);
    const res = await updateRelayTitleAction({ error: "" }, fd);
    setTitleMsg(res.error || "✓ 제목 저장됨");
    setTitleSaving(false);
    router.refresh();
  }

  return (
    <>
      {/* 제목 편집 */}
      <div className="card" style={{ marginBottom: 20 }}>
        <label className="label">제목</label>
        <input
          className="input"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <div className="row-between" style={{ marginTop: 12 }}>
          {titleMsg && (
            <span
              className="meta"
              style={{
                color: titleMsg.startsWith("✓") ? "var(--success)" : "var(--danger)",
              }}
            >
              {titleMsg}
            </span>
          )}
          <button
            type="button"
            className="btn btn-primary btn-sm"
            onClick={saveTitle}
            disabled={titleSaving || !title.trim()}
            style={{ marginLeft: "auto" }}
          >
            {titleSaving ? "저장 중…" : "제목 저장"}
          </button>
        </div>
      </div>

      {/* 문장 편집 */}
      <h3 className="section-title" style={{ marginBottom: 12 }}>
        문장
      </h3>
      <div className="col gap-12">
        {relay.sentences.map((s, idx) => (
          <SentenceEditor
            key={s.id}
            relayId={relay.id}
            sentenceId={s.id}
            initialText={s.text}
            author={s.author}
            order={s.order}
            editable={s.author === viewer}
            isLast={idx === relay.sentences.length - 1}
          />
        ))}
      </div>

      {/* 삭제 */}
      <div
        className="card-flat"
        style={{
          marginTop: 32,
          padding: 16,
          background: "var(--paper-ink)",
          border: "1px dashed var(--line-2)",
        }}
      >
        <div className="row-between" style={{ flexWrap: "wrap", gap: 8 }}>
          <div>
            <div style={{ fontSize: 14, fontWeight: 500 }}>이어쓰기 삭제</div>
            <div className="meta">상대 동의 후 사라져요. 되돌릴 수 없음.</div>
          </div>
          <button
            type="button"
            className="btn"
            style={{ color: "var(--danger)" }}
            onClick={requestDelete}
            disabled={delSaving}
          >
            {delSaving ? "요청 보내는 중…" : "🗑 삭제 요청"}
          </button>
        </div>
        {delMsg && (
          <div
            className="meta"
            style={{
              marginTop: 10,
              color: delMsg.startsWith("✓") ? "var(--success)" : "var(--danger)",
              fontSize: 12,
            }}
          >
            {delMsg}
          </div>
        )}
      </div>

      <div className="row" style={{ marginTop: 20 }}>
        <Link href={`/relay/${relay.id}`} className="btn btn-ghost">
          ← 이어쓰기로
        </Link>
      </div>
    </>
  );
}

function SentenceEditor({
  relayId,
  sentenceId,
  initialText,
  author,
  order,
  editable,
  isLast,
}: {
  relayId: string;
  sentenceId: string;
  initialText: string;
  author: "Y" | "H";
  order: number;
  editable: boolean;
  isLast: boolean;
}) {
  const router = useRouter();
  const [text, setText] = useState(initialText);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const cls = author === "Y" ? "y" : "h";

  async function save() {
    setSaving(true);
    setMsg(null);
    const fd = new FormData();
    fd.append("relayId", relayId);
    fd.append("sentenceId", sentenceId);
    fd.append("text", text);
    const res = await updateSentenceAction({ error: "" }, fd);
    setMsg(res.error || "✓ 저장됨");
    setSaving(false);
    router.refresh();
  }

  async function deleteMine() {
    if (!confirm("이 문장만 삭제할까요? (본인 문장은 단독으로 삭제 가능)")) return;
    setDeleting(true);
    setMsg(null);
    const fd = new FormData();
    fd.append("relayId", relayId);
    fd.append("sentenceId", sentenceId);
    const res = await deleteSentenceAction({ error: "" }, fd);
    if (res.error) {
      setMsg(res.error);
      setDeleting(false);
      return;
    }
    router.refresh();
  }

  return (
    <div
      className="card-flat"
      style={{
        padding: "12px 16px",
        background: editable ? "var(--paper)" : "var(--paper-deep)",
        border: "1px solid var(--line)",
        opacity: editable ? 1 : 0.7,
      }}
    >
      <div className="row gap-8" style={{ marginBottom: 8 }}>
        <span className={`avatar-mini ${cls}`}>{author}</span>
        <span className="meta">문장 #{order + 1}</span>
        {!editable && <span className="meta">· 다른 작성자 글</span>}
        <span className="meta" style={{ marginLeft: "auto" }}>
          {text.length}/200
        </span>
      </div>
      <textarea
        className="textarea"
        rows={2}
        value={text}
        onChange={(e) => setText(e.target.value)}
        disabled={!editable}
        maxLength={200}
      />
      {editable && (
        <div className="row-between" style={{ marginTop: 10, gap: 8 }}>
          {msg && (
            <span
              className="meta"
              style={{
                color: msg.startsWith("✓")
                  ? "var(--success)"
                  : "var(--danger)",
              }}
            >
              {msg}
            </span>
          )}
          <div className="row gap-8" style={{ marginLeft: "auto" }}>
            {isLast && (
              <button
                type="button"
                className="btn btn-ghost btn-sm"
                onClick={deleteMine}
                disabled={saving || deleting}
                style={{ color: "var(--danger)" }}
                title="마지막 문장만 삭제 가능"
              >
                {deleting ? "삭제 중…" : "🗑 문장 삭제"}
              </button>
            )}
            <button
              type="button"
              className="btn btn-sm"
              onClick={save}
              disabled={saving || deleting || !text.trim() || text === initialText}
            >
              {saving ? "저장 중…" : "이 문장 저장"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
