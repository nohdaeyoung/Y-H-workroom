import { NextResponse, type NextRequest } from "next/server";
import { auth } from "@/auth";
import { getDbOrThrow } from "@/lib/firebase-admin";
import { downloadObject, keyFromPublicUrl } from "@/lib/r2";
import type { BookclubTranscriptLine } from "@/types/domain";

export const runtime = "nodejs";
export const maxDuration = 300; // 5분 (Vercel Pro 한도)

async function whisperTranscribe(audio: Buffer, filename: string): Promise<string> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) throw new Error("OPENAI_API_KEY 미설정");

  const form = new FormData();
  const blob = new Blob([new Uint8Array(audio)]);
  form.append("file", blob, filename);
  form.append("model", "whisper-1");
  form.append("language", "ko");
  form.append("response_format", "json");

  const res = await fetch("https://api.openai.com/v1/audio/transcriptions", {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}` },
    body: form,
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Whisper 실패: ${res.status} ${text.slice(0, 200)}`);
  }
  const data = await res.json();
  return String(data.text ?? "");
}

async function claudeSeparateSpeakers(
  rawText: string,
  bookTitle: string
): Promise<BookclubTranscriptLine[]> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    // Fallback: 빈 줄 기준 단순 분리, 번갈아 Y/H
    const lines = rawText
      .split(/[\n.?!]+/)
      .map((s) => s.trim())
      .filter(Boolean);
    return lines.map((text, i) => ({
      speaker: i % 2 === 0 ? "Y" : "H",
      text,
    }));
  }

  const prompt = `다음은 「${bookTitle}」 독서모임 녹취입니다. 화자 두 명 — Y(영, 대영)와 H(희, 희서) — 의 대화를 자연스럽게 분리해서 JSON 배열로 응답해주세요.

원본 transcript:
"""
${rawText}
"""

응답 형식 (반드시 이 JSON만, 다른 텍스트 없이):
[{"speaker":"Y","text":"..."},{"speaker":"H","text":"..."}]

규칙:
- speaker는 "Y" 또는 "H"만
- text는 한 사람이 연속해서 말한 부분을 한 단위로 묶음
- 어느 쪽이 Y/H인지 모호하면 합리적으로 추측 (질문하는 쪽이 한 사람, 답하는 쪽이 한 사람 등)
- 한국어 그대로 유지`;

  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
      "content-type": "application/json",
    },
    body: JSON.stringify({
      model: "claude-sonnet-4-6",
      max_tokens: 4096,
      messages: [{ role: "user", content: prompt }],
    }),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Claude 실패: ${res.status} ${text.slice(0, 200)}`);
  }
  const data = await res.json();
  const text = data?.content?.[0]?.text?.trim() ?? "[]";
  // JSON 본문만 추출
  const m = text.match(/\[[\s\S]*\]/);
  const jsonText = m ? m[0] : "[]";
  try {
    const parsed = JSON.parse(jsonText);
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter(
        (p) =>
          p &&
          (p.speaker === "Y" || p.speaker === "H") &&
          typeof p.text === "string" &&
          p.text.trim()
      )
      .map((p) => ({ speaker: p.speaker, text: String(p.text).trim() }));
  } catch {
    return [];
  }
}

export async function POST(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await auth();
  const uid = session?.user?.id;
  if (uid !== "Y" && uid !== "H")
    return NextResponse.json({ error: "로그인이 필요해요" }, { status: 401 });

  const db = getDbOrThrow();
  const ref = db.collection("bookclubs").doc(params.id);
  const doc = await ref.get();
  if (!doc.exists)
    return NextResponse.json({ error: "찾을 수 없어요" }, { status: 404 });

  const data = doc.data() as {
    audioUrl?: string;
    audioKey?: string;
    bookTitle: string;
  };
  if (!data.audioUrl)
    return NextResponse.json({ error: "오디오 먼저 업로드해주세요" }, { status: 400 });

  const key = data.audioKey || keyFromPublicUrl(data.audioUrl);
  if (!key)
    return NextResponse.json({ error: "오디오 key 추출 실패" }, { status: 500 });

  await ref.update({ status: "processing" });

  try {
    const audio = await downloadObject(key);
    const filename = key.split("/").pop() || "audio";

    const rawText = await whisperTranscribe(audio, filename);
    if (!rawText.trim()) {
      await ref.update({ status: "review" });
      return NextResponse.json(
        { error: "음성 인식 결과가 비어 있어요" },
        { status: 500 }
      );
    }

    const transcript = await claudeSeparateSpeakers(rawText, data.bookTitle);

    await ref.update({
      transcript,
      status: "review",
    });
    return NextResponse.json({
      ok: true,
      lineCount: transcript.length,
      hasClaude: !!process.env.ANTHROPIC_API_KEY,
    });
  } catch (err) {
    console.error("transcribe failed:", err);
    await ref.update({ status: "review" });
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "변환 실패" },
      { status: 500 }
    );
  }
}
