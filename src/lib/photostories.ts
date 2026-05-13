import "server-only";
import { getDb, getDbOrThrow } from "@/lib/firebase-admin";
import type { Photostory, UserId } from "@/types/domain";

const COLLECTION = "photostories";

function isDev() {
  return process.env.NODE_ENV !== "production";
}

export async function listPhotostories(
  opts: { includeWaiting?: boolean } = {}
): Promise<Photostory[]> {
  const db = getDb();
  if (!db) {
    if (!isDev()) return [];
    const { MOCK_PHOTOSTORIES } = await import("@/lib/mock-photostories");
    return MOCK_PHOTOSTORIES.map((m) => ({
      id: m.id,
      photoAuthor: m.photoAuthor,
      textAuthor: m.textAuthor,
      photoTitle: m.photoTitle,
      photos: [],
      photoUploadedAt: Date.now(),
      text: m.text,
      textWrittenAt: m.textWrittenAt ? Date.now() : null,
      status: m.status,
      createdAt: Date.now(),
    }));
  }
  const snap = await db
    .collection(COLLECTION)
    .orderBy("createdAt", "desc")
    .limit(100)
    .get();
  const all = snap.docs.map((d) => ({ id: d.id, ...d.data() } as Photostory));
  if (!opts.includeWaiting) return all.filter((p) => p.status === "completed");
  return all;
}

export async function getPhotostory(id: string): Promise<Photostory | null> {
  const db = getDb();
  if (!db) {
    if (!isDev()) return null;
    const { MOCK_PHOTOSTORIES } = await import("@/lib/mock-photostories");
    const m = MOCK_PHOTOSTORIES.find((p) => p.id === id);
    if (!m) return null;
    return {
      id: m.id,
      photoAuthor: m.photoAuthor,
      textAuthor: m.textAuthor,
      photoTitle: m.photoTitle,
      photos: [],
      photoUploadedAt: Date.now(),
      text: m.text,
      textWrittenAt: m.textWrittenAt ? Date.now() : null,
      status: m.status,
      createdAt: Date.now(),
    };
  }
  const doc = await db.collection(COLLECTION).doc(id).get();
  if (!doc.exists) return null;
  return { id: doc.id, ...doc.data() } as Photostory;
}

export type CreatePhotostoryInput = {
  photoAuthor: UserId;
  photoTitle: string;
  photos: string[];
};

export async function createPhotostory(
  input: CreatePhotostoryInput
): Promise<Photostory> {
  const db = getDbOrThrow();
  const now = Date.now();
  const data: Omit<Photostory, "id"> = {
    photoAuthor: input.photoAuthor,
    textAuthor: input.photoAuthor === "Y" ? "H" : "Y",
    photoTitle: input.photoTitle.trim().slice(0, 100),
    photos: input.photos.slice(0, 5),
    photoUploadedAt: now,
    text: null,
    textWrittenAt: null,
    status: "waiting",
    createdAt: now,
  };
  const ref = await db.collection(COLLECTION).add(data);
  return { id: ref.id, ...data };
}

export type WritePhotostoryTextResult =
  | { ok: true; photostory: Photostory }
  | { ok: false; error: string; code: number };

export async function writePhotostoryText(
  id: string,
  author: UserId,
  text: string
): Promise<WritePhotostoryTextResult> {
  const db = getDbOrThrow();
  const ref = db.collection(COLLECTION).doc(id);
  const doc = await ref.get();
  if (!doc.exists)
    return { ok: false, error: "사진+글을 찾을 수 없어요", code: 404 };
  const p = { id: doc.id, ...(doc.data() as Omit<Photostory, "id">) } as Photostory;
  if (p.textAuthor !== author)
    return { ok: false, error: "당신이 쓸 차례가 아니에요", code: 403 };
  if (p.status === "completed")
    return { ok: false, error: "이미 완성되어 있어요", code: 400 };

  const plain = text.replace(/<[^>]+>/g, "").trim();
  if (!plain) return { ok: false, error: "내용을 적어주세요", code: 400 };
  if (text.length > 10000)
    return { ok: false, error: "본문이 너무 길어요", code: 400 };

  const now = Date.now();
  await ref.update({
    text,
    textWrittenAt: now,
    status: "completed",
  });
  return {
    ok: true,
    photostory: { ...p, text, textWrittenAt: now, status: "completed" },
  };
}

export async function deletePhotostory(id: string): Promise<void> {
  const db = getDbOrThrow();
  await db.collection(COLLECTION).doc(id).delete();
}
