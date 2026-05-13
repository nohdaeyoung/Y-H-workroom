"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { RichEditor } from "@/components/RichEditor";

type Props = {
  authorId: "Y" | "H";
  displayName: string;
};

type PubMode = "public" | "private" | "draft";

export default function WriteForm({ authorId, displayName }: Props) {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [tagInput, setTagInput] = useState("");
  const [pub, setPub] = useState<PubMode>("public");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const cls = authorId === "Y" ? "y" : "h";

  async function submit() {
    if (!title.trim()) {
      setError("제목을 적어주세요");
      return;
    }
    setSubmitting(true);
    setError(null);

    const tags = tagInput
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);

    const status =
      pub === "public" ? "published" : pub === "draft" ? "draft" : "private";

    const res = await fetch("/api/essays", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: title.trim(), content, tags, status }),
    });

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error || "저장 중 문제가 생겼어요");
      setSubmitting(false);
      return;
    }

    const data = await res.json();
    router.push(`/essay/${data.essay.id}`);
  }

  return (
    <div className="container narrow fade-in" style={{ maxWidth: 760 }}>
      <div className="row-between" style={{ marginBottom: 24 }}>
        <div>
          <div className="hand" style={{ fontSize: 20, color: "var(--ink-3)" }}>
            new essay
          </div>
          <h1 className="page-title" style={{ fontSize: 26 }}>
            새 에세이
          </h1>
        </div>
        <div className="row gap-8">
          <span className={`avatar-mini ${cls}`}>{authorId}</span>
          <span className="hand" style={{ fontSize: 17, color: "var(--ink-3)" }}>
            {displayName}으로 쓰기
          </span>
        </div>
      </div>

      <div className="card" style={{ padding: 28 }}>
        <input
          className="input"
          style={{
            fontSize: 22,
            fontFamily: "var(--serif)",
            fontWeight: 600,
            border: "none",
            background: "transparent",
            padding: "8px 0",
            borderBottom: "1px solid var(--line)",
            borderRadius: 0,
          }}
          placeholder="제목"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />

        <div style={{ marginTop: 16 }}>
          <RichEditor
            value={content}
            onChange={setContent}
            placeholder="비가 오는 날이면…"
            variant="full"
            minHeight={320}
          />
        </div>

        <div
          style={{ borderTop: "1px solid var(--line)", paddingTop: 20, marginTop: 20 }}
        >
          <div className="row gap-12" style={{ alignItems: "flex-start" }}>
            <div className="flex-1">
              <label className="label">태그 (콤마로 구분)</label>
              <input
                className="input"
                placeholder="일상, 비, 골목"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
              />
            </div>
            <div style={{ width: 200 }}>
              <label className="label">공개 범위</label>
              <select
                className="select"
                value={pub}
                onChange={(e) => setPub(e.target.value as PubMode)}
              >
                <option value="public">공개</option>
                <option value="private">비공개</option>
                <option value="draft">임시저장</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {error && (
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
          {error}
        </div>
      )}

      <div className="row-between" style={{ marginTop: 20 }}>
        <Link href="/essay" className="btn btn-ghost">
          취소
        </Link>
        <div className="row gap-8">
          <button
            type="button"
            className="btn"
            disabled={submitting}
            onClick={() => {
              setPub("draft");
              submit();
            }}
          >
            임시저장
          </button>
          <button
            type="button"
            className="btn btn-primary"
            disabled={submitting}
            onClick={submit}
          >
            {submitting ? "저장 중…" : "발행하기"}
          </button>
        </div>
      </div>
    </div>
  );
}
