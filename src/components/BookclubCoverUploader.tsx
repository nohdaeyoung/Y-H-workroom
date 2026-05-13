"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { updateCoverAction } from "@/app/bookclub/actions";

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

export default function BookclubCoverUploader({
  bookclubId,
  initialCoverUrl,
  bookTitle,
}: {
  bookclubId: string;
  initialCoverUrl: string | null;
  bookTitle: string;
}) {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);
  const [coverUrl, setCoverUrl] = useState<string | null>(initialCoverUrl);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function pickAndUpload(file: File) {
    setError(null);
    setUploading(true);
    try {
      const url = await uploadOne(file);
      // server action으로 저장
      const fd = new FormData();
      fd.append("id", bookclubId);
      fd.append("coverUrl", url);
      await updateCoverAction(fd);
      setCoverUrl(url);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setUploading(false);
    }
  }

  async function removeCover() {
    setUploading(true);
    setError(null);
    try {
      const fd = new FormData();
      fd.append("id", bookclubId);
      fd.append("coverUrl", "");
      await updateCoverAction(fd);
      setCoverUrl(null);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setUploading(false);
    }
  }

  return (
    <div
      className="card-flat"
      style={{
        padding: 16,
        background: "var(--paper-2)",
        border: "1px solid var(--line)",
        marginBottom: 16,
      }}
    >
      <h3 className="section-title" style={{ marginBottom: 12 }}>
        📕 책 커버
      </h3>
      <div className="row gap-16" style={{ alignItems: "flex-start", flexWrap: "wrap" }}>
        <div
          style={{
            width: 100,
            height: 140,
            flexShrink: 0,
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
          <div className="row gap-8" style={{ flexWrap: "wrap" }}>
            <button
              type="button"
              className="btn btn-sm"
              onClick={() => fileRef.current?.click()}
              disabled={uploading}
            >
              {uploading ? "올리는 중…" : coverUrl ? "커버 교체" : "커버 업로드"}
            </button>
            {coverUrl && (
              <button
                type="button"
                className="btn btn-ghost btn-sm"
                onClick={removeCover}
                disabled={uploading}
                style={{ color: "var(--danger)" }}
              >
                제거
              </button>
            )}
          </div>
          {error && (
            <div
              className="meta"
              style={{ marginTop: 8, color: "var(--danger)", fontSize: 12 }}
            >
              {error}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
