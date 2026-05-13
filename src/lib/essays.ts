import "server-only";
import { getDb, getDbOrThrow } from "@/lib/firebase-admin";
import type { Essay, EssayStatus, UserId } from "@/types/domain";

const COLLECTION = "essays";

type ListOpts = {
  author?: UserId;
  status?: EssayStatus | EssayStatus[];
  limit?: number;
};

function isDev() {
  return process.env.NODE_ENV !== "production";
}

export async function listEssays(opts: ListOpts = {}): Promise<Essay[]> {
  const db = getDb();
  if (!db) {
    if (!isDev()) return [];
    const { MOCK_ESSAYS } = await import("@/lib/mock-essays");
    return filterMock(MOCK_ESSAYS, opts);
  }

  // 단일 필드 orderBy만 사용 (createdAt) — 자동 인덱스로 항상 작동.
  // status / author 필터는 client-side에서 적용.
  // 대용량으로 가면 firestore.indexes.json의 복합 인덱스를 deploy해서
  // 서버 사이드 .where()로 옮기는 것을 권장.
  const snap = await db
    .collection(COLLECTION)
    .orderBy("createdAt", "desc")
    .limit((opts.limit ?? 50) * 3)
    .get();

  let docs = snap.docs.map((d) => ({ id: d.id, ...d.data() } as Essay));

  if (opts.author) docs = docs.filter((e) => e.author === opts.author);
  if (opts.status) {
    const arr = Array.isArray(opts.status) ? opts.status : [opts.status];
    docs = docs.filter((e) => arr.includes(e.status));
  }
  if (opts.limit) docs = docs.slice(0, opts.limit);
  return docs;
}

export async function getEssay(id: string): Promise<Essay | null> {
  const db = getDb();
  if (!db) {
    if (!isDev()) return null;
    const { MOCK_ESSAYS } = await import("@/lib/mock-essays");
    return MOCK_ESSAYS.find((e) => e.id === id) ?? null;
  }
  const doc = await db.collection(COLLECTION).doc(id).get();
  if (!doc.exists) return null;
  return { id: doc.id, ...doc.data() } as Essay;
}

export async function createEssay(
  input: Omit<Essay, "id" | "createdAt" | "updatedAt">
): Promise<Essay> {
  const db = getDbOrThrow();
  const now = Date.now();
  const data = { ...input, createdAt: now, updatedAt: now };
  const ref = await db.collection(COLLECTION).add(data);
  return { id: ref.id, ...data };
}

export async function updateEssay(
  id: string,
  patch: Partial<Omit<Essay, "id" | "author" | "createdAt">>
): Promise<void> {
  const db = getDbOrThrow();
  await db
    .collection(COLLECTION)
    .doc(id)
    .update({ ...patch, updatedAt: Date.now() });
}

export async function deleteEssay(id: string): Promise<void> {
  const db = getDbOrThrow();
  await db.collection(COLLECTION).doc(id).delete();
}

function filterMock(items: Essay[], opts: ListOpts): Essay[] {
  let out = items;
  if (opts.author) out = out.filter((e) => e.author === opts.author);
  if (opts.status) {
    const arr = Array.isArray(opts.status) ? opts.status : [opts.status];
    out = out.filter((e) => arr.includes(e.status));
  }
  out = [...out].sort((a, b) => b.createdAt - a.createdAt);
  if (opts.limit) out = out.slice(0, opts.limit);
  return out;
}
