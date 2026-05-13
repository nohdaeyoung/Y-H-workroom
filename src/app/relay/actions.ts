"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import {
  appendSentence,
  createRelay,
  toggleAgree,
} from "@/lib/relays";

export type RelayActionState = { error: string; ok?: boolean };

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
  if (!title) return { error: "제목을 적어주세요" };
  if (!first) return { error: "첫 문장을 적어주세요" };
  if (first.length > 200) return { error: "첫 문장은 200자 이내" };

  let relayId: string;
  try {
    const relay = await createRelay({ title, firstSentence: first, author });
    relayId = relay.id;
  } catch (err) {
    console.error("startRelayAction failed:", err);
    return { error: "시작 중 문제가 생겼어요" };
  }

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
  if (!relayId) return { error: "잘못된 요청" };

  const res = await appendSentence({ relayId, author, text, agreeComplete });
  if (!res.ok) return { error: res.error };

  revalidatePath(`/relay/${relayId}`);
  revalidatePath("/relay");
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

export async function deleteRelayAction(formData: FormData) {
  "use server";
  const session = await auth();
  const uid = session?.user?.id;
  if (uid !== "Y" && uid !== "H") return;
  const id = String(formData.get("relayId") ?? "");
  if (!id) return;
  const { deleteRelay } = await import("@/lib/relays");
  await deleteRelay(id);
  revalidatePath("/relay");
  redirect("/relay");
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
