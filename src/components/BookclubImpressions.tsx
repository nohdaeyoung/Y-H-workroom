"use client";

import { useEffect, useState } from "react";
import { useFormState, useFormStatus } from "react-dom";
import parse from "html-react-parser";
import { sanitizeRichHtml } from "@/lib/sanitize";
import { RichEditor } from "./RichEditor";
import {
  deleteImpressionAction,
  saveImpressionAction,
  type BookclubActionState,
} from "@/app/bookclub/actions";
import type { BookclubImpression } from "@/types/domain";

const initial: BookclubActionState = { error: "" };

function formatDate(ts: number) {
  const d = new Date(ts);
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, "0")}.${String(d.getDate()).padStart(2, "0")}`;
}

function sanitize(html: string) {
  return sanitizeRichHtml(html);
}

function Pane({
  bookclubId,
  author,
  impression,
  viewer,
}: {
  bookclubId: string;
  author: "Y" | "H";
  impression: BookclubImpression | null;
  viewer: "Y" | "H" | null;
}) {
  const cls = author === "Y" ? "y" : "h";
  const name = author === "Y" ? "Y" : "H";
  const deep = author === "Y" ? "var(--y-deep)" : "var(--h-deep)";

  const isMe = viewer === author;
  const [editing, setEditing] = useState(false);

  return (
    <div className={`split-pane ${cls}-pane impression-pane-${cls}`}>
      <div className="row gap-8" style={{ marginBottom: 16 }}>
        <span className={`avatar-mini ${cls}`}>{author}</span>
        <div>
          <div style={{ fontSize: 13, fontWeight: 500, color: deep }}>{name}</div>
          {impression && (
            <div className="hand" style={{ fontSize: 15, color: "var(--ink-4)" }}>
              {formatDate(impression.writtenAt)} 작성
            </div>
          )}
        </div>
        {isMe && impression && !editing && (
          <button
            type="button"
            className="btn btn-ghost btn-sm"
            onClick={() => setEditing(true)}
            style={{ marginLeft: "auto" }}
          >
            ✎ 수정
          </button>
        )}
      </div>

      {editing && isMe ? (
        <ImpressionForm
          bookclubId={bookclubId}
          impression={impression}
          onDone={() => setEditing(false)}
        />
      ) : impression ? (
        <>
          <h3
            className="serif"
            style={{ fontSize: 22, marginBottom: 14, lineHeight: 1.4 }}
          >
            {impression.title}
          </h3>
          <div
            className="prose"
            style={{ maxHeight: 420, overflowY: "auto", paddingRight: 6, fontSize: 16 }}
          >
            {parse(sanitize(impression.content))}
          </div>
        </>
      ) : isMe ? (
        <ImpressionForm bookclubId={bookclubId} impression={null} onDone={() => {}} />
      ) : (
        <div
          style={{
            padding: "60px 12px",
            textAlign: "center",
            background: "oklch(0.97 0.015 80 / 0.5)",
            borderRadius: "var(--r-md)",
            border: "1px dashed var(--line)",
          }}
        >
          <div style={{ fontSize: 32, opacity: 0.4 }}>⏳</div>
          <div className="hand" style={{ fontSize: 22, color: "var(--ink-3)", marginTop: 8 }}>
            아직 쓰지 않았어요
          </div>
          <div className="meta" style={{ marginTop: 8 }}>
            {name}을(를) 기다리고 있어요
          </div>
        </div>
      )}
    </div>
  );
}

function ImpressionForm({
  bookclubId,
  impression,
  onDone,
}: {
  bookclubId: string;
  impression: BookclubImpression | null;
  onDone: () => void;
}) {
  const [state, action] = useFormState(saveImpressionAction, initial);
  const [title, setTitle] = useState(impression?.title ?? "");
  const [content, setContent] = useState(impression?.content ?? "");

  useEffect(() => {
    if (state.ok) onDone();
  }, [state.ok, onDone]);

  return (
    <form action={action}>
      <input type="hidden" name="id" value={bookclubId} />
      <input type="hidden" name="content" value={content} />
      <label className="label">제목</label>
      <input
        className="input"
        name="title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="이 책을 읽고…"
        maxLength={200}
        required
      />
      <label className="label" style={{ marginTop: 12 }}>
        본문
      </label>
      <RichEditor
        value={content}
        onChange={setContent}
        placeholder="이 책에 대한 소감을 적어주세요…"
        variant="full"
        minHeight={200}
      />
      {state.error && (
        <div className="meta" style={{ color: "var(--danger)", marginTop: 8, fontSize: 13 }}>
          {state.error}
        </div>
      )}
      <div className="row-between" style={{ marginTop: 14, flexWrap: "wrap", gap: 8 }}>
        {impression && (
          <button
            type="button"
            className="btn btn-ghost btn-sm"
            style={{ color: "var(--danger)" }}
            onClick={async () => {
              if (!confirm("내 소감을 삭제할까요?")) return;
              const fd = new FormData();
              fd.append("id", bookclubId);
              await deleteImpressionAction(fd);
              onDone();
            }}
          >
            🗑 삭제
          </button>
        )}
        <div className="row gap-8" style={{ marginLeft: "auto" }}>
          <button type="button" className="btn btn-ghost btn-sm" onClick={onDone}>
            취소
          </button>
          <SaveBtn />
        </div>
      </div>
    </form>
  );
}

function SaveBtn() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" className="btn btn-primary btn-sm" disabled={pending}>
      {pending ? "저장 중…" : "저장"}
    </button>
  );
}

export default function BookclubImpressions({
  bookclubId,
  yImpression,
  hImpression: _hImpression,
  viewer,
}: {
  bookclubId: string;
  yImpression: BookclubImpression | null;
  hImpression: BookclubImpression | null;
  viewer: "Y" | "H" | null;
}) {
  return (
    <div>
      <Pane
        bookclubId={bookclubId}
        author="Y"
        impression={yImpression}
        viewer={viewer}
      />
    </div>
  );
}
