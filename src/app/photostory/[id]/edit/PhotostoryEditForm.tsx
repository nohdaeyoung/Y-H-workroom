"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { RichEditor } from "@/components/RichEditor";
import {
  deletePhotostoryAction,
  setPhotostoryStatusAction,
  updatePhotostoryAction,
} from "@/app/photostory/actions";
import type { Photostory } from "@/types/domain";
import { presignAndUpload } from "@/lib/upload-client";

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

  const [delSaving, setDelSaving] = useState(false);
  const [delMsg, setDelMsg] = useState<string | null>(null);
  const [statusSaving, setStatusSaving] = useState(false);
  const [statusMsg, setStatusMsg] = useState<string | null>(null);

  async function requestDelete() {
    if (!confirm("사진+글 삭제를 요청할까요? 상대 승인 후 실제로 삭제됩니다.")) return;
    setDelSaving(true);
    setDelMsg(null);
    const fd = new FormData();
    fd.append("id", photostory.id);
    const res = await deletePhotostoryAction(fd);
    setDelSaving(false);
    setDelMsg(res.error || "✓ 삭제 요청을 보냈어요 — 상대 승인 대기");
  }

  async function requestStatusToggle() {
    const next = photostory.status === "waiting" ? "completed" : "waiting";
    if (!confirm(`상태를 "${next}"로 전환 요청할까요? 상대 승인 필요.`)) return;
    setStatusSaving(true);
    setStatusMsg(null);
    const fd = new FormData();
    fd.append("id", photostory.id);
    fd.append("status", next);
    const res = await setPhotostoryStatusAction(fd);
    setStatusSaving(false);
    setStatusMsg(res.error || `✓ 상태 전환 요청 보냈어요 (→ ${next})`);
  }

  async function addPhoto(file: File) {
    setUploading(true);
    setPhotoMsg(null);
    try {
      const { publicUrl } = await presignAndUpload(file, { kind: "photo" });
      setPhotos((prev) => [...prev, publicUrl].slice(0, 5));
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

      {/* 상태 전환 */}
      <div
        className="card-flat"
        style={{
          padding: 16,
          background: "var(--paper-2)",
          border: "1px solid var(--line)",
          marginBottom: 12,
        }}
      >
        <div className="row-between" style={{ flexWrap: "wrap", gap: 8 }}>
          <div>
            <div style={{ fontSize: 14, fontWeight: 500 }}>
              상태: {photostory.status === "waiting" ? "⏳ 대기" : "✓ 완료"}
            </div>
            <div className="meta">
              {photostory.status === "waiting" ? "completed로 수동 전환" : "waiting으로 되돌리기"} · 상대 동의 필요.
            </div>
          </div>
          <button
            type="button"
            className="btn btn-sm"
            onClick={requestStatusToggle}
            disabled={statusSaving}
          >
            {statusSaving ? "요청 중…" : "🔁 상태 전환 요청"}
          </button>
        </div>
        {statusMsg && (
          <div
            className="meta"
            style={{
              marginTop: 10,
              color: statusMsg.startsWith("✓") ? "var(--success)" : "var(--danger)",
              fontSize: 12,
            }}
          >
            {statusMsg}
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
            <div className="meta">상대 동의 후 사진+글이 함께 사라져요.</div>
          </div>
          <button
            type="button"
            className="btn"
            onClick={requestDelete}
            disabled={delSaving}
            style={{ color: "var(--danger)" }}
          >
            {delSaving ? "요청 보내는 중…" : "🗑 삭제 요청"}
          </button>
        </div>
        {delMsg && (
          <div
            className="meta"
            style={{
              marginTop: 10,
              color: delMsg.startsWith("✓") ? "var(--success)" : "var(--danger)",
              fontSize: 12,
            }}
          >
            {delMsg}
          </div>
        )}
      </div>
    </>
  );
}
