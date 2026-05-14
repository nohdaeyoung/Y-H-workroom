"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { getDbOrThrow } from "@/lib/firebase-admin";
import { deleteEssay, getEssay, updateEssay } from "@/lib/essays";
import { getRelayWithSentences } from "@/lib/relays";
import { getKeyword } from "@/lib/keywords";
import { getBookclub } from "@/lib/bookclubs";
import { getPhotostory } from "@/lib/photostories";
import {
  createActionRequest,
  findPendingRequest,
} from "@/lib/action-requests";
import { notifyOnActionRequest } from "@/lib/notifications";
import type { ActionRequestKind } from "@/types/domain";

export type AdminMyActionState = { error: string; ok?: boolean };

const SECTION_TO_DELETE_KIND: Record<string, ActionRequestKind | null> = {
  essay: null, // 단독 삭제 — request 안 만듦
  relay: "delete-relay",
  keyword: "delete-keyword",
  bookclub: "delete-bookclub",
  photo: "delete-photostory",
};

/**
 * 어드민 내 글 모아보기에서 호출되는 삭제.
 * - essay: author 본인 단독 즉시 삭제
 * - 그 외 함께 쓰는 컨텐츠(relay/keyword/bookclub/photo): 동의 요청 생성
 */
export async function deleteItemAction(
  _prev: AdminMyActionState | undefined,
  formData: FormData
): Promise<AdminMyActionState> {
  "use server";
  const session = await auth();
  const uid = session?.user?.id;
  if (uid !== "Y" && uid !== "H") return { error: "로그인이 필요해요" };

  const section = String(formData.get("section") ?? "");
  const id = String(formData.get("id") ?? "");
  if (!section || !id) return { error: "잘못된 요청" };

  // essay: 본인 단독 즉시 삭제
  if (section === "essay") {
    try {
      const essay = await getEssay(id);
      if (!essay || essay.author !== uid) return { error: "본인 글만 삭제 가능해요" };
      await deleteEssay(id);
    } catch (err) {
      console.error("deleteItemAction essay failed:", err);
      return { error: "삭제 중 문제가 생겼어요" };
    }
    revalidatePath(`/admin/my/${section}`);
    revalidatePath("/admin");
    revalidatePath("/essay");
    return { error: "", ok: true };
  }

  // 함께 쓰는 컨텐츠: 동의 요청 생성
  const kind = SECTION_TO_DELETE_KIND[section];
  if (!kind) return { error: "지원하지 않는 섹션이에요" };

  const existing = await findPendingRequest(kind, id);
  if (existing) return { error: "이미 대기 중인 삭제 요청이 있어요" };

  let targetLabel = id;
  try {
    if (section === "relay") {
      const r = await getRelayWithSentences(id);
      if (!r) return { error: "찾을 수 없어요" };
      targetLabel = r.title;
    } else if (section === "keyword") {
      const k = await getKeyword(id);
      if (!k) return { error: "찾을 수 없어요" };
      targetLabel = `"${k.keyword}"`;
    } else if (section === "bookclub") {
      const b = await getBookclub(id);
      if (!b) return { error: "찾을 수 없어요" };
      targetLabel = b.bookTitle;
    } else if (section === "photo") {
      const p = await getPhotostory(id);
      if (!p) return { error: "찾을 수 없어요" };
      targetLabel = p.photoTitle;
    }
  } catch (err) {
    console.error("deleteItemAction lookup failed:", err);
    return { error: "조회 중 문제가 생겼어요" };
  }

  await createActionRequest({
    kind,
    targetId: id,
    targetLabel,
    requester: uid,
  });
  void notifyOnActionRequest({ kind, requester: uid, targetLabel });

  revalidatePath("/admin/requests");
  return { error: "", ok: true };
}

export async function toggleVisibilityAction(
  _prev: AdminMyActionState | undefined,
  formData: FormData
): Promise<AdminMyActionState> {
  "use server";
  const session = await auth();
  const uid = session?.user?.id;
  if (uid !== "Y" && uid !== "H") return { error: "로그인이 필요해요" };

  const section = String(formData.get("section") ?? "");
  const id = String(formData.get("id") ?? "");
  if (!section || !id) return { error: "잘못된 요청" };

  // essay: 본인 단독 즉시 전환
  if (section === "essay") {
    const essay = await getEssay(id);
    if (!essay || essay.author !== uid) return { error: "본인 글만 전환 가능해요" };
    const next = essay.status === "published" ? "private" : "published";
    await updateEssay(id, { status: next });
    revalidatePath("/essay");
    revalidatePath(`/admin/my/${section}`);
    return { error: "", ok: true };
  }

  // bookclub: 동의 요청 생성
  if (section === "bookclub") {
    const existing = await findPendingRequest("set-bookclub-status", id);
    if (existing) return { error: "이미 대기 중인 상태 전환 요청이 있어요" };
    const b = await getBookclub(id);
    if (!b) return { error: "찾을 수 없어요" };
    const next = b.status === "reading" ? "met" : "reading";
    await createActionRequest({
      kind: "set-bookclub-status",
      targetId: id,
      targetLabel: b.bookTitle,
      requester: uid,
      payload: { status: next },
    });
    void notifyOnActionRequest({
      kind: "set-bookclub-status",
      requester: uid,
      targetLabel: b.bookTitle,
    });
    revalidatePath("/admin/requests");
    return { error: "", ok: true };
  }

  return { error: "이 섹션은 전환을 지원하지 않아요" };
}
