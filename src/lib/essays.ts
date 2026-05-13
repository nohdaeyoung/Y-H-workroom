import "server-only";
import { getDb, getDbOrThrow } from "@/lib/firebase-admin";
import { MOCK_ESSAYS } from "@/lib/mock-essays";
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
    return filterMock(MOCK_ESSAYS, opts);
  }

  let q: FirebaseFirestore.Query = db
    .collection(COLLECTION)
    .orderBy("createdAt", "desc");

  if (opts.author) q = q.where("author", "==", opts.author);
  if (opts.status) {
    if (Array.isArray(opts.status)) q = q.where("status", "in", opts.status);
    else q = q.where("status", "==", opts.status);
  }
  if (opts.limit) q = q.limit(opts.limit);

  const snap = await q.get();
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as Essay));
}

export async function getEssay(id: string): Promise<Essay | null> {
  const db = getDb();
  if (!db) {
    if (!isDev()) return null;
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
