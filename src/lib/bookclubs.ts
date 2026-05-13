import "server-only";
import { getDb, getDbOrThrow } from "@/lib/firebase-admin";
import {
  normalizeBookclubStatus,
  type Bookclub,
  type BookclubStatus,
  type BookclubTranscriptLine,
  type UserId,
} from "@/types/domain";

const COLLECTION = "bookclubs";

function isDev() {
  return process.env.NODE_ENV !== "production";
}

export async function listBookclubs(
  opts: { includeDrafts?: boolean } = {}
): Promise<Bookclub[]> {
  const db = getDb();
  if (!db) {
    if (!isDev()) return [];
    const { MOCK_BOOKCLUBS } = await import("@/lib/mock-bookclubs");
    return MOCK_BOOKCLUBS.map((m) => ({
      id: m.id,
      bookTitle: m.bookTitle,
      bookAuthor: m.bookAuthor,
      meetingDate: m.meetingDate,
      duration: m.duration,
      coverUrl: null,
      audioUrl: null,
      transcript: m.transcript,
      yImpression: null,
      hImpression: null,
      quotes: [],
      status: "met" as BookclubStatus,
      createdAt: Date.now(),
      publishedAt: Date.now(),
    }));
  }
  // status 필터는 코드에서 적용 (복합 인덱스 회피)
  const snap = await db
    .collection(COLLECTION)
    .orderBy("createdAt", "desc")
    .limit(200)
    .get();
  let docs = snap.docs.map((d) => {
    const raw = { id: d.id, ...d.data() } as Bookclub;
    return { ...raw, status: normalizeBookclubStatus(raw.status) };
  });
  if (!opts.includeDrafts) {
    // 방문자: reading은 숨김. met/finished만 공개
    docs = docs.filter((b) => b.status !== "reading");
  }
  return docs;
}

export async function getBookclub(id: string): Promise<Bookclub | null> {
  const db = getDb();
  if (!db) {
    if (!isDev()) return null;
    const { MOCK_BOOKCLUBS } = await import("@/lib/mock-bookclubs");
    const m = MOCK_BOOKCLUBS.find((b) => b.id === id);
    return m
      ? {
          id: m.id,
          bookTitle: m.bookTitle,
          bookAuthor: m.bookAuthor,
          meetingDate: m.meetingDate,
          duration: m.duration,
          coverUrl: null,
          audioUrl: null,
          transcript: m.transcript,
          yImpression: null,
          hImpression: null,
          quotes: [],
          status: "met",
          createdAt: Date.now(),
          publishedAt: Date.now(),
        }
      : null;
  }
  const doc = await db.collection(COLLECTION).doc(id).get();
  if (!doc.exists) return null;
  const raw = { id: doc.id, ...doc.data() } as Bookclub;
  return { ...raw, status: normalizeBookclubStatus(raw.status) };
}

export type CreateBookclubDraftInput = {
  bookTitle: string;
  bookAuthor: string;
  meetingDate: string;
  duration?: string;
  coverUrl?: string | null;
  status?: BookclubStatus;
};

export async function createBookclubDraft(
  input: CreateBookclubDraftInput
): Promise<Bookclub> {
  const db = getDbOrThrow();
  const now = Date.now();
  const status: BookclubStatus = input.status ?? "reading";
  const data: Omit<Bookclub, "id"> = {
    bookTitle: input.bookTitle.trim(),
    bookAuthor: input.bookAuthor.trim(),
    meetingDate: input.meetingDate,
    duration: input.duration ?? "",
    coverUrl: input.coverUrl ?? null,
    audioUrl: null,
    transcript: [],
    yImpression: null,
    hImpression: null,
    quotes: [],
    status,
    createdAt: now,
    publishedAt: status === "reading" ? null : now,
  };
  const ref = await db.collection(COLLECTION).add(data);
  return { id: ref.id, ...data };
}

export async function updateBookclubCover(
  id: string,
  coverUrl: string | null
): Promise<void> {
  const db = getDbOrThrow();
  await db.collection(COLLECTION).doc(id).update({ coverUrl });
}

export type UpdateBookclubMetaInput = {
  bookTitle?: string;
  bookAuthor?: string;
  meetingDate?: string;
  duration?: string;
};

export async function updateBookclubMeta(
  id: string,
  patch: UpdateBookclubMetaInput
): Promise<void> {
  const db = getDbOrThrow();
  const update: Record<string, unknown> = {};
  if (patch.bookTitle !== undefined)
    update.bookTitle = patch.bookTitle.trim().slice(0, 200);
  if (patch.bookAuthor !== undefined)
    update.bookAuthor = patch.bookAuthor.trim().slice(0, 200);
  if (patch.meetingDate !== undefined)
    update.meetingDate = patch.meetingDate.trim().slice(0, 50);
  if (patch.duration !== undefined)
    update.duration = patch.duration.trim().slice(0, 50);
  if (Object.keys(update).length === 0) return;
  await db.collection(COLLECTION).doc(id).update(update);
}

// —— 소감 ——
export async function setBookclubImpression(
  id: string,
  author: UserId,
  impression: { title: string; content: string } | null
): Promise<{ ok: boolean; error?: string }> {
  const db = getDbOrThrow();
  const ref = db.collection(COLLECTION).doc(id);
  const doc = await ref.get();
  if (!doc.exists) return { ok: false, error: "찾을 수 없어요" };

  let next: import("@/types/domain").BookclubImpression | null = null;
  if (impression) {
    const title = impression.title.trim().slice(0, 200);
    const content = impression.content.slice(0, 20000);
    const plain = content.replace(/<[^>]+>/g, "").trim();
    if (!title) return { ok: false, error: "제목을 적어주세요" };
    if (!plain) return { ok: false, error: "본문을 적어주세요" };
    next = { title, content, writtenAt: Date.now() };
  }
  const field = author === "Y" ? "yImpression" : "hImpression";
  await ref.update({ [field]: next });
  return { ok: true };
}

// —— 인용 문장 ——
export async function addBookclubQuote(
  id: string,
  author: UserId,
  text: string,
  source: string
): Promise<{ ok: boolean; error?: string }> {
  const db = getDbOrThrow();
  const ref = db.collection(COLLECTION).doc(id);
  const doc = await ref.get();
  if (!doc.exists) return { ok: false, error: "찾을 수 없어요" };
  const t = text.trim();
  if (!t) return { ok: false, error: "문장을 적어주세요" };
  if (t.length > 2000) return { ok: false, error: "문장이 너무 길어요" };
  const data = doc.data() as Bookclub;
  const quote: import("@/types/domain").BookclubQuote = {
    id: `q-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    author,
    text: t,
    source: source.trim().slice(0, 100),
    createdAt: Date.now(),
  };
  const quotes = [...(data.quotes ?? []), quote];
  await ref.update({ quotes });
  return { ok: true };
}

export async function updateBookclubQuote(
  id: string,
  quoteId: string,
  author: UserId,
  text: string,
  source: string
): Promise<{ ok: boolean; error?: string }> {
  const db = getDbOrThrow();
  const ref = db.collection(COLLECTION).doc(id);
  const doc = await ref.get();
  if (!doc.exists) return { ok: false, error: "찾을 수 없어요" };
  const data = doc.data() as Bookclub;
  const quotes = [...(data.quotes ?? [])];
  const idx = quotes.findIndex((q) => q.id === quoteId);
  if (idx < 0) return { ok: false, error: "문장을 찾을 수 없어요" };
  if (quotes[idx].author !== author)
    return { ok: false, error: "본인 문장만 수정할 수 있어요" };
  const t = text.trim();
  if (!t) return { ok: false, error: "문장을 적어주세요" };
  quotes[idx] = {
    ...quotes[idx],
    text: t.slice(0, 2000),
    source: source.trim().slice(0, 100),
  };
  await ref.update({ quotes });
  return { ok: true };
}

export async function deleteBookclubQuote(
  id: string,
  quoteId: string,
  author: UserId
): Promise<{ ok: boolean; error?: string }> {
  const db = getDbOrThrow();
  const ref = db.collection(COLLECTION).doc(id);
  const doc = await ref.get();
  if (!doc.exists) return { ok: false, error: "찾을 수 없어요" };
  const data = doc.data() as Bookclub;
  const quotes = (data.quotes ?? []).filter((q) => {
    if (q.id !== quoteId) return true;
    return q.author !== author; // 본인 문장만 삭제
  });
  await ref.update({ quotes });
  return { ok: true };
}

export async function updateBookclubTranscript(
  id: string,
  transcript: BookclubTranscriptLine[]
): Promise<void> {
  const db = getDbOrThrow();
  await db.collection(COLLECTION).doc(id).update({ transcript });
}

export async function setBookclubStatus(
  id: string,
  status: BookclubStatus
): Promise<void> {
  const db = getDbOrThrow();
  const patch: Record<string, unknown> = { status };
  if (status === "reading") patch.publishedAt = null;
  else patch.publishedAt = Date.now();
  await db.collection(COLLECTION).doc(id).update(patch);
}

export async function publishBookclub(id: string): Promise<void> {
  await setBookclubStatus(id, "met");
}

export async function unpublishBookclub(id: string): Promise<void> {
  await setBookclubStatus(id, "reading");
}
