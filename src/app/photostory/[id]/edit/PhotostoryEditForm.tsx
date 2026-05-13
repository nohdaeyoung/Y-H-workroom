"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { RichEditor } from "@/components/RichEditor";
import {
  deletePhotostoryAction,
  updatePhotostoryAction,
} from "@/app/photostory/actions";
import type { Photostory } from "@/types/domain";

async function uploadOne(file: File): Promise<string> {
  const signRes = await fetch("/api/upload/sign", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      kind: "photo",
      filename: file.name,
      contentType: file.type || "image/jpeg",
      size: file.size,
    }),
  });
  if (!signRes.ok) {
    const data = await signRes.json().catch(() => ({}));
    throw new Error(data.error || "서명 실패");
  }
  const { signedUrl, publicUrl } = await signRes.json();
  await new Promise<void>((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("PUT", signedUrl);
    xhr.setRequestHeader("Content-Type", file.type || "image/jpeg");
    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) resolve();
      else reject(new Error(`R2 PUT ${xhr.status}`));
    };
    xhr.onerror = () => reject(new Error("네트워크 오류"));
    xhr.send(file);
  });
  return publicUrl;
}

export default function PhotostoryEditForm({
  photostory,
  viewer,
}: {
  photostory: Photostory;
  viewer: "Y" | "H";
}) {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);

  const isPhotoAuthor = photostory.photoAuthor === viewer;
  const isTextAuthor = photostory.textAuthor === viewer;

  const [title, setTitle] = useState(photostory.photoTitle);
  const [photos, setPhotos] = useState<string[]>(photostory.photos);
  const [text, setText] = useState(photostory.text ?? "");

  const [photoMsg, setPhotoMsg] = useState<string | null>(null);
  const [photoSaving, setPhotoSaving] = useState(false);
  const [textMsg, setTextMsg] = useState<string | null>(null);
  const [textSaving, setTextSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  async function addPhoto(file: File) {
    setUploading(true);
    setPhotoMsg(null);
    try {
      const url = await uploadOne(file);
      setPhotos((prev) => [...prev, url].slice(0, 5));
    } catch (err) {
      setPhotoMsg(err instanceof Error ? err.message : String(err));
    } finally {
      setUploading(false);
    }
  }

  async function savePhotoSection() {
    setPhotoSaving(true);
    setPhotoMsg(null);
    const fd = new FormData();
    fd.append("id", photostory.id);
    fd.append("photoTitle", title);
    fd.append("photos", JSON.stringify(photos));
    const res = await updatePhotostoryAction({ error: "" }, fd);
    setPhotoMsg(res.error || "✓ 저장됨");
    setPhotoSaving(false);
    router.refresh();
  }

  async function saveTextSection() {
    setTextSaving(true);
    setTextMsg(null);
    const fd = new FormData();
    fd.append("id", photostory.id);
    fd.append("text", text);
    const res = await updatePhotostoryAction({ error: "" }, fd);
    setTextMsg(res.error || "✓ 저장됨");
    setTextSaving(false);
    router.refresh();
  }

  return (
    <>
      {/* 사진 + 제목 (photoAuthor 전용) */}
      <div
        className="card"
        style={{ marginBottom: 20, opacity: isPhotoAuthor ? 1 : 0.6 }}
      >
        <div className="row gap-8" style={{ marginBottom: 12 }}>
          <span className={`avatar-mini ${photostory.photoAuthor.toLowerCase()}`}>
            {photostory.photoAuthor}
          </span>
          <h3 className="section-title">📸 사진 + 제목</h3>
          {!isPhotoAuthor && (
            <span className="meta" style={{ marginLeft: "auto" }}>
              {photostory.photoAuthor}만 수정
            </span>
          )}
        </div>

        <label className="label">제목</label>
        <input
          className="input"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          disabled={!isPhotoAuthor}
          maxLength={100}
        />

        <label className="label" style={{ marginTop: 14 }}>
          사진 ({photos.length}/5)
        </label>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(120px, 1fr))",
            gap: 10,
          }}
        >
          {photos.map((url, i) => (
            <div
              key={`${url}-${i}`}
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
                src={url}
                alt=""
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
              />
              {isPhotoAuthor && (
                <button
                  type="button"
                  onClick={() => setPhotos((p) => p.filter((_, idx) => idx !== i))}
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
              )}
            </div>
          ))}
          {isPhotoAuthor && photos.length < 5 && (
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              disabled={uploading}
              style={{
                aspectRatio: "1 / 1",
                background: "var(--paper)",
                border: "2px dashed var(--line-2)",
                borderRadius: "var(--r-md)",
                color: "var(--ink-3)",
                fontSize: 24,
                cursor: "pointer",
              }}
            >
              {uploading ? "…" : "＋"}
            </button>
          )}
        </div>
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          style={{ display: "none" }}
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) addPhoto(f);
            e.target.value = "";
          }}
        />

        {isPhotoAuthor && (
          <div className="row-between" style={{ marginTop: 14 }}>
            {photoMsg && (
              <span
                className="meta"
                style={{
                  color: photoMsg.startsWith("✓") ? "var(--success)" : "var(--danger)",
                }}
              >
                {photoMsg}
              </span>
            )}
            <button
              type="button"
              className="btn btn-primary btn-sm"
              onClick={savePhotoSection}
              disabled={photoSaving || uploading || photos.length === 0}
              style={{ marginLeft: "auto" }}
            >
              {photoSaving ? "저장 중…" : "사진/제목 저장"}
            </button>
          </div>
        )}
      </div>

      {/* 글 (textAuthor 전용) */}
      <div
        className="card"
        style={{ marginBottom: 20, opacity: isTextAuthor ? 1 : 0.6 }}
      >
        <div className="row gap-8" style={{ marginBottom: 12 }}>
          <span className={`avatar-mini ${photostory.textAuthor.toLowerCase()}`}>
            {photostory.textAuthor}
          </span>
          <h3 className="section-title">✍️ 글</h3>
          {!isTextAuthor && (
            <span className="meta" style={{ marginLeft: "auto" }}>
              {photostory.textAuthor}만 수정
            </span>
          )}
        </div>
        {isTextAuthor ? (
          <>
            <RichEditor
              value={text}
              onChange={setText}
              placeholder="사진에 어울리는 글을 적어주세요…"
              variant="full"
              minHeight={240}
            />
            <div className="row-between" style={{ marginTop: 14 }}>
              {textMsg && (
                <span
                  className="meta"
                  style={{
                    color: textMsg.startsWith("✓") ? "var(--success)" : "var(--danger)",
                  }}
                >
                  {textMsg}
                </span>
              )}
              <button
                type="button"
                className="btn btn-primary btn-sm"
                onClick={saveTextSection}
                disabled={textSaving || !text.replace(/<[^>]+>/g, "").trim()}
                style={{ marginLeft: "auto" }}
              >
                {textSaving ? "저장 중…" : "글 저장"}
              </button>
            </div>
          </>
        ) : (
          <div className="meta">
            {photostory.text ? "이미 작성된 글이 있어요." : "아직 작성되지 않은 글이에요."}
          </div>
        )}
      </div>

      {/* 삭제 */}
      <div
        className="card-flat"
        style={{
          padding: 16,
          background: "var(--paper-ink)",
          border: "1px dashed var(--line-2)",
        }}
      >
        <div className="row-between" style={{ flexWrap: "wrap", gap: 8 }}>
          <div>
            <div style={{ fontSize: 14, fontWeight: 500 }}>삭제</div>
            <div className="meta">사진+글이 함께 사라집니다.</div>
          </div>
          <form
            action={deletePhotostoryAction}
            onSubmit={(e) => {
              if (!confirm("정말 삭제할까요?")) e.preventDefault();
            }}
          >
            <input type="hidden" name="id" value={photostory.id} />
            <button
              type="submit"
              className="btn"
              style={{ color: "var(--danger)" }}
            >
              🗑 삭제
            </button>
          </form>
        </div>
      </div>
    </>
  );
}
