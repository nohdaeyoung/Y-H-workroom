"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { RichEditor } from "@/components/RichEditor";
import {
  deleteKeywordEssayAction,
  updateKeywordEssayAction,
  updateKeywordWordAction,
} from "@/app/keyword/actions";
import type { Keyword } from "@/types/domain";

export default function KeywordEditForm({
  keyword,
  viewer,
}: {
  keyword: Keyword;
  viewer: "Y" | "H";
}) {
  const router = useRouter();
  const [word, setWord] = useState(keyword.keyword);
  const [wordSaving, setWordSaving] = useState(false);
  const [wordMsg, setWordMsg] = useState<string | null>(null);

  const mine = viewer === "Y" ? keyword.yEssay : keyword.hEssay;
  const [title, setTitle] = useState(mine?.title ?? "");
  const [content, setContent] = useState(mine?.content ?? "");
  const [essaySaving, setEssaySaving] = useState(false);
  const [essayMsg, setEssayMsg] = useState<string | null>(null);

  async function saveWord() {
    setWordSaving(true);
    setWordMsg(null);
    const fd = new FormData();
    fd.append("keywordId", keyword.id);
    fd.append("keyword", word);
    const res = await updateKeywordWordAction({ error: "" }, fd);
    setWordMsg(res.error || "✓ 키워드 저장됨");
    setWordSaving(false);
    router.refresh();
  }

  async function saveEssay() {
    setEssaySaving(true);
    setEssayMsg(null);
    const fd = new FormData();
    fd.append("keywordId", keyword.id);
    fd.append("title", title);
    fd.append("content", content);
    const res = await updateKeywordEssayAction({ error: "" }, fd);
    setEssayMsg(res.error || "✓ 글 저장됨");
    setEssaySaving(false);
    router.refresh();
  }

  return (
    <>
      {/* 키워드 단어 */}
      <div className="card" style={{ marginBottom: 20 }}>
        <label className="label">키워드 단어</label>
        <input
          className="input"
          value={word}
          onChange={(e) => setWord(e.target.value)}
          maxLength={30}
        />
        <div className="row-between" style={{ marginTop: 12 }}>
          {wordMsg && (
            <span
              className="meta"
              style={{
                color: wordMsg.startsWith("✓") ? "var(--success)" : "var(--danger)",
              }}
            >
              {wordMsg}
            </span>
          )}
          <button
            type="button"
            className="btn btn-primary btn-sm"
            onClick={saveWord}
            disabled={wordSaving || !word.trim()}
            style={{ marginLeft: "auto" }}
          >
            {wordSaving ? "저장 중…" : "키워드 저장"}
          </button>
        </div>
      </div>

      {/* 본인 글 */}
      {mine ? (
        <div className="card">
          <h3 className="section-title" style={{ marginBottom: 12 }}>
            내 글 수정
          </h3>
          <label className="label">제목</label>
          <input
            className="input"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            maxLength={100}
          />
          <label className="label" style={{ marginTop: 14 }}>
            본문 ({content.replace(/<[^>]+>/g, "").length}/1000)
          </label>
          <RichEditor
            value={content}
            onChange={setContent}
            variant="full"
            minHeight={260}
          />
          <div className="row-between" style={{ marginTop: 14, flexWrap: "wrap", gap: 8 }}>
            <form
              action={deleteKeywordEssayAction}
              onSubmit={(e) => {
                if (!confirm("정말 내 글을 삭제할까요? 상대방이 다시 봉인 상태로 돌아갑니다.")) e.preventDefault();
              }}
            >
              <input type="hidden" name="keywordId" value={keyword.id} />
              <button
                type="submit"
                className="btn btn-ghost btn-sm"
                style={{ color: "var(--danger)" }}
              >
                🗑 내 글 삭제
              </button>
            </form>
            <div className="row gap-8">
              {essayMsg && (
                <span
                  className="meta"
                  style={{
                    color: essayMsg.startsWith("✓") ? "var(--success)" : "var(--danger)",
                  }}
                >
                  {essayMsg}
                </span>
              )}
              <button
                type="button"
                className="btn btn-primary btn-sm"
                onClick={saveEssay}
                disabled={essaySaving}
              >
                {essaySaving ? "저장 중…" : "글 저장"}
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div
          className="card-flat"
          style={{
            padding: 18,
            background: "var(--paper-ink)",
            border: "1px dashed var(--line-2)",
          }}
        >
          <span className="meta">
            아직 쓴 글이 없어요. /keyword/{keyword.id}에서 먼저 글을 써주세요.
          </span>
        </div>
      )}
    </>
  );
}
