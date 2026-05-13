import "server-only";
import { getDb, getDbOrThrow } from "@/lib/firebase-admin";
import { MOCK_RELAYS } from "@/lib/mock-relays";
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
  await ref.collection("sentences").add({
    order: 0,
    text,
    author: input.author,
    createdAt: now,
  });
  return { id: ref.id, ...relayData };
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
  if (relay.lastAuthor === input.author)
    return {
      ok: false,
      error: "직전 작성자입니다. 상대를 기다려 주세요.",
      code: 409,
    };

  const now = Date.now();
  const newOrder = relay.sentenceCount;
  const sentenceRef = await ref.collection("sentences").add({
    order: newOrder,
    text,
    author: input.author,
    createdAt: now,
  });

  // 완결 동의 토글: 이 작성자의 동의 플래그 누적
  const yAgreed =
    input.agreeComplete && input.author === "Y" ? true : relay.yAgreed;
  const hAgreed =
    input.agreeComplete && input.author === "H" ? true : relay.hAgreed;
  const status: Relay["status"] = yAgreed && hAgreed ? "completed" : "ongoing";

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
  const status: Relay["status"] = yAgreed && hAgreed ? "completed" : "ongoing";
  const patch: Partial<Relay> = {
    yAgreed,
    hAgreed,
    status,
    updatedAt: Date.now(),
  };
  await ref.update(patch);
  return { ...relay, ...patch } as Relay;
}
