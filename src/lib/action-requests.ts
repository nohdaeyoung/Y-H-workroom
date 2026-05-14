import "server-only";
import { getDb, getDbOrThrow } from "@/lib/firebase-admin";
import type {
  ActionRequest,
  ActionRequestKind,
  UserId,
} from "@/types/domain";

const COLLECTION = "actionRequests";

export type CreateActionRequestInput = {
  kind: ActionRequestKind;
  targetId: string;
  targetLabel: string;
  requester: UserId;
  payload?: Record<string, unknown>;
};

export async function createActionRequest(
  input: CreateActionRequestInput
): Promise<ActionRequest> {
  const db = getDbOrThrow();
  const now = Date.now();
  const data: Omit<ActionRequest, "id"> = {
    kind: input.kind,
    targetId: input.targetId,
    targetLabel: input.targetLabel.slice(0, 200),
    requester: input.requester,
    payload: input.payload,
    status: "pending",
    createdAt: now,
    resolvedAt: null,
    resolvedBy: null,
  };
  const ref = await db.collection(COLLECTION).add(data);
  return { id: ref.id, ...data };
}

/**
 * 동일한 (kind, targetId)에 대한 pending 요청이 이미 있는지 확인.
 * 중복 요청 방지용.
 */
export async function findPendingRequest(
  kind: ActionRequestKind,
  targetId: string
): Promise<ActionRequest | null> {
  const db = getDb();
  if (!db) return null;
  // 2개 where까지만 사용 → status 필터는 코드에서 (composite index 회피).
  const snap = await db
    .collection(COLLECTION)
    .where("kind", "==", kind)
    .where("targetId", "==", targetId)
    .limit(20)
    .get();
  if (snap.empty) return null;
  const pending = snap.docs
    .map((d) => ({ id: d.id, ...(d.data() as Omit<ActionRequest, "id">) }))
    .find((r) => r.status === "pending");
  return pending ?? null;
}

export async function listPendingRequests(): Promise<ActionRequest[]> {
  const db = getDb();
  if (!db) return [];
  // 복합 인덱스 회피 — 단일 필드 orderBy 후 코드에서 status 필터.
  const snap = await db
    .collection(COLLECTION)
    .orderBy("createdAt", "desc")
    .limit(200)
    .get();
  const all = snap.docs.map(
    (d) => ({ id: d.id, ...(d.data() as Omit<ActionRequest, "id">) })
  );
  return all.filter((r) => r.status === "pending");
}

/**
 * 최근 처리된 요청 (status != pending). resolvedAt 내림차순.
 * 인덱스 회피를 위해 createdAt orderBy 후 코드 정렬.
 */
export async function listResolvedRequests(limit = 30): Promise<ActionRequest[]> {
  const db = getDb();
  if (!db) return [];
  const snap = await db
    .collection(COLLECTION)
    .orderBy("createdAt", "desc")
    .limit(200)
    .get();
  const all = snap.docs.map(
    (d) => ({ id: d.id, ...(d.data() as Omit<ActionRequest, "id">) })
  );
  return all
    .filter((r) => r.status !== "pending")
    .sort((a, b) => (b.resolvedAt ?? 0) - (a.resolvedAt ?? 0))
    .slice(0, limit);
}

export async function getActionRequest(
  id: string
): Promise<ActionRequest | null> {
  const db = getDb();
  if (!db) return null;
  const doc = await db.collection(COLLECTION).doc(id).get();
  if (!doc.exists) return null;
  return { id: doc.id, ...(doc.data() as Omit<ActionRequest, "id">) };
}

export async function resolveActionRequest(
  id: string,
  resolver: UserId,
  decision: "approved" | "rejected" | "cancelled"
): Promise<void> {
  const db = getDbOrThrow();
  await db.collection(COLLECTION).doc(id).update({
    status: decision,
    resolvedAt: Date.now(),
    resolvedBy: resolver,
  });
}
