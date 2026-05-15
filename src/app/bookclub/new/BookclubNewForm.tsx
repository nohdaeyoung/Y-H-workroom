"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { useFormState, useFormStatus } from "react-dom";
import {
  createDraftAction,
  type BookclubActionState,
} from "@/app/bookclub/actions";
import { presignAndUpload } from "@/lib/upload-client";

const initial: BookclubActionState = { error: "" };

export default function BookclubNewForm() {
  const fileRef = useRef<HTMLInputElement>(null);
  const [state, action] = useFormState(createDraftAction, initial);
  const [coverUrl, setCoverUrl] = useState<string | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [coverError, setCoverError] = useState<string | null>(null);

  async function pickAndUpload(file: File) {
    setCoverError(null);
    setPreview(URL.createObjectURL(file));
    setUploading(true);
    try {
      const { publicUrl } = await presignAndUpload(file, { kind: "photo" });
      setCoverUrl(publicUrl);
    } catch (err) {
      setCoverError(err instanceof Error ? err.message : "업로드 실패");
      setPreview(null);
    } finally {
      setUploading(false);
    }
  }

  return (
    <form action={action} className="card">
      <input type="hidden" name="coverUrl" value={coverUrl ?? ""} />

      <label className="label">책 커버 (선택)</label>
      <div className="row gap-16" style={{ alignItems: "flex-start" }}>
        <div
          style={{
            width: 100,
            height: 140,
            flexShrink: 0,
            background: "var(--paper-ink)",
            border: "1px dashed var(--line-2)",
            borderRadius: "2px 6px 6px 2px",
            overflow: "hidden",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "var(--ink-3)",
            fontSize: 28,
          }}
        >
          {preview || coverUrl ? (
            <img
              src={preview || coverUrl!}
              alt="책 커버"
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
            />
          ) : (
            <span>📕</span>
          )}
        </div>
        <div className="flex-1">
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            style={{ display: "none" }}
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) pickAndUpload(f);
              e.target.value = "";
            }}
          />
          <button
            type="button"
            className="btn btn-sm"
            onClick={() => fileRef.current?.click()}
            disabled={uploading}
          >
            {uploading
              ? "올리는 중…"
              : coverUrl
              ? "커버 교체"
              : "커버 이미지 선택"}
          </button>
          {coverUrl && (
            <button
              type="button"
              className="btn btn-ghost btn-sm"
              style={{ marginLeft: 6, color: "var(--danger)" }}
              onClick={() => {
                setCoverUrl(null);
                setPreview(null);
              }}
            >
              제거
            </button>
          )}
          {coverError && (
            <div
              className="meta"
              style={{ color: "var(--danger)", marginTop: 6, fontSize: 12 }}
            >
              {coverError}
            </div>
          )}
          <div className="meta" style={{ fontSize: 11, marginTop: 6 }}>
            없으면 책 제목으로 자동 spine 표시
          </div>
        </div>
      </div>

      <label className="label" style={{ marginTop: 18 }}>
        책 제목
      </label>
      <input
        className="input"
        name="bookTitle"
        placeholder="예: 나는 나로 살기로 했다"
        required
      />

      <label className="label" style={{ marginTop: 14 }}>
        저자
      </label>
      <input
        className="input"
        name="bookAuthor"
        placeholder="예: 김수현"
        required
      />

      <div className="row gap-12" style={{ marginTop: 14, flexWrap: "wrap" }}>
        <div className="flex-1" style={{ minWidth: 160 }}>
          <label className="label">모임 날짜</label>
          <input
            className="input"
            name="meetingDate"
            placeholder="2026.05.13"
            required
          />
        </div>
        <div className="flex-1" style={{ minWidth: 160 }}>
          <label className="label">길이 (선택)</label>
          <input
            className="input"
            name="duration"
            placeholder="1시간 23분"
          />
        </div>
      </div>

      <div
        className="meta"
        style={{
          fontSize: 11,
          marginTop: 18,
          color: "var(--ink-3)",
        }}
      >
        새로 만들면 &quot;독서중&quot; 상태로 시작해요. 모임 완료/완독으로 전환은 둘 다 동의해야 적용돼요 (review 페이지에서).
      </div>

      {state.error && (
        <div
          className="meta"
          style={{ color: "var(--danger)", marginTop: 12, fontSize: 13 }}
        >
          {state.error}
        </div>
      )}

      <div className="row-between" style={{ marginTop: 20 }}>
        <Link href="/bookclub" className="btn btn-ghost">
          취소
        </Link>
        <SubmitBtn disabled={uploading} />
      </div>
    </form>
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
      {pending ? "만드는 중…" : "검수로 이동"}
    </button>
  );
}
