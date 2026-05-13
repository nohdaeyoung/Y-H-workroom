import "server-only";
import { getDb, getDbOrThrow } from "@/lib/firebase-admin";
import type {
  Bookclub,
  BookclubStatus,
  BookclubTranscriptLine,
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
      audioUrl: null,
      transcript: m.transcript,
      status: "published" as BookclubStatus,
      createdAt: Date.now(),
      publishedAt: Date.now(),
    }));
  }
  let q: FirebaseFirestore.Query = db
    .collection(COLLECTION)
    .orderBy("createdAt", "desc")
    .limit(100);
  if (!opts.includeDrafts) {
    q = q.where("status", "==", "published");
  }
  const snap = await q.get();
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as Bookclub));
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
          audioUrl: null,
          transcript: m.transcript,
          status: "published",
          createdAt: Date.now(),
          publishedAt: Date.now(),
        }
      : null;
  }
  const doc = await db.collection(COLLECTION).doc(id).get();
  if (!doc.exists) return null;
  return { id: doc.id, ...doc.data() } as Bookclub;
}

export type CreateBookclubDraftInput = {
  bookTitle: string;
  bookAuthor: string;
  meetingDate: string;
  duration?: string;
};

export async function createBookclubDraft(
  input: CreateBookclubDraftInput
): Promise<Bookclub> {
  const db = getDbOrThrow();
  const now = Date.now();
  const data: Omit<Bookclub, "id"> = {
    bookTitle: input.bookTitle.trim(),
    bookAuthor: input.bookAuthor.trim(),
    meetingDate: input.meetingDate,
    duration: input.duration ?? "",
    audioUrl: null,
    transcript: [],
    status: "review",
    createdAt: now,
    publishedAt: null,
  };
  const ref = await db.collection(COLLECTION).add(data);
  return { id: ref.id, ...data };
}

export async function updateBookclubTranscript(
  id: string,
  transcript: BookclubTranscriptLine[]
): Promise<void> {
  const db = getDbOrThrow();
  await db.collection(COLLECTION).doc(id).update({ transcript });
}

export async function publishBookclub(id: string): Promise<void> {
  const db = getDbOrThrow();
  await db
    .collection(COLLECTION)
    .doc(id)
    .update({ status: "published", publishedAt: Date.now() });
}

export async function unpublishBookclub(id: string): Promise<void> {
  const db = getDbOrThrow();
  await db
    .collection(COLLECTION)
    .doc(id)
    .update({ status: "review", publishedAt: null });
}
