import "server-only";
import { getDb, getDbOrThrow } from "@/lib/firebase-admin";
import type { MOCK_RELAYS } from "@/lib/mock-relays";
import type {
  Relay,
  RelaySentence,
  RelayWithSentences,
  UserId,
} from "@/types/domain";

const COLLECTION = "relays";
const MAX_TEXT_LEN = 200;

function isDev() {
  return process.env.NODE_ENV !== "production";
}

function mockToRelay(m: (typeof MOCK_RELAYS)[number]): Relay {
  return {
    id: m.id,
    title: m.title,
    status: m.status,
    yAgreed: m.yAgreed,
    hAgreed: m.hAgreed,
    sentenceCount: m.sentences.length,
    firstSentenceText: m.sentences[0]?.text ?? "",
    lastSentenceText: m.sentences[m.sentences.length - 1]?.text ?? "",
    lastAuthor: (m.sentences[m.sentences.length - 1]?.author ?? "Y") as UserId,
    createdAt: m.createdAt,
    updatedAt: m.updatedAt,
  };
}

function mockToWithSentences(
  m: (typeof MOCK_RELAYS)[number]
): RelayWithSentences {
  return {
    ...mockToRelay(m),
    sentences: m.sentences.map((s, i) => ({
      id: `mock-s-${i}`,
      order: i,
      text: s.text,
      author: s.author,
      createdAt: s.createdAt,
    })),
  };
}

export async function listRelays(): Promise<Relay[]> {
  const db = getDb();
  if (!db) {
    if (!isDev()) return [];
    const { MOCK_RELAYS } = await import("@/lib/mock-relays");
    return MOCK_RELAYS.map(mockToRelay).sort(
      (a, b) => b.updatedAt - a.updatedAt
    );
  }
  const snap = await db
    .collection(COLLECTION)
    .orderBy("updatedAt", "desc")
    .limit(100)
    .get();
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as Relay));
}

export async function getRelayWithSentences(
  id: string
): Promise<RelayWithSentences | null> {
  const db = getDb();
  if (!db) {
    if (!isDev()) return null;
    const { MOCK_RELAYS } = await import("@/lib/mock-relays");
    const m = MOCK_RELAYS.find((r) => r.id === id);
    return m ? mockToWithSentences(m) : null;
  }
  const doc = await db.collection(COLLECTION).doc(id).get();
  if (!doc.exists) return null;
  const sentSnap = await doc.ref
    .collection("sentences")
    .orderBy("order", "asc")
    .get();
  return {
    id: doc.id,
    ...(doc.data() as Omit<Relay, "id">),
    sentences: sentSnap.docs.map(
      (s) => ({ id: s.id, ...s.data() } as RelaySentence)
    ),
  };
}

export type CreateRelayInput = {
  title: string;
  firstSentence: string;
  author: UserId;
  /** true면 첫 문장을 AI가 쓴 것으로 기록. */
  firstSource?: "ai";
};

export async function createRelay(input: CreateRelayInput): Promise<Relay> {
  const db = getDbOrThrow();
  const now = Date.now();
  const text = input.firstSentence.trim().slice(0, MAX_TEXT_LEN);
  if (!text) throw new Error("첫 문장이 비어 있어요");
  const title = input.title.trim() || "(제목 없음)";

  const relayData: Omit<Relay, "id"> = {
    title,
    status: "ongoing",
    yAgreed: false,
    hAgreed: false,
    sentenceCount: 1,
    firstSentenceText: text,
    lastSentenceText: text,
    lastAuthor: input.author,
    createdAt: now,
    updatedAt: now,
  };
  const ref = await db.collection(COLLECTION).add(relayData);
  const sentenceData: {
    order: number;
    text: string;
    author: UserId;
    createdAt: number;
    source?: "ai";
  } = {
    order: 0,
    text,
    author: input.author,
    createdAt: now,
  };
  if (input.firstSource === "ai") sentenceData.source = "ai";
  await ref.collection("sentences").add(sentenceData);
  return { id: ref.id, ...relayData };
}

/**
 * AI 문장 한 줄을 마지막에 덧붙임. 사용자 차례 직후 호출.
 * author 필드는 "H" 슬롯에 저장하지만 source: "ai"로 구분.
 */
export async function appendAiSentence(
  relayId: string,
  text: string
): Promise<{ ok: boolean; error?: string }> {
  const db = getDbOrThrow();
  const trimmed = text.trim().slice(0, MAX_TEXT_LEN);
  if (!trimmed) return { ok: false, error: "AI 문장이 비어 있어요" };

  const ref = db.collection(COLLECTION).doc(relayId);
  const doc = await ref.get();
  if (!doc.exists) return { ok: false, error: "이어쓰기를 찾을 수 없어요" };
  const relay = { id: doc.id, ...(doc.data() as Omit<Relay, "id">) } as Relay;
  if (relay.status === "completed")
    return { ok: false, error: "이미 완결된 글이에요" };

  const now = Date.now();
  const newOrder = relay.sentenceCount;
  await ref.collection("sentences").add({
    order: newOrder,
    text: trimmed,
    author: "H" as UserId,
    source: "ai",
    createdAt: now,
  });
  await ref.update({
    sentenceCount: newOrder + 1,
    lastSentenceText: trimmed,
    lastAuthor: "H",
    updatedAt: now,
  });
  return { ok: true };
}

/**
 * 마지막 문장이 AI 문장일 때 텍스트만 교체 (재생성).
 */
export async function replaceLastAiSentence(
  relayId: string,
  newText: string
): Promise<{ ok: boolean; error?: string }> {
  const db = getDbOrThrow();
  const trimmed = newText.trim().slice(0, MAX_TEXT_LEN);
  if (!trimmed) return { ok: false, error: "새 문장이 비어 있어요" };

  const ref = db.collection(COLLECTION).doc(relayId);
  const snap = await ref
    .collection("sentences")
    .orderBy("order", "desc")
    .limit(1)
    .get();
  if (snap.empty) return { ok: false, error: "문장이 없어요" };
  const lastDoc = snap.docs[0];
  const lastData = lastDoc.data() as RelaySentence;
  if (lastData.source !== "ai")
    return { ok: false, error: "마지막 문장이 AI 문장이 아니에요" };

  await lastDoc.ref.update({ text: trimmed });
  await ref.update({ lastSentenceText: trimmed, updatedAt: Date.now() });
  return { ok: true };
}

/**
 * AI 컨텍스트용: 최근 N개 문장 (오래된 → 최신).
 */
export async function getRecentSentences(
  relayId: string,
  limit = 20
): Promise<RelaySentence[]> {
  const db = getDbOrThrow();
  const snap = await db
    .collection(COLLECTION)
    .doc(relayId)
    .collection("sentences")
    .orderBy("order", "desc")
    .limit(limit)
    .get();
  const arr = snap.docs.map(
    (d) => ({ id: d.id, ...d.data() } as RelaySentence)
  );
  return arr.sort((a, b) => a.order - b.order);
}

export type AppendSentenceInput = {
  relayId: string;
  author: UserId;
  text: string;
  agreeComplete: boolean;
};

export type AppendResult =
  | { ok: true; sentence: RelaySentence; relay: Relay }
  | { ok: false; error: string; code: number };

export async function appendSentence(
  input: AppendSentenceInput
): Promise<AppendResult> {
  const db = getDbOrThrow();
  const text = input.text.trim().slice(0, MAX_TEXT_LEN);
  if (!text) return { ok: false, error: "내용을 적어주세요", code: 400 };

  const ref = db.collection(COLLECTION).doc(input.relayId);
  const doc = await ref.get();
  if (!doc.exists)
    return { ok: false, error: "이어쓰기를 찾을 수 없어요", code: 404 };
  const relay = { id: doc.id, ...(doc.data() as Omit<Relay, "id">) } as Relay;

  if (relay.status === "completed")
    return { ok: false, error: "이미 완결된 글이에요", code: 400 };
  // 솔로 모드: 같은 작성자가 계속 이어쓸 수 있음.

  const now = Date.now();
  const newOrder = relay.sentenceCount;
  const sentenceRef = await ref.collection("sentences").add({
    order: newOrder,
    text,
    author: input.author,
    createdAt: now,
  });

  // 솔로 모드: 작성자 본인이 완결 동의하면 즉시 완결.
  const yAgreed =
    input.agreeComplete && input.author === "Y" ? true : relay.yAgreed;
  const hAgreed =
    input.agreeComplete && input.author === "H" ? true : relay.hAgreed;
  const status: Relay["status"] =
    input.agreeComplete ? "completed" : relay.status;

  const patch: Partial<Relay> = {
    sentenceCount: newOrder + 1,
    lastSentenceText: text,
    lastAuthor: input.author,
    updatedAt: now,
    yAgreed,
    hAgreed,
    status,
  };
  await ref.update(patch);

  return {
    ok: true,
    sentence: {
      id: sentenceRef.id,
      order: newOrder,
      text,
      author: input.author,
      createdAt: now,
    },
    relay: { ...relay, ...patch } as Relay,
  };
}

export async function updateRelayTitle(
  id: string,
  title: string
): Promise<void> {
  const db = getDbOrThrow();
  await db
    .collection(COLLECTION)
    .doc(id)
    .update({ title: title.trim().slice(0, 100), updatedAt: Date.now() });
}

export async function updateSentenceText(
  relayId: string,
  sentenceId: string,
  text: string,
  author: UserId
): Promise<{ ok: boolean; error?: string }> {
  const db = getDbOrThrow();
  const ref = db.collection(COLLECTION).doc(relayId);
  const sentRef = ref.collection("sentences").doc(sentenceId);
  const sentDoc = await sentRef.get();
  if (!sentDoc.exists)
    return { ok: false, error: "문장을 찾을 수 없어요" };
  const sentData = sentDoc.data() as { author: UserId; order: number };
  if (sentData.author !== author)
    return { ok: false, error: "본인 문장만 수정할 수 있어요" };
  const trimmed = text.trim().slice(0, 200);
  if (!trimmed) return { ok: false, error: "내용을 적어주세요" };
  await sentRef.update({ text: trimmed });
  // 마지막 문장이면 lastSentenceText 동기화
  const relay = (await ref.get()).data() as Relay | undefined;
  if (relay && sentData.order === relay.sentenceCount - 1) {
    await ref.update({ lastSentenceText: trimmed, updatedAt: Date.now() });
  } else if (sentData.order === 0) {
    await ref.update({ firstSentenceText: trimmed });
  }
  return { ok: true };
}

/**
 * 본인 문장 삭제. 삭제 후 order 재정렬 + sentenceCount / first / lastSentenceText 동기화.
 */
export async function deleteSentence(
  relayId: string,
  sentenceId: string,
  author: UserId
): Promise<{ ok: boolean; error?: string }> {
  const db = getDbOrThrow();
  const ref = db.collection(COLLECTION).doc(relayId);
  const sentRef = ref.collection("sentences").doc(sentenceId);
  const sentDoc = await sentRef.get();
  if (!sentDoc.exists) return { ok: false, error: "문장을 찾을 수 없어요" };
  const sentData = sentDoc.data() as { author: UserId; order: number };
  if (sentData.author !== author)
    return { ok: false, error: "본인 문장만 삭제할 수 있어요" };

  // 마지막 문장만 단독 삭제 가능. 중간/시작 문장은 흐름이 깨지므로 차단.
  const allSnap = await ref.collection("sentences").orderBy("order", "asc").get();
  const lastOrder = allSnap.size - 1;
  if (sentData.order !== lastOrder) {
    return {
      ok: false,
      error: "마지막 문장만 삭제할 수 있어요 (이후 문장 흐름이 깨져요)",
    };
  }

  await sentRef.delete();

  // 남은 문장으로 relay 메타 동기화
  const remaining = allSnap.docs.filter((d) => d.id !== sentenceId);
  const batch = db.batch();
  if (remaining.length === 0) {
    // 마지막 문장까지 사라지면 빈 relay 잔존 방지 — relay 자체 삭제
    batch.delete(ref);
  } else {
    const first = remaining[0].data() as RelaySentence;
    const last = remaining[remaining.length - 1].data() as RelaySentence;
    batch.update(ref, {
      sentenceCount: remaining.length,
      firstSentenceText: first.text,
      lastSentenceText: last.text,
      lastAuthor: last.author,
      updatedAt: Date.now(),
    });
  }
  await batch.commit();
  return { ok: true };
}

export async function deleteRelay(relayId: string): Promise<void> {
  const db = getDbOrThrow();
  const ref = db.collection(COLLECTION).doc(relayId);
  const sents = await ref.collection("sentences").get();
  const batch = db.batch();
  sents.docs.forEach((d) => batch.delete(d.ref));
  batch.delete(ref);
  await batch.commit();
}

/** ongoing↔completed 직접 전환. ActionRequest 승인 후에만 호출. */
export async function setRelayStatus(
  relayId: string,
  status: "ongoing" | "completed"
): Promise<void> {
  const db = getDbOrThrow();
  await db
    .collection(COLLECTION)
    .doc(relayId)
    .update({ status, updatedAt: Date.now() });
}

export async function toggleAgree(
  relayId: string,
  author: UserId,
  agreed: boolean
): Promise<Relay | null> {
  const db = getDbOrThrow();
  const ref = db.collection(COLLECTION).doc(relayId);
  const doc = await ref.get();
  if (!doc.exists) return null;
  const relay = { id: doc.id, ...(doc.data() as Omit<Relay, "id">) } as Relay;

  const yAgreed = author === "Y" ? agreed : relay.yAgreed;
  const hAgreed = author === "H" ? agreed : relay.hAgreed;
  // 솔로 모드: 작성자 본인의 동의로 완결 토글.
  const status: Relay["status"] = agreed ? "completed" : "ongoing";
  const patch: Partial<Relay> = {
    yAgreed,
    hAgreed,
    status,
    updatedAt: Date.now(),
  };
  await ref.update(patch);
  return { ...relay, ...patch } as Relay;
}
