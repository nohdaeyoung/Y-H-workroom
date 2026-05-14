"use client";

import { useEffect, useState } from "react";
import parse from "html-react-parser";
import { sanitizeRichHtml } from "@/lib/sanitize";
import type { Comment } from "@/types/domain";
import { RichEditor } from "@/components/RichEditor";

type Props = {
  parentType: Comment["parentType"];
  parentId: string;
  isYH: boolean;
};

function formatTime(ts: number) {
  const d = new Date(ts);
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  const hh = String(d.getHours()).padStart(2, "0");
  const mm = String(d.getMinutes()).padStart(2, "0");
  return `${m}/${day} ${hh}:${mm}`;
}

function sanitize(html: string) {
  return sanitizeRichHtml(html);
}

function stripHtml(html: string) {
  return html.replace(/<[^>]+>/g, "").trim();
}

export default function Comments({ parentType, parentId, isYH }: Props) {
  const [items, setItems] = useState<Comment[] | null>(null);
  const [open, setOpen] = useState(false);
  const [nickname, setNickname] = useState("");
  const [text, setText] = useState("");
  const [secret, setSecret] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editorKey, setEditorKey] = useState(0);

  async function load() {
    const res = await fetch(
      `/api/comments?parentType=${parentType}&parentId=${encodeURIComponent(parentId)}`,
      { cache: "no-store" }
    );
    if (res.ok) {
      const data = await res.json();
      setItems(data.comments);
    } else {
      setItems([]);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [parentType, parentId]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!nickname.trim() || !stripHtml(text)) {
      setError("닉네임과 내용을 적어주세요");
      return;
    }
    setSubmitting(true);
    setError(null);

    const res = await fetch("/api/comments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ parentType, parentId, nickname, text, secret }),
    });

    if (res.ok) {
      const data = await res.json();
      setItems((prev) => [...(prev ?? []), data.comment]);
      setText("");
      setSecret(false);
      setEditorKey((k) => k + 1);
    } else {
      const data = await res.json().catch(() => ({}));
      setError(data.error || "댓글 저장에 실패했어요");
    }
    setSubmitting(false);
  }

  const count = items?.length ?? 0;

  return (
    <div
      style={{
        marginTop: 24,
        paddingTop: 20,
        borderTop: "1px dashed var(--line)",
      }}
    >
      <div className="row-between" style={{ marginBottom: 12 }}>
        <div className="section-title" style={{ fontSize: 15 }}>
          💬 댓글{" "}
          <span style={{ color: "var(--ink-3)", fontWeight: 400 }}>{count}</span>
        </div>
        <button
          type="button"
          className="btn btn-ghost btn-sm"
          onClick={() => setOpen(!open)}
        >
          {open ? "접기" : "쓰기"}
        </button>
      </div>

      {open && (
        <form
          onSubmit={submit}
          className="card-flat fade-in"
          style={{
            padding: 14,
            background: "var(--paper)",
            border: "1px solid var(--line)",
            marginBottom: 16,
          }}
        >
          <div className="row gap-8" style={{ marginBottom: 8, flexWrap: "wrap" }}>
            <input
              className="input"
              placeholder="닉네임"
              maxLength={20}
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              style={{ maxWidth: 160 }}
            />
            {isYH && (
              <label
                className="meta"
                style={{ marginLeft: "auto", cursor: "pointer" }}
              >
                <input
                  type="checkbox"
                  checked={secret}
                  onChange={(e) => setSecret(e.target.checked)}
                />
                &nbsp;비밀 댓글
              </label>
            )}
          </div>

          <RichEditor
            key={editorKey}
            value={text}
            onChange={setText}
            placeholder="댓글을 남겨주세요…"
            variant="compact"
            minHeight={90}
          />

          {error && (
            <div className="meta" style={{ color: "var(--danger)", marginTop: 6 }}>
              {error}
            </div>
          )}

          <div
            className="row"
            style={{ justifyContent: "flex-end", marginTop: 10, gap: 8 }}
          >
            <button
              type="button"
              className="btn btn-ghost btn-sm"
              onClick={() => setOpen(false)}
            >
              취소
            </button>
            <button
              type="submit"
              className="btn btn-primary btn-sm"
              disabled={submitting}
            >
              {submitting ? "남기는 중…" : "남기기"}
            </button>
          </div>
        </form>
      )}

      {items === null ? (
        <div className="meta" style={{ padding: "12px 4px" }}>
          불러오는 중…
        </div>
      ) : items.length === 0 ? (
        <div
          className="hand"
          style={{
            textAlign: "center",
            color: "var(--ink-4)",
            fontSize: 17,
            padding: "16px 0",
          }}
        >
          첫 댓글을 남겨주세요
        </div>
      ) : (
        <ul className="col gap-12" style={{ marginTop: 4 }}>
          {items.map((c) => (
            <li
              key={c.id}
              style={{
                padding: "10px 14px",
                background: c.secret ? "var(--y-soft)" : "var(--paper)",
                borderRadius: "var(--r-md)",
                border: "1px solid var(--line)",
              }}
            >
              <div className="row-between" style={{ marginBottom: 4 }}>
                <span style={{ fontSize: 13, fontWeight: 500 }}>
                  {c.nickname}
                  {c.secret && (
                    <span
                      className="hand"
                      style={{
                        marginLeft: 6,
                        color: "var(--y-deep)",
                        fontSize: 14,
                      }}
                    >
                      🔒 비밀
                    </span>
                  )}
                </span>
                <span className="meta">{formatTime(c.createdAt)}</span>
              </div>
              <div
                className="serif"
                style={{ fontSize: 14, color: "var(--ink-2)", lineHeight: 1.7 }}
              >
                {parse(sanitize(c.text))}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
