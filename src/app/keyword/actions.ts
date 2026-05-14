"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { sanitizeRichHtml } from "@/lib/sanitize";
import { auth } from "@/auth";
import { notifyOnActionRequest, notifyOnNewItem } from "@/lib/notifications";
import {
  createActionRequest,
  findPendingRequest,
} from "@/lib/action-requests";
import { getKeyword } from "@/lib/keywords";
import {
  createKeyword,
  deleteKeywordEssay,
  suggestNewKeyword,
  updateKeywordEssayContent,
  updateKeywordWord,
  writeKeywordEssay,
} from "@/lib/keywords";

export type KeywordActionState = { error: string; ok?: boolean };

export async function suggestKeywordAction() {
  const session = await auth();
  const id = session?.user?.id;
  if (id !== "Y" && id !== "H") return;

  let word: string;
  try {
    word = await suggestNewKeyword();
  } catch (err) {
    console.error("suggestKeywordAction failed:", err);
    return;
  }

  let newId: string;
  try {
    const k = await createKeyword(word);
    newId = k.id;
  } catch (err) {
    console.error("createKeyword failed:", err);
    return;
  }

  revalidatePath("/keyword");
  revalidatePath("/admin");
  redirect(`/keyword/${newId}`);
}

export async function writeKeywordEssayAction(
  _prev: KeywordActionState,
  formData: FormData
): Promise<KeywordActionState> {
  const session = await auth();
  const author = session?.user?.id;
  if (author !== "Y" && author !== "H") {
    return { error: "로그인이 필요해요" };
  }
  const keywordId = String(formData.get("keywordId") ?? "");
  const title = String(formData.get("title") ?? "");
  const rawContent = String(formData.get("content") ?? "");
  if (!keywordId) return { error: "잘못된 요청" };

  const content = sanitizeRichHtml(rawContent);
  if (content.length > 1000)
    return { error: "1000자 이내로 부탁해요" };

  const res = await writeKeywordEssay({
    keywordId,
    author,
    title,
    content,
  });
  if (!res.ok) return { error: res.error };

  void notifyOnNewItem({
    kind: "keyword",
    actor: author,
    id: keywordId,
    title: title || "키워드 에세이",
    preview: content.replace(/<[^>]+>/g, "").slice(0, 200),
  });

  revalidatePath(`/keyword/${keywordId}`);
  revalidatePath("/keyword");
  return { error: "", ok: true };
}

export async function updateKeywordWordAction(
  _prev: KeywordActionState,
  formData: FormData
): Promise<KeywordActionState> {
  const session = await auth();
  const uid = session?.user?.id;
  if (uid !== "Y" && uid !== "H") return { error: "로그인이 필요해요" };
  const id = String(formData.get("keywordId") ?? "");
  const text = String(formData.get("keyword") ?? "").trim();
  if (!id) return { error: "잘못된 요청" };
  if (!text) return { error: "키워드 단어를 적어주세요" };
  await updateKeywordWord(id, text);
  revalidatePath(`/keyword/${id}`);
  revalidatePath(`/keyword/${id}/edit`);
  revalidatePath("/keyword");
  return { error: "", ok: true };
}

export async function updateKeywordEssayAction(
  _prev: KeywordActionState,
  formData: FormData
): Promise<KeywordActionState> {
  const session = await auth();
  const author = session?.user?.id;
  if (author !== "Y" && author !== "H")
    return { error: "로그인이 필요해요" };
  const id = String(formData.get("keywordId") ?? "");
  const title = String(formData.get("title") ?? "");
  const rawContent = String(formData.get("content") ?? "");
  if (!id) return { error: "잘못된 요청" };

  const content = sanitizeRichHtml(rawContent);
  const res = await updateKeywordEssayContent(id, author, title, content);
  if (!res.ok) return { error: res.error ?? "수정 실패" };
  revalidatePath(`/keyword/${id}`);
  revalidatePath(`/keyword/${id}/edit`);
  return { error: "", ok: true };
}

export async function deleteKeywordEssayAction(formData: FormData) {
  "use server";
  const session = await auth();
  const author = session?.user?.id;
  if (author !== "Y" && author !== "H") return;
  const id = String(formData.get("keywordId") ?? "");
  if (!id) return;
  await deleteKeywordEssay(id, author);
  revalidatePath(`/keyword/${id}`);
  revalidatePath("/keyword");
}

/**
 * 키워드 전체 삭제 (두 사람 글 모두 사라짐) — 동의 요청 생성.
 */
export async function deleteKeywordAction(
  formData: FormData
): Promise<KeywordActionState> {
  "use server";
  const session = await auth();
  const uid = session?.user?.id;
  if (uid !== "Y" && uid !== "H") return { error: "로그인이 필요해요" };
  const id = String(formData.get("keywordId") ?? "");
  if (!id) return { error: "잘못된 요청" };

  const existing = await findPendingRequest("delete-keyword", id);
  if (existing) return { error: "이미 대기 중인 삭제 요청이 있어요" };

  const k = await getKeyword(id);
  if (!k) return { error: "찾을 수 없어요" };

  await createActionRequest({
    kind: "delete-keyword",
    targetId: id,
    targetLabel: `"${k.keyword}"`,
    requester: uid,
  });
  void notifyOnActionRequest({
    kind: "delete-keyword",
    requester: uid,
    targetLabel: `"${k.keyword}"`,
  });
  revalidatePath("/admin/requests");
  return { error: "", ok: true };
}
