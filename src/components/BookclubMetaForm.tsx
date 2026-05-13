"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useFormState, useFormStatus } from "react-dom";
import {
  updateCoverAction,
  updateMetaAction,
  type BookclubActionState,
} from "@/app/bookclub/actions";
import { presignAndUpload } from "@/lib/upload-client";

const initial: BookclubActionState = { error: "" };

export default function BookclubMetaForm({
  id,
  bookTitle,
  bookAuthor,
  meetingDate,
  duration,
  initialCoverUrl,
}: {
  id: string;
  bookTitle: string;
  bookAuthor: string;
  meetingDate: string;
  duration: string;
  initialCoverUrl: string | null;
}) {
  const router = useRouter();
  const [state, action] = useFormState(updateMetaAction, initial);

  const fileRef = useRef<HTMLInputElement>(null);
  const [coverUrl, setCoverUrl] = useState<string | null>(initialCoverUrl);
  const [coverUploading, setCoverUploading] = useState(false);
  const [coverError, setCoverError] = useState<string | null>(null);

  async function pickAndUpload(file: File) {
    setCoverError(null);
    setCoverUploading(true);
    try {
      const { publicUrl } = await presignAndUpload(file, { kind: "photo" });
      const fd = new FormData();
      fd.append("id", id);
      fd.append("coverUrl", publicUrl);
      await updateCoverAction(fd);
      setCoverUrl(publicUrl);
      router.refresh();
    } catch (err) {
      setCoverError(err instanceof Error ? err.message : String(err));
    } finally {
      setCoverUploading(false);
    }
  }

  async function removeCover() {
    setCoverUploading(true);
    setCoverError(null);
    try {
      const fd = new FormData();
      fd.append("id", id);
      fd.append("coverUrl", "");
      await updateCoverAction(fd);
      setCoverUrl(null);
      router.refresh();
    } catch (err) {
      setCoverError(err instanceof Error ? err.message : String(err));
    } finally {
      setCoverUploading(false);
    }
  }

  return (
    <form
      action={action}
      className="card-flat"
      style={{
        padding: 16,
        background: "var(--paper-2)",
        border: "1px solid var(--line)",
        marginBottom: 16,
      }}
    >
      <input type="hidden" name="id" value={id} />
      <h3 className="section-title" style={{ marginBottom: 12 }}>
        📚 책 정보
      </h3>

      <div className="row gap-16" style={{ alignItems: "flex-start", flexWrap: "wrap" }}>
        <div style={{ flexShrink: 0 }}>
          <div
            style={{
              width: 100,
              height: 140,
              background: "var(--paper-ink)",
              border: "1px solid var(--line)",
              borderRadius: "2px 6px 6px 2px",
              overflow: "hidden",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "var(--ink-3)",
              fontSize: 28,
            }}
          >
            {coverUrl ? (
              <img
                src={coverUrl}
                alt={bookTitle}
                loading="lazy"
                decoding="async"
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
              />
            ) : (
              <span>📕</span>
            )}
          </div>
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
          <div
            className="row gap-4"
            style={{ marginTop: 8, flexWrap: "wrap", justifyContent: "center" }}
          >
            <button
              type="button"
              className="btn btn-sm"
              onClick={() => fileRef.current?.click()}
              disabled={coverUploading}
              style={{ fontSize: 12 }}
            >
              {coverUploading ? "올리는 중…" : coverUrl ? "교체" : "커버 업로드"}
            </button>
            {coverUrl && !coverUploading && (
              <button
                type="button"
                className="btn btn-ghost btn-sm"
                onClick={removeCover}
                style={{ color: "var(--danger)", fontSize: 12 }}
              >
                제거
              </button>
            )}
          </div>
          {coverError && (
            <div
              className="meta"
              style={{ marginTop: 6, color: "var(--danger)", fontSize: 11, textAlign: "center" }}
            >
              {coverError}
            </div>
          )}
        </div>

        <div className="flex-1" style={{ minWidth: 240 }}>
          <label className="label">책 제목</label>
          <input
            className="input"
            name="bookTitle"
            defaultValue={bookTitle}
            required
          />
          <label className="label" style={{ marginTop: 12 }}>
            저자
          </label>
          <input
            className="input"
            name="bookAuthor"
            defaultValue={bookAuthor}
            required
          />
          <div
            className="row gap-12"
            style={{ marginTop: 12, flexWrap: "wrap" }}
          >
            <div className="flex-1" style={{ minWidth: 140 }}>
              <label className="label">모임 날짜</label>
              <input
                className="input"
                name="meetingDate"
                defaultValue={meetingDate}
                required
              />
            </div>
            <div className="flex-1" style={{ minWidth: 140 }}>
              <label className="label">길이</label>
              <input
                className="input"
                name="duration"
                defaultValue={duration}
                placeholder="1시간 23분"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="row-between" style={{ marginTop: 14, flexWrap: "wrap", gap: 8 }}>
        {state.error && (
          <span className="meta" style={{ color: "var(--danger)" }}>
            {state.error}
          </span>
        )}
        {state.ok && (
          <span className="meta" style={{ color: "var(--success)" }}>
            ✓ 저장됨
          </span>
        )}
        <SaveBtn />
      </div>
    </form>
  );
}

function SaveBtn() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      className="btn btn-primary btn-sm"
      disabled={pending}
      style={{ marginLeft: "auto" }}
    >
      {pending ? "저장 중…" : "책 정보 저장"}
    </button>
  );
}
