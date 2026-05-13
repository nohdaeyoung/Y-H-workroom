import "server-only";
import { getDb, getDbOrThrow } from "@/lib/firebase-admin";
import type { Comment } from "@/types/domain";

const COLLECTION = "comments";

// dev fallback — 프로세스 메모리 (재시작 시 사라짐)
const memStore = new Map<string, Comment[]>();

function key(parentType: Comment["parentType"], parentId: string) {
  return `${parentType}:${parentId}`;
}

export async function listComments(
  parentType: Comment["parentType"],
  parentId: string
): Promise<Comment[]> {
  const db = getDb();
  if (!db) {
    return memStore.get(key(parentType, parentId)) ?? [];
  }
  const snap = await db
    .collection(COLLECTION)
    .where("parentType", "==", parentType)
    .where("parentId", "==", parentId)
    .orderBy("createdAt", "asc")
    .get();
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as Comment));
}

export async function createComment(
  input: Omit<Comment, "id" | "createdAt">
): Promise<Comment> {
  const now = Date.now();
  const db = getDb();

  if (!db) {
    const id = `mem-${now}-${Math.random().toString(36).slice(2, 8)}`;
    const c: Comment = { id, ...input, createdAt: now };
    const k = key(input.parentType, input.parentId);
    memStore.set(k, [...(memStore.get(k) ?? []), c]);
    return c;
  }

  const ref = await getDbOrThrow()
    .collection(COLLECTION)
    .add({ ...input, createdAt: now });
  return { id: ref.id, ...input, createdAt: now };
}
