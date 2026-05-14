import "server-only";
import { getDb, getDbOrThrow } from "@/lib/firebase-admin";
import type { Keyword, KeywordEssay, UserId } from "@/types/domain";

const COLLECTION = "keywords";
const MAX_CONTENT_LEN = 1000;

function isDev() {
  return process.env.NODE_ENV !== "production";
}

// AI 키 없을 때 fallback 단어 풀
const FALLBACK_POOL = [
  "빈 의자", "새벽 세 시", "첫 직장", "잃어버린 것", "골목", "우산",
  "오래된 책장", "낮잠", "전화", "기다림", "창문", "겨울 햇살",
  "혼자 먹은 밥", "오래된 사진", "마지막 인사", "버려진 메모",
  "끝나지 않은 편지", "비 그친 후", "처음 본 영화", "낯선 도시",
  "잠 못 드는 밤", "여름 저녁", "녹은 아이스크림", "옛 이름",
];

function computeStatus(
  yEssay: KeywordEssay | null,
  hEssay: KeywordEssay | null
): Keyword["status"] {
  if (yEssay && hEssay) return "both_done";
  if (yEssay) return "y_done";
  if (hEssay) return "h_done";
  return "waiting";
}

export async function listKeywords(): Promise<Keyword[]> {
  const db = getDb();
  if (!db) {
    if (!isDev()) return [];
    const { MOCK_KEYWORDS } = await import("@/lib/mock-keywords");
    return MOCK_KEYWORDS.map((m) => ({
      id: m.id,
      keyword: m.keyword,
      suggestedAt: m.suggestedAt,
      yEssay: m.yEssay,
      hEssay: m.hEssay,
      status: computeStatus(m.yEssay, m.hEssay),
    }));
  }
  const snap = await db
    .collection(COLLECTION)
    .orderBy("suggestedAt", "desc")
    .limit(100)
    .get();
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as Keyword));
}

export async function getKeyword(id: string): Promise<Keyword | null> {
  const db = getDb();
  if (!db) {
    if (!isDev()) return null;
    const { MOCK_KEYWORDS } = await import("@/lib/mock-keywords");
    const m = MOCK_KEYWORDS.find((k) => k.id === id);
    if (!m) return null;
    return {
      id: m.id,
      keyword: m.keyword,
      suggestedAt: m.suggestedAt,
      yEssay: m.yEssay,
      hEssay: m.hEssay,
      status: computeStatus(m.yEssay, m.hEssay),
    };
  }
  const doc = await db.collection(COLLECTION).doc(id).get();
  if (!doc.exists) return null;
  return { id: doc.id, ...doc.data() } as Keyword;
}

export async function suggestNewKeyword(): Promise<string> {
  // Anthropic 우선
  if (process.env.ANTHROPIC_API_KEY) {
    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "x-api-key": process.env.ANTHROPIC_API_KEY,
          "anthropic-version": "2023-06-01",
          "content-type": "application/json",
        },
        body: JSON.stringify({
          model: "claude-haiku-4-5",
          max_tokens: 60,
          messages: [
            {
              role: "user",
              content:
                "한국어 일상 에세이의 키워드 한 단어만 추천해주세요. 2~6글자, 시적이고 일상적인 것 하나만. 다른 설명 없이 단어만 응답해주세요. 예: '빈 의자', '새벽 세 시', '오래된 책장'",
            },
          ],
        }),
      });
      if (res.ok) {
        const data = await res.json();
        const text = data?.content?.[0]?.text?.trim();
        if (text) {
          // 양 끝 따옴표나 마침표 정리
          return text.replace(/^["'\s]+|["'\s.]+$/g, "").slice(0, 30);
        }
      }
    } catch (err) {
      console.warn("[suggestNewKeyword] Anthropic 호출 실패:", err);
    }
  }

  // OpenAI fallback
  if (process.env.OPENAI_API_KEY) {
    try {
      const res = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
          "content-type": "application/json",
        },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          max_tokens: 30,
          messages: [
            {
              role: "user",
              content:
                "한국어 일상 에세이 키워드 한 단어만 추천 (2~6글자, 시적이고 일상적인 것). 단어만 응답.",
            },
          ],
        }),
      });
      if (res.ok) {
        const data = await res.json();
        const text = data?.choices?.[0]?.message?.content?.trim();
        if (text) return text.replace(/^["'\s]+|["'\s.]+$/g, "").slice(0, 30);
      }
    } catch (err) {
      console.warn("[suggestNewKeyword] OpenAI 호출 실패:", err);
    }
  }

  // 폴백 풀에서 랜덤
  return FALLBACK_POOL[Math.floor(Math.random() * FALLBACK_POOL.length)];
}

export async function createKeyword(text: string): Promise<Keyword> {
  const db = getDbOrThrow();
  const now = Date.now();
  const data: Omit<Keyword, "id"> = {
    keyword: text.trim().slice(0, 30),
    suggestedAt: now,
    yEssay: null,
    hEssay: null,
    status: "waiting",
  };
  const ref = await db.collection(COLLECTION).add(data);
  return { id: ref.id, ...data };
}

export type WriteKeywordEssayInput = {
  keywordId: string;
  author: UserId;
  title: string;
  content: string;
};

export type WriteResult =
  | { ok: true; keyword: Keyword }
  | { ok: false; error: string; code: number };

export async function updateKeywordWord(
  id: string,
  text: string
): Promise<void> {
  const db = getDbOrThrow();
  await db
    .collection(COLLECTION)
    .doc(id)
    .update({ keyword: text.trim().slice(0, 30) });
}

export async function updateKeywordEssayContent(
  id: string,
  author: UserId,
  title: string,
  content: string
): Promise<{ ok: boolean; error?: string }> {
  const db = getDbOrThrow();
  const ref = db.collection(COLLECTION).doc(id);
  const doc = await ref.get();
  if (!doc.exists) return { ok: false, error: "키워드를 찾을 수 없어요" };
  const data = doc.data() as Keyword;
  const mine = author === "Y" ? data.yEssay : data.hEssay;
  if (!mine) return { ok: false, error: "아직 쓴 글이 없어요" };
  const cleanTitle = title.trim().slice(0, 100);
  const cleanContent = content.slice(0, MAX_CONTENT_LEN);
  if (!cleanTitle) return { ok: false, error: "제목을 적어주세요" };
  if (!cleanContent.replace(/<[^>]+>/g, "").trim())
    return { ok: false, error: "본문을 적어주세요" };
  const next = { ...mine, title: cleanTitle, content: cleanContent };
  const patch =
    author === "Y" ? { yEssay: next } : { hEssay: next };
  await ref.update(patch);
  return { ok: true };
}

export async function deleteKeywordEssay(
  id: string,
  author: UserId
): Promise<void> {
  const db = getDbOrThrow();
  const ref = db.collection(COLLECTION).doc(id);
  const doc = await ref.get();
  if (!doc.exists) return;
  const data = doc.data() as Keyword;
  const yEssay = author === "Y" ? null : data.yEssay;
  const hEssay = author === "H" ? null : data.hEssay;
  const status = computeStatus(yEssay, hEssay);
  await ref.update({ yEssay, hEssay, status });
}

/** 키워드 전체 삭제(두 사람 글 모두 사라짐). ActionRequest 승인 후에만 호출. */
export async function deleteKeyword(id: string): Promise<void> {
  const db = getDbOrThrow();
  await db.collection(COLLECTION).doc(id).delete();
}

export async function writeKeywordEssay(
  input: WriteKeywordEssayInput
): Promise<WriteResult> {
  const db = getDbOrThrow();
  const title = input.title.trim().slice(0, 100);
  const content = input.content.slice(0, MAX_CONTENT_LEN);
  if (!title) return { ok: false, error: "제목을 적어주세요", code: 400 };
  const plain = content.replace(/<[^>]+>/g, "").trim();
  if (!plain) return { ok: false, error: "본문을 적어주세요", code: 400 };

  const ref = db.collection(COLLECTION).doc(input.keywordId);
  const doc = await ref.get();
  if (!doc.exists)
    return { ok: false, error: "키워드를 찾을 수 없어요", code: 404 };
  const k = { id: doc.id, ...(doc.data() as Omit<Keyword, "id">) } as Keyword;

  const existing = input.author === "Y" ? k.yEssay : k.hEssay;
  if (existing)
    return { ok: false, error: "이미 작성한 글이 있어요", code: 400 };

  const now = Date.now();
  const essay: KeywordEssay = { title, content, writtenAt: now };
  const yEssay = input.author === "Y" ? essay : k.yEssay;
  const hEssay = input.author === "H" ? essay : k.hEssay;
  const status = computeStatus(yEssay, hEssay);

  await ref.update({ yEssay, hEssay, status });
  return { ok: true, keyword: { ...k, yEssay, hEssay, status } };
}
