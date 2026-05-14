"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { sanitizeRichHtml } from "@/lib/sanitize";
import { auth } from "@/auth";
import {
  createPhotostory,
  getPhotostory,
  updatePhotostory,
  writePhotostoryText,
} from "@/lib/photostories";
import { notifyOnActionRequest, notifyOnNewItem } from "@/lib/notifications";
import {
  createActionRequest,
  findPendingRequest,
} from "@/lib/action-requests";

export type PhotostoryActionState = { error: string; ok?: boolean };

export async function createPhotostoryAction(
  _prev: PhotostoryActionState,
  formData: FormData
): Promise<PhotostoryActionState> {
  const session = await auth();
  const author = session?.user?.id;
  if (author !== "Y" && author !== "H") return { error: "로그인이 필요해요" };

  const title = String(formData.get("title") ?? "").trim();
  const photosRaw = String(formData.get("photos") ?? "[]");

  let photos: string[] = [];
  try {
    const parsed = JSON.parse(photosRaw);
    if (!Array.isArray(parsed)) throw new Error("photos must be array");
    photos = parsed
      .filter((u) => typeof u === "string" && u.startsWith("http"))
      .slice(0, 5);
  } catch {
    return { error: "사진 정보가 잘못됐어요" };
  }
  if (photos.length === 0) return { error: "사진을 1장 이상 올려주세요" };

  let id: string;
  try {
    const p = await createPhotostory({
      photoAuthor: author,
      photoTitle: title || "(제목 없음)",
      photos,
    });
    id = p.id;
  } catch (err) {
    console.error("createPhotostoryAction failed:", err);
    return { error: "생성 중 문제가 생겼어요" };
  }

  void notifyOnNewItem({
    kind: "photostory",
    actor: author,
    id,
    title: title || "사진+글",
    preview: "사진을 올렸어요 — 글을 써주세요.",
  });

  revalidatePath("/photostory");
  redirect(`/photostory/${id}`);
}

export async function writePhotostoryTextAction(
  _prev: PhotostoryActionState,
  formData: FormData
): Promise<PhotostoryActionState> {
  const session = await auth();
  const author = session?.user?.id;
  if (author !== "Y" && author !== "H") return { error: "로그인이 필요해요" };

  const id = String(formData.get("id") ?? "");
  const rawText = String(formData.get("text") ?? "");
  if (!id) return { error: "잘못된 요청" };

  const text = sanitizeRichHtml(rawText);
  const res = await writePhotostoryText(id, author, text);
  if (!res.ok) return { error: res.error };

  void notifyOnNewItem({
    kind: "photostory",
    actor: author,
    id,
    title: "사진에 글이 붙었어요",
    preview: text.replace(/<[^>]+>/g, "").slice(0, 200),
  });

  revalidatePath(`/photostory/${id}`);
  revalidatePath("/photostory");
  return { error: "", ok: true };
}

export async function updatePhotostoryAction(
  _prev: PhotostoryActionState,
  formData: FormData
): Promise<PhotostoryActionState> {
  const session = await auth();
  const uid = session?.user?.id;
  if (uid !== "Y" && uid !== "H") return { error: "로그인이 필요해요" };

  const id = String(formData.get("id") ?? "");
  if (!id) return { error: "잘못된 요청" };

  const photoTitle = formData.has("photoTitle")
    ? String(formData.get("photoTitle") ?? "")
    : undefined;
  const photosRaw = formData.has("photos")
    ? String(formData.get("photos") ?? "[]")
    : undefined;
  const textRaw = formData.has("text")
    ? String(formData.get("text") ?? "")
    : undefined;

  let photos: string[] | undefined;
  if (photosRaw !== undefined) {
    try {
      const parsed = JSON.parse(photosRaw);
      if (!Array.isArray(parsed)) throw new Error("not array");
      photos = parsed
        .filter((u) => typeof u === "string" && u.startsWith("http"))
        .slice(0, 5);
    } catch {
      return { error: "사진 정보가 잘못됐어요" };
    }
  }

  let text: string | undefined;
  if (textRaw !== undefined) {
    text = sanitizeRichHtml(textRaw);
  }

  const res = await updatePhotostory(id, uid, { photoTitle, photos, text });
  if (!res.ok) return { error: res.error ?? "수정 실패" };

  revalidatePath(`/photostory/${id}`);
  revalidatePath(`/photostory/${id}/edit`);
  revalidatePath("/photostory");
  return { error: "", ok: true };
}

/**
 * 사진+글 삭제 — 동의 요청 생성. 상대 승인 시 /admin/requests에서 실제 삭제 수행.
 */
export async function deletePhotostoryAction(
  formData: FormData
): Promise<PhotostoryActionState> {
  "use server";
  const session = await auth();
  const author = session?.user?.id;
  if (author !== "Y" && author !== "H") return { error: "로그인이 필요해요" };
  const id = String(formData.get("id") ?? "");
  if (!id) return { error: "잘못된 요청" };

  const existing = await findPendingRequest("delete-photostory", id);
  if (existing) return { error: "이미 대기 중인 삭제 요청이 있어요" };

  const p = await getPhotostory(id);
  if (!p) return { error: "찾을 수 없어요" };

  await createActionRequest({
    kind: "delete-photostory",
    targetId: id,
    targetLabel: p.photoTitle,
    requester: author,
  });
  void notifyOnActionRequest({
    kind: "delete-photostory",
    requester: author,
    targetLabel: p.photoTitle,
  });
  revalidatePath("/admin/requests");
  return { error: "", ok: true };
}

/**
 * 사진+글 상태 (waiting↔completed) 전환 — 동의 요청 생성.
 */
export async function setPhotostoryStatusAction(
  formData: FormData
): Promise<PhotostoryActionState> {
  "use server";
  const session = await auth();
  const author = session?.user?.id;
  if (author !== "Y" && author !== "H") return { error: "로그인이 필요해요" };
  const id = String(formData.get("id") ?? "");
  const statusRaw = String(formData.get("status") ?? "");
  const status = statusRaw === "completed" ? "completed" : "waiting";
  if (!id) return { error: "잘못된 요청" };

  const existing = await findPendingRequest("set-photostory-status", id);
  if (existing) return { error: "이미 대기 중인 상태 전환 요청이 있어요" };

  const p = await getPhotostory(id);
  if (!p) return { error: "찾을 수 없어요" };
  if (p.status === status) return { error: "이미 그 상태예요" };

  await createActionRequest({
    kind: "set-photostory-status",
    targetId: id,
    targetLabel: p.photoTitle,
    requester: author,
    payload: { status },
  });
  void notifyOnActionRequest({
    kind: "set-photostory-status",
    requester: author,
    targetLabel: p.photoTitle,
  });
  revalidatePath("/admin/requests");
  return { error: "", ok: true };
}
