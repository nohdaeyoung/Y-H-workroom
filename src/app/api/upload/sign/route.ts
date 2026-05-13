import { NextResponse, type NextRequest } from "next/server";
import { auth } from "@/auth";
import { buildKey, publicUrlFor, signUploadUrl } from "@/lib/r2";

export const runtime = "nodejs";

const ALLOWED_KINDS = new Set(["audio", "photo", "misc"]);
const MAX_AUDIO_BYTES = 200 * 1024 * 1024; // 200MB
const MAX_PHOTO_BYTES = 20 * 1024 * 1024; // 20MB

export async function POST(req: NextRequest) {
  const session = await auth();
  const uid = session?.user?.id;
  if (uid !== "Y" && uid !== "H") {
    return NextResponse.json({ error: "로그인이 필요해요" }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  if (!body) return NextResponse.json({ error: "잘못된 요청" }, { status: 400 });

  const kind = body.kind as string;
  const filename = String(body.filename ?? "").trim();
  const contentType = String(body.contentType ?? "application/octet-stream");
  const size = Number(body.size ?? 0);

  if (!ALLOWED_KINDS.has(kind))
    return NextResponse.json({ error: "kind 필수 (audio | photo | misc)" }, { status: 400 });
  if (!filename)
    return NextResponse.json({ error: "filename 필수" }, { status: 400 });

  // kind별 크기/타입 검증
  if (kind === "audio") {
    if (!contentType.startsWith("audio/"))
      return NextResponse.json({ error: "audio/* MIME만 가능해요" }, { status: 400 });
    if (size > MAX_AUDIO_BYTES)
      return NextResponse.json({ error: "오디오는 200MB 이내" }, { status: 400 });
  } else if (kind === "photo") {
    if (!contentType.startsWith("image/"))
      return NextResponse.json({ error: "image/* MIME만 가능해요" }, { status: 400 });
    if (size > MAX_PHOTO_BYTES)
      return NextResponse.json({ error: "사진은 20MB 이내" }, { status: 400 });
  }

  try {
    const key = buildKey(kind as "audio" | "photo" | "misc", filename);
    const signedUrl = await signUploadUrl(key, contentType, 600);
    const publicUrl = publicUrlFor(key);
    return NextResponse.json({ key, signedUrl, publicUrl });
  } catch (err) {
    console.error("sign upload failed:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "서명 실패" },
      { status: 500 }
    );
  }
}
