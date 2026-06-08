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
  // 솔로 모드: 사진을 올린 사람이 글도 씀.
  const data: Omit<Photostory, "id"> = {
    photoAuthor: input.photoAuthor,
    textAuthor: input.photoAuthor,
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

export type UpdatePhotostoryInput = {
  photoTitle?: string;
  photos?: string[];
  text?: string | null;
};

export async function updatePhotostory(
  id: string,
  uid: UserId,
  patch: UpdatePhotostoryInput
): Promise<{ ok: boolean; error?: string }> {
  const db = getDbOrThrow();
  const ref = db.collection(COLLECTION).doc(id);
  const doc = await ref.get();
  if (!doc.exists) return { ok: false, error: "찾을 수 없어요" };
  const p = { id: doc.id, ...(doc.data() as Omit<Photostory, "id">) } as Photostory;

  const update: Record<string, unknown> = {};

  if (patch.photoTitle !== undefined || patch.photos !== undefined) {
    if (p.photoAuthor !== uid)
      return { ok: false, error: "사진 작성자만 사진/제목을 수정할 수 있어요" };
    if (patch.photoTitle !== undefined)
      update.photoTitle = patch.photoTitle.trim().slice(0, 100);
    if (patch.photos !== undefined) {
      if (patch.photos.length === 0)
        return { ok: false, error: "사진은 1장 이상" };
      update.photos = patch.photos.slice(0, 5);
    }
  }

  if (patch.text !== undefined) {
    if (p.textAuthor !== uid)
      return { ok: false, error: "글 작성자만 글을 수정할 수 있어요" };
    if (patch.text === null) {
      update.text = null;
      update.textWrittenAt = null;
      update.status = "waiting";
    } else {
      const plain = patch.text.replace(/<[^>]+>/g, "").trim();
      if (!plain) return { ok: false, error: "내용을 적어주세요" };
      if (patch.text.length > 10000)
        return { ok: false, error: "본문이 너무 길어요" };
      update.text = patch.text;
      if (!p.textWrittenAt) {
        update.textWrittenAt = Date.now();
        update.status = "completed";
      }
    }
  }

  if (Object.keys(update).length === 0)
    return { ok: false, error: "변경 사항이 없어요" };

  await ref.update(update);
  return { ok: true };
}

export async function deletePhotostory(id: string): Promise<void> {
  const db = getDbOrThrow();
  await db.collection(COLLECTION).doc(id).delete();
}

/** 사진+글 상태 수동 전환. ActionRequest 승인 후에만 호출. */
export async function setPhotostoryStatus(
  id: string,
  status: "waiting" | "completed"
): Promise<void> {
  const db = getDbOrThrow();
  await db.collection(COLLECTION).doc(id).update({ status });
}
