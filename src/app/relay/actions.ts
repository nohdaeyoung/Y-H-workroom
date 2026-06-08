"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import {
  appendAiSentence,
  appendSentence,
  createRelay,
  getRecentSentences,
  getRelayWithSentences,
  replaceLastAiSentence,
  toggleAgree,
} from "@/lib/relays";
import { generateRelaySentence } from "@/lib/relay-ai";
import { notifyOnActionRequest, notifyOnNewItem } from "@/lib/notifications";
import {
  createActionRequest,
  findPendingRequest,
} from "@/lib/action-requests";

export type RelayActionState = { error: string; ok?: boolean };

export type FirstSentenceState = {
  error: string;
  ok?: boolean;
  text?: string;
};

/**
 * 미리보기용: 제목으로 AI 첫 문장 생성. 아직 relay 저장 안 함.
 * formData 필드: title, rejectedDraft? (재생성 시).
 */
export async function generateFirstSentenceAction(
  _prev: FirstSentenceState,
  formData: FormData
): Promise<FirstSentenceState> {
  const session = await auth();
  const uid = session?.user?.id;
  if (uid !== "Y" && uid !== "H") return { error: "로그인이 필요해요" };

  const title = String(formData.get("title") ?? "").trim();
  if (!title) return { error: "제목을 먼저 적어주세요" };

  const rejected = String(formData.get("rejectedDraft") ?? "").trim();

  const res = await generateRelaySentence({
    title,
    prior: [],
    rejectedDraft: rejected || undefined,
  });
  if (!res.ok) return { error: res.error };
  return { error: "", ok: true, text: res.text };
}

export async function startRelayAction(
  _prev: RelayActionState,
  formData: FormData
): Promise<RelayActionState> {
  const session = await auth();
  const author = session?.user?.id;
  if (author !== "Y" && author !== "H") {
    return { error: "로그인이 필요해요" };
  }

  const title = String(formData.get("title") ?? "").trim();
  const first = String(formData.get("first") ?? "").trim();
  const firstSource = String(formData.get("firstSource") ?? "");
  if (!title) return { error: "제목을 적어주세요" };
  if (!first) return { error: "첫 문장을 적어주세요" };
  if (first.length > 200) return { error: "첫 문장은 200자 이내" };

  let relayId: string;
  try {
    const relay = await createRelay({
      title,
      firstSentence: first,
      author,
      firstSource: firstSource === "ai" ? "ai" : undefined,
    });
    relayId = relay.id;
  } catch (err) {
    console.error("startRelayAction failed:", err);
    return { error: "시작 중 문제가 생겼어요" };
  }

  void notifyOnNewItem({
    kind: "relay",
    actor: author,
    id: relayId,
    title,
    preview: first,
  });

  revalidatePath("/relay");
  redirect(`/relay/${relayId}`);
}

export async function appendSentenceAction(
  _prev: RelayActionState,
  formData: FormData
): Promise<RelayActionState> {
  const session = await auth();
  const author = session?.user?.id;
  if (author !== "Y" && author !== "H") {
    return { error: "로그인이 필요해요" };
  }
  const relayId = String(formData.get("relayId") ?? "");
  const text = String(formData.get("text") ?? "");
  const agreeComplete = formData.get("agreeComplete") === "on";
  /** "ai" = 다음 AI 차례를 자동으로 만들지 결정. 기본 자동. */
  const skipAi = formData.get("skipAi") === "on";
  if (!relayId) return { error: "잘못된 요청" };

  const res = await appendSentence({ relayId, author, text, agreeComplete });
  if (!res.ok) return { error: res.error };

  void notifyOnNewItem({
    kind: "relay",
    actor: author,
    id: relayId,
    title: text.slice(0, 60),
    preview: text,
  });

  // 완결이면 AI 차례를 만들지 않음.
  const completed = agreeComplete || res.relay.status === "completed";

  if (!skipAi && !completed) {
    const recent = await getRecentSentences(relayId, 20);
    const prior = recent.map((s) => ({
      text: s.text,
      bySource: s.source === "ai" ? ("ai" as const) : ("human" as const),
    }));
    const title = (await getRelayWithSentences(relayId))?.title ?? "";
    const ai = await generateRelaySentence({ title, prior });
    if (ai.ok) {
      await appendAiSentence(relayId, ai.text);
    } else {
      // AI 실패는 사용자 입력 자체는 성공으로 본다 — UI에서 대체 입력창 노출.
      console.warn("[appendSentenceAction] AI 응답 실패:", ai.error);
    }
  }

  revalidatePath(`/relay/${relayId}`);
  revalidatePath("/relay");
  return { error: "", ok: true };
}

/**
 * 마지막 AI 문장이 마음에 안 들 때 — 새로 생성해서 교체.
 */
export async function regenerateLastAiAction(
  _prev: RelayActionState,
  formData: FormData
): Promise<RelayActionState> {
  const session = await auth();
  const uid = session?.user?.id;
  if (uid !== "Y" && uid !== "H") return { error: "로그인이 필요해요" };
  const relayId = String(formData.get("relayId") ?? "");
  if (!relayId) return { error: "잘못된 요청" };

  const recent = await getRecentSentences(relayId, 20);
  if (recent.length === 0) return { error: "문장이 없어요" };
  const last = recent[recent.length - 1];
  if (last.source !== "ai")
    return { error: "마지막 문장이 AI 문장이 아니에요" };

  const priorWithoutLast = recent.slice(0, -1).map((s) => ({
    text: s.text,
    bySource: s.source === "ai" ? ("ai" as const) : ("human" as const),
  }));
  const title = (await getRelayWithSentences(relayId))?.title ?? "";

  const ai = await generateRelaySentence({
    title,
    prior: priorWithoutLast,
    rejectedDraft: last.text,
  });
  if (!ai.ok) return { error: ai.error };

  const replace = await replaceLastAiSentence(relayId, ai.text);
  if (!replace.ok) return { error: replace.error ?? "교체 실패" };

  revalidatePath(`/relay/${relayId}`);
  return { error: "", ok: true };
}

/**
 * 마지막이 사람 문장일 때 — 그 위에 AI 한 문장을 새로 받아 덧붙임.
 */
export async function requestAiOnlyAction(
  _prev: RelayActionState,
  formData: FormData
): Promise<RelayActionState> {
  const session = await auth();
  const uid = session?.user?.id;
  if (uid !== "Y" && uid !== "H") return { error: "로그인이 필요해요" };
  const relayId = String(formData.get("relayId") ?? "");
  if (!relayId) return { error: "잘못된 요청" };

  const recent = await getRecentSentences(relayId, 20);
  if (recent.length === 0) return { error: "문장이 없어요" };
  const last = recent[recent.length - 1];
  if (last.source === "ai")
    return { error: "마지막 문장이 이미 AI 문장이에요. ↻ 다시 받기를 써주세요." };

  const prior = recent.map((s) => ({
    text: s.text,
    bySource: s.source === "ai" ? ("ai" as const) : ("human" as const),
  }));
  const title = (await getRelayWithSentences(relayId))?.title ?? "";

  const ai = await generateRelaySentence({ title, prior });
  if (!ai.ok) return { error: ai.error };

  const append = await appendAiSentence(relayId, ai.text);
  if (!append.ok) return { error: append.error ?? "추가 실패" };

  revalidatePath(`/relay/${relayId}`);
  return { error: "", ok: true };
}

/**
 * AI 차례가 실패했을 때 — Y가 직접 다음 문장을 적어 채움.
 */
export async function manualNextAction(
  _prev: RelayActionState,
  formData: FormData
): Promise<RelayActionState> {
  const session = await auth();
  const author = session?.user?.id;
  if (author !== "Y" && author !== "H") return { error: "로그인이 필요해요" };
  const relayId = String(formData.get("relayId") ?? "");
  const text = String(formData.get("text") ?? "");
  if (!relayId) return { error: "잘못된 요청" };

  const res = await appendSentence({
    relayId,
    author,
    text,
    agreeComplete: false,
  });
  if (!res.ok) return { error: res.error };

  revalidatePath(`/relay/${relayId}`);
  return { error: "", ok: true };
}

export async function updateRelayTitleAction(
  _prev: RelayActionState,
  formData: FormData
): Promise<RelayActionState> {
  const session = await auth();
  const uid = session?.user?.id;
  if (uid !== "Y" && uid !== "H") return { error: "로그인이 필요해요" };
  const id = String(formData.get("relayId") ?? "");
  const title = String(formData.get("title") ?? "").trim();
  if (!id) return { error: "잘못된 요청" };
  if (!title) return { error: "제목을 적어주세요" };
  const { updateRelayTitle } = await import("@/lib/relays");
  await updateRelayTitle(id, title);
  revalidatePath(`/relay/${id}`);
  revalidatePath(`/relay/${id}/edit`);
  revalidatePath("/relay");
  return { error: "", ok: true };
}

export async function updateSentenceAction(
  _prev: RelayActionState,
  formData: FormData
): Promise<RelayActionState> {
  const session = await auth();
  const author = session?.user?.id;
  if (author !== "Y" && author !== "H")
    return { error: "로그인이 필요해요" };
  const relayId = String(formData.get("relayId") ?? "");
  const sentenceId = String(formData.get("sentenceId") ?? "");
  const text = String(formData.get("text") ?? "");
  if (!relayId || !sentenceId) return { error: "잘못된 요청" };
  const { updateSentenceText } = await import("@/lib/relays");
  const res = await updateSentenceText(relayId, sentenceId, text, author);
  if (!res.ok) return { error: res.error ?? "수정 실패" };
  revalidatePath(`/relay/${relayId}`);
  revalidatePath(`/relay/${relayId}/edit`);
  return { error: "", ok: true };
}

/**
 * 이어쓰기 전체 삭제 — 즉시 삭제하지 않고 동의 요청을 만들어요.
 * 상대가 /admin/requests에서 승인하면 실제 삭제됨.
 */
export async function deleteRelayAction(formData: FormData): Promise<RelayActionState> {
  "use server";
  const session = await auth();
  const uid = session?.user?.id;
  if (uid !== "Y" && uid !== "H") return { error: "로그인이 필요해요" };
  const id = String(formData.get("relayId") ?? "");
  if (!id) return { error: "잘못된 요청" };

  const existing = await findPendingRequest("delete-relay", id);
  if (existing) {
    return { error: "이미 대기 중인 삭제 요청이 있어요" };
  }

  const relay = await getRelayWithSentences(id);
  if (!relay) return { error: "이어쓰기를 찾을 수 없어요" };

  await createActionRequest({
    kind: "delete-relay",
    targetId: id,
    targetLabel: relay.title,
    requester: uid,
  });

  void notifyOnActionRequest({
    kind: "delete-relay",
    requester: uid,
    targetLabel: relay.title,
  });

  revalidatePath("/admin/requests");
  return { error: "", ok: true };
}

/**
 * 본인 문장 삭제 — 단독 권한. 동의 필요 없음.
 */
export async function deleteSentenceAction(
  _prev: RelayActionState,
  formData: FormData
): Promise<RelayActionState> {
  const session = await auth();
  const author = session?.user?.id;
  if (author !== "Y" && author !== "H") return { error: "로그인이 필요해요" };
  const relayId = String(formData.get("relayId") ?? "");
  const sentenceId = String(formData.get("sentenceId") ?? "");
  if (!relayId || !sentenceId) return { error: "잘못된 요청" };
  const { deleteSentence } = await import("@/lib/relays");
  const res = await deleteSentence(relayId, sentenceId, author);
  if (!res.ok) return { error: res.error ?? "삭제 실패" };
  revalidatePath(`/relay/${relayId}`);
  revalidatePath(`/relay/${relayId}/edit`);
  revalidatePath("/relay");
  return { error: "", ok: true };
}

export async function toggleAgreeAction(formData: FormData) {
  "use server";
  const session = await auth();
  const author = session?.user?.id;
  if (author !== "Y" && author !== "H") return;
  const relayId = String(formData.get("relayId") ?? "");
  const agreed = formData.get("agreed") === "on";
  if (!relayId) return;
  await toggleAgree(relayId, author, agreed);
  revalidatePath(`/relay/${relayId}`);
  revalidatePath("/relay");
}
