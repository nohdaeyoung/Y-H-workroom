"use client";

import { useEffect, useState } from "react";
import parse from "html-react-parser";
import DOMPurify from "isomorphic-dompurify";
import type { Comment } from "@/types/domain";
import { RichEditor } from "@/components/RichEditor";

type Props = {
  parentType: Comment["parentType"];
  parentId: string;
  isYH: boolean;
};

function formatTime(ts: number) {
  const d = new Date(ts);
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  const hh = String(d.getHours()).padStart(2, "0");
  const mm = String(d.getMinutes()).padStart(2, "0");
  return `${month}/${day} ${hh}:${mm}`;
}

function sanitize(html: string) {
  return DOMPurify.sanitize(html, { USE_PROFILES: { html: true } });
}

function stripHtml(html: string) {
  return html.replace(/<[^>]+>/g, "").trim();
}

export default function Comments({ parentType, parentId, isYH }: Props) {
  const [items, setItems] = useState<Comment[] | null>(null);
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
      // Force editor remount to clear content
      setEditorKey((k) => k + 1);
    } else {
      const data = await res.json().catch(() => ({}));
      setError(data.error || "댓글 저장에 실패했어요");
    }
    setSubmitting(false);
  }

  return (
    <section className="mt-12 pt-8 border-t border-line">
      <div className="text-xs tracking-[0.25em] text-ink-soft text-center mb-6">
        ── 💬 댓글 ──
      </div>

      <ul className="space-y-3 mb-8">
        {items === null && (
          <li className="text-sm text-ink-soft text-center py-4">
            불러오는 중…
          </li>
        )}
        {items?.length === 0 && (
          <li className="text-sm text-ink-soft text-center py-4">
            첫 댓글을 남겨주세요
          </li>
        )}
        {items?.map((c) => (
          <li
            key={c.id}
            className={`px-4 py-3 rounded-md border border-line ${
              c.secret ? "bg-y-bg/40" : "bg-paper-dark"
            }`}
          >
            <div className="flex justify-between items-baseline mb-1">
              <span className="text-sm font-medium">
                {c.nickname}
                {c.secret && <span className="ml-2 text-xs text-y">🔒 비밀</span>}
              </span>
              <span className="text-xs text-ink-soft">
                {formatTime(c.createdAt)}
              </span>
            </div>
            <div className="text-sm prose-serif">
              {parse(sanitize(c.text))}
            </div>
          </li>
        ))}
      </ul>

      <form onSubmit={submit} className="space-y-3">
        <div className="flex gap-2">
          <input
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
            placeholder="닉네임"
            maxLength={20}
            className="px-3 py-2 rounded border border-line bg-paper text-sm focus:outline-none focus:border-ink/40 w-32"
          />
          {isYH && (
            <label className="flex items-center gap-1.5 text-xs text-ink-soft">
              <input
                type="checkbox"
                checked={secret}
                onChange={(e) => setSecret(e.target.checked)}
              />
              비밀 댓글
            </label>
          )}
        </div>
        <RichEditor
          key={editorKey}
          value={text}
          onChange={setText}
          placeholder="댓글을 남겨주세요"
          variant="compact"
          minHeight={100}
        />
        {error && <p className="text-sm text-red-700">{error}</p>}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={submitting}
            className="btn disabled:opacity-50"
          >
            {submitting ? "남기는 중…" : "댓글 남기기"}
          </button>
        </div>
      </form>
    </section>
  );
}
