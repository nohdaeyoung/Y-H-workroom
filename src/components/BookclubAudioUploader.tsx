"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";

type Props = {
  bookclubId: string;
  initialAudioUrl: string | null;
};

export default function BookclubAudioUploader({
  bookclubId,
  initialAudioUrl,
}: Props) {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(initialAudioUrl);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [transcribing, setTranscribing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  async function pickAndUpload(file: File) {
    setError(null);
    setInfo(null);
    setUploading(true);
    setProgress(0);

    try {
      // 1. 서명 받기
      const signRes = await fetch("/api/upload/sign", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          kind: "audio",
          filename: file.name,
          contentType: file.type || "audio/mpeg",
          size: file.size,
        }),
      });
      if (!signRes.ok) {
        const data = await signRes.json().catch(() => ({}));
        throw new Error(data.error || "서명 실패");
      }
      const { signedUrl, key, publicUrl } = await signRes.json();

      // 2. R2 직접 PUT (XHR로 progress 추적)
      await new Promise<void>((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open("PUT", signedUrl);
        xhr.setRequestHeader("Content-Type", file.type || "audio/mpeg");
        xhr.upload.onprogress = (e) => {
          if (e.lengthComputable) setProgress(Math.round((e.loaded / e.total) * 100));
        };
        xhr.onload = () => {
          if (xhr.status >= 200 && xhr.status < 300) resolve();
          else reject(new Error(`R2 PUT ${xhr.status}: ${xhr.statusText}`));
        };
        xhr.onerror = () => reject(new Error("네트워크 오류"));
        xhr.send(file);
      });

      // 3. audioUrl 저장
      const saveRes = await fetch(`/api/bookclubs/${bookclubId}/audio`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key }),
      });
      if (!saveRes.ok) {
        const data = await saveRes.json().catch(() => ({}));
        throw new Error(data.error || "저장 실패");
      }
      setAudioUrl(publicUrl);
      setInfo(`업로드 완료 (${Math.round(file.size / 1024 / 1024)}MB)`);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setUploading(false);
      setProgress(0);
    }
  }

  async function transcribe() {
    setTranscribing(true);
    setError(null);
    setInfo("변환 중… (오디오 길이에 따라 1~5분)");
    try {
      const res = await fetch(`/api/bookclubs/${bookclubId}/transcribe`, {
        method: "POST",
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "변환 실패");
      setInfo(`✓ ${data.lineCount}개 라인 추출 (${data.hasClaude ? "Claude 화자 분리" : "단순 교대 분리"})`);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setTranscribing(false);
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
      <div className="row-between" style={{ flexWrap: "wrap", gap: 12, marginBottom: 12 }}>
        <h3 className="section-title">🎙 녹음</h3>
        <div className="row gap-8">
          <button
            type="button"
            className="btn btn-sm"
            disabled={uploading}
            onClick={() => fileRef.current?.click()}
          >
            {audioUrl ? "오디오 교체" : "오디오 업로드"}
          </button>
          {audioUrl && (
            <button
              type="button"
              className="btn btn-sm btn-primary"
              disabled={uploading || transcribing}
              onClick={transcribe}
            >
              {transcribing ? "변환 중…" : "✨ Whisper로 변환"}
            </button>
          )}
        </div>
      </div>

      <input
        ref={fileRef}
        type="file"
        accept="audio/*"
        style={{ display: "none" }}
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) pickAndUpload(f);
          e.target.value = "";
        }}
      />

      {audioUrl && (
        <audio
          src={audioUrl}
          controls
          style={{ width: "100%", marginTop: 8 }}
        />
      )}

      {uploading && (
        <div style={{ marginTop: 10 }}>
          <div
            style={{
              height: 4,
              background: "var(--paper-deep)",
              borderRadius: 2,
              position: "relative",
            }}
          >
            <div
              style={{
                position: "absolute",
                left: 0,
                top: 0,
                height: "100%",
                width: `${progress}%`,
                background: "var(--ink)",
                borderRadius: 2,
                transition: "width 0.2s",
              }}
            />
          </div>
          <div className="meta" style={{ marginTop: 4 }}>
            업로드 중… {progress}%
          </div>
        </div>
      )}

      {info && (
        <div
          className="meta"
          style={{ marginTop: 10, color: "var(--success)", fontSize: 13 }}
        >
          {info}
        </div>
      )}
      {error && (
        <div
          className="meta"
          style={{ marginTop: 10, color: "var(--danger)", fontSize: 13 }}
        >
          {error}
        </div>
      )}

      <div className="meta" style={{ marginTop: 12, fontSize: 11 }}>
        ※ 최대 200MB, audio/* MIME만. Whisper 변환은 OPENAI_API_KEY 필요. 화자 분리는 ANTHROPIC_API_KEY 있을 때만 정확.
      </div>
    </div>
  );
}
