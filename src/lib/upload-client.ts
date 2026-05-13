/**
 * R2 presign + PUT 업로드 클라이언트 헬퍼.
 *
 * 사용처:
 * - 책 커버 / 사진 (kind="photo")
 * - 음성 (kind="audio", progress 콜백 지원)
 */

export type UploadKind = "photo" | "audio";

export type UploadResult = {
  publicUrl: string;
  key: string;
};

export type UploadOptions = {
  kind: UploadKind;
  onProgress?: (pct: number) => void;
};

const DEFAULT_MIME: Record<UploadKind, string> = {
  photo: "image/jpeg",
  audio: "audio/mpeg",
};

export async function presignAndUpload(
  file: File,
  opts: UploadOptions
): Promise<UploadResult> {
  const contentType = file.type || DEFAULT_MIME[opts.kind];

  const signRes = await fetch("/api/upload/sign", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      kind: opts.kind,
      filename: file.name,
      contentType,
      size: file.size,
    }),
  });
  if (!signRes.ok) {
    const data = await signRes.json().catch(() => ({}));
    throw new Error(data.error || "서명 실패");
  }
  const { signedUrl, key, publicUrl } = await signRes.json();

  await new Promise<void>((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("PUT", signedUrl);
    xhr.setRequestHeader("Content-Type", contentType);
    if (opts.onProgress) {
      xhr.upload.onprogress = (e) => {
        if (e.lengthComputable) {
          opts.onProgress!(Math.round((e.loaded / e.total) * 100));
        }
      };
    }
    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) resolve();
      else reject(new Error(`R2 PUT ${xhr.status}: ${xhr.statusText}`));
    };
    xhr.onerror = () => reject(new Error("네트워크 오류"));
    xhr.send(file);
  });

  return { publicUrl, key };
}
