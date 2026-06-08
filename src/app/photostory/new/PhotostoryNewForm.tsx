"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { useFormState, useFormStatus } from "react-dom";
import {
  createPhotostoryAction,
  type PhotostoryActionState,
} from "@/app/photostory/actions";
import { presignAndUpload } from "@/lib/upload-client";

const initial: PhotostoryActionState = { error: "" };

export default function PhotostoryNewForm({ author }: { author: "Y" | "H" }) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [title, setTitle] = useState("");
  const [photos, setPhotos] = useState<{ file: File; preview: string; url?: string }[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadErr, setUploadErr] = useState<string | null>(null);
  const [state, action] = useFormState(createPhotostoryAction, initial);

  function pickFiles(files: FileList | null) {
    if (!files) return;
    const room = 5 - photos.length;
    const incoming = Array.from(files).slice(0, room);
    const next = incoming.map((f) => ({
      file: f,
      preview: URL.createObjectURL(f),
    }));
    setPhotos((prev) => [...prev, ...next]);
  }

  function removePhoto(i: number) {
    setPhotos((prev) => prev.filter((_, idx) => idx !== i));
  }

  async function uploadAll() {
    setUploading(true);
    setUploadErr(null);
    const next = [...photos];
    try {
      for (let i = 0; i < next.length; i++) {
        if (next[i].url) continue;
        const { publicUrl } = await presignAndUpload(next[i].file, { kind: "photo" });
        next[i] = { ...next[i], url: publicUrl };
        setPhotos([...next]);
      }
    } catch (err) {
      setUploadErr(err instanceof Error ? err.message : String(err));
    } finally {
      setUploading(false);
    }
  }

  const uploadedUrls = photos.map((p) => p.url).filter((u): u is string => !!u);
  const allUploaded = photos.length > 0 && uploadedUrls.length === photos.length;

  return (
    <form action={action}>
      <input type="hidden" name="title" value={title} />
      <input type="hidden" name="photos" value={JSON.stringify(uploadedUrls)} />

      <div className="card" style={{ padding: 24 }}>
        <div className="row gap-8" style={{ marginBottom: 16 }}>
          <span className="hand" style={{ fontSize: 17, color: "var(--ink-3)" }}>
            사진을 올린 뒤 글을 이어 적습니다
          </span>
        </div>

        <label className="label">제목 (선택)</label>
        <input
          className="input"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="예: 빈 의자가 놓인 카페 창가"
        />

        <label className="label" style={{ marginTop: 18 }}>
          사진 (최대 5장)
        </label>
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          multiple
          style={{ display: "none" }}
          onChange={(e) => {
            pickFiles(e.target.files);
            e.target.value = "";
          }}
        />
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))",
            gap: 10,
          }}
        >
          {photos.map((p, i) => (
            <div
              key={i}
              style={{
                position: "relative",
                aspectRatio: "1 / 1",
                background: "var(--paper-ink)",
                borderRadius: "var(--r-md)",
                border: "1px solid var(--line)",
                overflow: "hidden",
              }}
            >
              <img
                src={p.preview}
                alt=""
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
              />
              {p.url && (
                <div
                  style={{
                    position: "absolute",
                    top: 6,
                    left: 6,
                    padding: "2px 8px",
                    fontSize: 11,
                    background: "oklch(0.55 0.13 145 / 0.85)",
                    color: "white",
                    borderRadius: "var(--r-pill)",
                  }}
                >
                  ✓
                </div>
              )}
              <button
                type="button"
                onClick={() => removePhoto(i)}
                style={{
                  position: "absolute",
                  top: 6,
                  right: 6,
                  width: 24,
                  height: 24,
                  borderRadius: "50%",
                  background: "oklch(0.2 0.02 50 / 0.7)",
                  color: "white",
                  fontSize: 14,
                  border: "none",
                  cursor: "pointer",
                }}
              >
                ✕
              </button>
            </div>
          ))}
          {photos.length < 5 && (
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              style={{
                aspectRatio: "1 / 1",
                background: "var(--paper)",
                border: "2px dashed var(--line-2)",
                borderRadius: "var(--r-md)",
                color: "var(--ink-3)",
                fontSize: 30,
                cursor: "pointer",
              }}
            >
              ＋
            </button>
          )}
        </div>

        {uploadErr && (
          <div
            className="meta"
            style={{ color: "var(--danger)", marginTop: 12, fontSize: 13 }}
          >
            {uploadErr}
          </div>
        )}

        {photos.length > 0 && !allUploaded && (
          <button
            type="button"
            onClick={uploadAll}
            disabled={uploading}
            className="btn"
            style={{ width: "100%", marginTop: 14 }}
          >
            {uploading ? "올리는 중…" : "사진 R2에 올리기"}
          </button>
        )}

        {state.error && (
          <div
            className="meta"
            style={{ color: "var(--danger)", marginTop: 12, fontSize: 13 }}
          >
            {state.error}
          </div>
        )}
      </div>

      <div className="row-between" style={{ marginTop: 20 }}>
        <Link href="/photostory" className="btn btn-ghost">
          취소
        </Link>
        <SubmitBtn disabled={!allUploaded} />
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
      {pending ? "올리는 중…" : "사진 게시"}
    </button>
  );
}
