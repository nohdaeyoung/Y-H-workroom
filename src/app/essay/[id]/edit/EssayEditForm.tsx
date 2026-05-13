"use client";

import { useState } from "react";
import Link from "next/link";
import { useFormState, useFormStatus } from "react-dom";
import { RichEditor } from "@/components/RichEditor";
import {
  deleteEssayAction,
  updateEssayAction,
  type EssayActionState,
} from "@/app/essay/actions";
import type { Essay, EssayStatus } from "@/types/domain";

const initial: EssayActionState = { error: "" };

export default function EssayEditForm({
  essay,
  authorId,
}: {
  essay: Essay;
  authorId: "Y" | "H";
}) {
  const [state, action] = useFormState(updateEssayAction, initial);
  const [title, setTitle] = useState(essay.title);
  const [content, setContent] = useState(essay.content);
  const [tagInput, setTagInput] = useState((essay.tags ?? []).join(", "));
  const [status, setStatus] = useState<EssayStatus>(essay.status);

  const cls = authorId === "Y" ? "y" : "h";

  return (
    <form action={action}>
      <input type="hidden" name="id" value={essay.id} />
      <input type="hidden" name="title" value={title} />
      <input type="hidden" name="content" value={content} />
      <input type="hidden" name="tags" value={tagInput} />
      <input type="hidden" name="status" value={status} />

      <div className="card" style={{ padding: 28 }}>
        <div className="row gap-8" style={{ marginBottom: 14 }}>
          <span className={`avatar-mini ${cls}`}>{authorId}</span>
          <span className="meta">
            {authorId === "Y" ? "대영" : "희서"}이(가) 쓴 글
          </span>
        </div>

        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="제목"
          style={{
            width: "100%",
            fontSize: 22,
            fontFamily: "var(--serif)",
            fontWeight: 600,
            border: "none",
            background: "transparent",
            padding: "8px 0",
            borderBottom: "1px solid var(--line)",
            borderRadius: 0,
            outline: "none",
          }}
        />

        <div style={{ marginTop: 16 }}>
          <RichEditor
            value={content}
            onChange={setContent}
            placeholder="본문…"
            variant="full"
            minHeight={320}
          />
        </div>

        <div
          style={{
            borderTop: "1px solid var(--line)",
            paddingTop: 20,
            marginTop: 20,
          }}
        >
          <div
            className="row gap-12"
            style={{ alignItems: "flex-start", flexWrap: "wrap" }}
          >
            <div className="flex-1" style={{ minWidth: 200 }}>
              <label className="label">태그 (콤마로 구분)</label>
              <input
                className="input"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                placeholder="일상, 비, 골목"
              />
            </div>
            <div style={{ width: 200 }}>
              <label className="label">공개 범위</label>
              <select
                className="select"
                value={status}
                onChange={(e) => setStatus(e.target.value as EssayStatus)}
              >
                <option value="published">공개</option>
                <option value="private">비공개</option>
                <option value="draft">임시저장</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {state.error && (
        <div
          className="card-flat"
          style={{
            marginTop: 16,
            padding: "10px 14px",
            background: "oklch(0.96 0.05 30)",
            color: "var(--danger)",
            border: "1px solid oklch(0.85 0.10 30)",
            fontSize: 14,
          }}
        >
          {state.error}
        </div>
      )}

      <div
        className="row-between"
        style={{ marginTop: 20, flexWrap: "wrap", gap: 8 }}
      >
        <DeleteBtn essayId={essay.id} from={`/essay`} />
        <div className="row gap-8">
          <Link href={`/essay/${essay.id}`} className="btn btn-ghost">
            취소
          </Link>
          <SubmitBtn />
        </div>
      </div>
    </form>
  );
}

function SubmitBtn() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" className="btn btn-primary" disabled={pending}>
      {pending ? "저장 중…" : "저장"}
    </button>
  );
}

function DeleteBtn({ essayId, from }: { essayId: string; from: string }) {
  return (
    <form
      action={deleteEssayAction}
      onSubmit={(e) => {
        if (!confirm("정말 삭제할까요? 되돌릴 수 없어요.")) e.preventDefault();
      }}
    >
      <input type="hidden" name="id" value={essayId} />
      <input type="hidden" name="from" value={from} />
      <button
        type="submit"
        className="btn btn-ghost"
        style={{ color: "var(--danger)" }}
      >
        🗑 삭제
      </button>
    </form>
  );
}
