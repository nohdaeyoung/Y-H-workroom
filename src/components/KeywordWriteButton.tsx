"use client";

import { useEffect, useState } from "react";
import { useFormState, useFormStatus } from "react-dom";
import { RichEditor } from "./RichEditor";
import {
  writeKeywordEssayAction,
  type KeywordActionState,
} from "@/app/keyword/actions";

const initial: KeywordActionState = { error: "" };

export default function KeywordWriteButton({
  keywordId,
  keyword,
}: {
  keywordId: string;
  keyword: string;
}) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [state, action] = useFormState(writeKeywordEssayAction, initial);

  useEffect(() => {
    if (state.ok) {
      setOpen(false);
      setTitle("");
      setContent("");
    }
  }, [state.ok]);

  const charCount = content.replace(/<[^>]+>/g, "").length;

  return (
    <>
      <button
        type="button"
        className="btn btn-primary"
        onClick={() => setOpen(true)}
      >
        ✎ 지금 쓰기
      </button>

      {open && (
        <div
          className="modal-back"
          onClick={(e) => {
            if (e.target === e.currentTarget) setOpen(false);
          }}
        >
          <div className="modal" style={{ maxWidth: 640 }}>
            <h3
              className="serif"
              style={{ fontSize: 20, marginBottom: 6 }}
            >
              &ldquo;{keyword}&rdquo;
            </h3>
            <div className="meta" style={{ marginBottom: 14 }}>
              상대방은 당신이 완성할 때까지 기다립니다. (1000자 이내)
            </div>

            <form action={action}>
              <input type="hidden" name="keywordId" value={keywordId} />
              <input type="hidden" name="content" value={content} />

              <label className="label">제목</label>
              <input
                className="input"
                name="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder={`"${keyword}"에 대한 글의 제목`}
                maxLength={100}
              />

              <label className="label" style={{ marginTop: 14 }}>
                본문 <span className="meta" style={{ marginLeft: 6 }}>{charCount}/1000</span>
              </label>
              <RichEditor
                value={content}
                onChange={setContent}
                placeholder={`"${keyword}"에 대한 글을 적어주세요…`}
                variant="full"
                minHeight={260}
              />

              {state.error && (
                <div
                  className="meta"
                  style={{ color: "var(--danger)", marginTop: 10, fontSize: 13 }}
                >
                  {state.error}
                </div>
              )}

              <div className="row-between" style={{ marginTop: 14, flexWrap: "wrap", gap: 8 }}>
                <button
                  type="button"
                  className="btn"
                  onClick={() => setOpen(false)}
                >
                  나중에
                </button>
                <SubmitBtn disabled={!title.trim() || charCount === 0} />
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

function SubmitBtn({ disabled }: { disabled: boolean }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      className="btn btn-primary"
      disabled={pending || disabled}
    >
      {pending ? "봉인 중…" : "완성 · 봉인"}
    </button>
  );
}
