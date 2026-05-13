"use client";

import { useEffect, useState } from "react";
import { useFormState, useFormStatus } from "react-dom";
import { RichEditor } from "./RichEditor";
import {
  writePhotostoryTextAction,
  type PhotostoryActionState,
} from "@/app/photostory/actions";

const initial: PhotostoryActionState = { error: "" };

export default function PhotostoryWriteButton({
  photostoryId,
  photoTitle,
  photoUrl,
}: {
  photostoryId: string;
  photoTitle: string;
  photoUrl?: string;
}) {
  const [open, setOpen] = useState(false);
  const [text, setText] = useState("");
  const [state, action] = useFormState(writePhotostoryTextAction, initial);

  useEffect(() => {
    if (state.ok) {
      setOpen(false);
      setText("");
    }
  }, [state.ok]);

  return (
    <>
      <button
        type="button"
        className="btn btn-primary"
        onClick={() => setOpen(true)}
      >
        ✎ 글 쓰러 가기
      </button>

      {open && (
        <div
          className="modal-back"
          onClick={(e) => {
            if (e.target === e.currentTarget) setOpen(false);
          }}
        >
          <div className="modal" style={{ maxWidth: 640 }}>
            <h3 className="serif" style={{ fontSize: 20, marginBottom: 6 }}>
              &ldquo;{photoTitle}&rdquo;에 글 쓰기
            </h3>
            <div className="meta" style={{ marginBottom: 14 }}>
              사진을 보고 떠오르는 것을 자유롭게 적어주세요. 시여도, 산문이어도, 한 줄이어도 좋아요.
            </div>

            {photoUrl && (
              <div
                style={{
                  marginBottom: 14,
                  height: 160,
                  borderRadius: "var(--r-md)",
                  overflow: "hidden",
                  background: "var(--paper-ink)",
                }}
              >
                <img
                  src={photoUrl}
                  alt=""
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                />
              </div>
            )}

            <form action={action}>
              <input type="hidden" name="id" value={photostoryId} />
              <input type="hidden" name="text" value={text} />

              <RichEditor
                value={text}
                onChange={setText}
                placeholder="사진을 보고 떠오르는 글을 적어주세요…"
                variant="full"
                minHeight={240}
              />

              {state.error && (
                <div
                  className="meta"
                  style={{
                    color: "var(--danger)",
                    marginTop: 10,
                    fontSize: 13,
                  }}
                >
                  {state.error}
                </div>
              )}

              <div
                className="row-between"
                style={{ marginTop: 14, flexWrap: "wrap", gap: 8 }}
              >
                <button
                  type="button"
                  className="btn"
                  onClick={() => setOpen(false)}
                >
                  나중에
                </button>
                <SubmitBtn disabled={!text.replace(/<[^>]+>/g, "").trim()} />
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
      {pending ? "올리는 중…" : "완성 → 공개"}
    </button>
  );
}
