"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { sanitizeRichHtml } from "@/lib/sanitize";
import { notifyOnActionRequest, notifyOnNewItem } from "@/lib/notifications";
import {
  createActionRequest,
  findPendingRequest,
} from "@/lib/action-requests";
import { getBookclub } from "@/lib/bookclubs";
import {
  addBookclubQuote,
  createBookclubDraft,
  deleteBookclubQuote,
  publishBookclub,
  setBookclubImpression,
  setBookclubStatus,
  unpublishBookclub,
  updateBookclubCover,
  updateBookclubMeta,
  updateBookclubQuote,
  updateBookclubTranscript,
} from "@/lib/bookclubs";
import type {
  BookclubStatus,
  BookclubTranscriptLine,
  UserId,
} from "@/types/domain";

export type BookclubActionState = { error: string; ok?: boolean };

export async function createDraftAction(
  _prev: BookclubActionState,
  formData: FormData
): Promise<BookclubActionState> {
  const session = await auth();
  const uid = session?.user?.id;
  if (uid !== "Y" && uid !== "H") return { error: "로그인이 필요해요" };

  const bookTitle = String(formData.get("bookTitle") ?? "").trim();
  const bookAuthor = String(formData.get("bookAuthor") ?? "").trim();
  const meetingDate = String(formData.get("meetingDate") ?? "").trim();
  const duration = String(formData.get("duration") ?? "").trim();
  const coverUrlRaw = String(formData.get("coverUrl") ?? "").trim();
  const coverUrl = coverUrlRaw.startsWith("http") ? coverUrlRaw : null;
  // 새 모임은 반드시 "reading"으로 생성. met/finished 전환은 동의 요청을 거쳐야 함.
  const status: BookclubStatus = "reading";

  if (!bookTitle || !bookAuthor || !meetingDate) {
    return { error: "책 제목, 저자, 모임 날짜를 모두 적어주세요" };
  }

  let id: string;
  try {
    const b = await createBookclubDraft({
      bookTitle,
      bookAuthor,
      meetingDate,
      duration,
      coverUrl,
      status,
    });
    id = b.id;
  } catch (err) {
    console.error("createDraftAction failed:", err);
    return { error: "생성 중 문제가 생겼어요" };
  }
  revalidatePath("/bookclub");
  redirect(`/bookclub/${id}/review`);
}

/**
 * 독서모임 상태 전환 — 동의 요청 생성. 상대 승인 시 /admin/requests에서 실제 반영.
 * 결과 상태(ok/error)를 반환해서 UI가 silent failure를 잡을 수 있게.
 */
export async function setStatusAction(
  formData: FormData
): Promise<BookclubActionState> {
  "use server";
  const session = await auth();
  const uid = session?.user?.id;
  if (uid !== "Y" && uid !== "H") return { error: "로그인이 필요해요" };
  const id = String(formData.get("id") ?? "");
  const statusRaw = String(formData.get("status") ?? "");
  if (!id) return { error: "잘못된 요청" };
  const status: BookclubStatus =
    statusRaw === "reading" || statusRaw === "met" || statusRaw === "finished"
      ? statusRaw
      : "reading";

  const b = await getBookclub(id);
  if (!b) return { error: "찾을 수 없어요" };
  if (b.status === status) return { error: "이미 그 상태예요" };

  const existing = await findPendingRequest("set-bookclub-status", id);
  if (existing) return { error: "이미 대기 중인 상태 전환 요청이 있어요" };

  await createActionRequest({
    kind: "set-bookclub-status",
    targetId: id,
    targetLabel: b.bookTitle,
    requester: uid,
    payload: { status },
  });
  void notifyOnActionRequest({
    kind: "set-bookclub-status",
    requester: uid,
    targetLabel: b.bookTitle,
  });
  revalidatePath("/admin/requests");
  return { error: "", ok: true };
}

/**
 * 독서모임 전체 삭제 — 동의 요청 생성.
 */
export async function deleteBookclubAction(
  formData: FormData
): Promise<BookclubActionState> {
  "use server";
  const session = await auth();
  const uid = session?.user?.id;
  if (uid !== "Y" && uid !== "H") return { error: "로그인이 필요해요" };
  const id = String(formData.get("id") ?? "");
  if (!id) return { error: "잘못된 요청" };

  const existing = await findPendingRequest("delete-bookclub", id);
  if (existing) return { error: "이미 대기 중인 삭제 요청이 있어요" };

  const b = await getBookclub(id);
  if (!b) return { error: "찾을 수 없어요" };

  await createActionRequest({
    kind: "delete-bookclub",
    targetId: id,
    targetLabel: b.bookTitle,
    requester: uid,
  });
  void notifyOnActionRequest({
    kind: "delete-bookclub",
    requester: uid,
    targetLabel: b.bookTitle,
  });
  revalidatePath("/admin/requests");
  return { error: "", ok: true };
}

export async function saveTranscriptAction(
  _prev: BookclubActionState,
  formData: FormData
): Promise<BookclubActionState> {
  const session = await auth();
  const uid = session?.user?.id;
  if (uid !== "Y" && uid !== "H") return { error: "로그인이 필요해요" };

  const id = String(formData.get("id") ?? "");
  const raw = String(formData.get("transcript") ?? "[]");
  if (!id) return { error: "잘못된 요청" };

  let lines: BookclubTranscriptLine[] = [];
  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) throw new Error("not array");
    lines = parsed
      .filter(
        (p) =>
          p &&
          (p.speaker === "Y" || p.speaker === "H") &&
          typeof p.text === "string"
      )
      .map((p) => ({
        speaker: p.speaker as UserId,
        text: String(p.text).slice(0, 5000),
      }));
  } catch {
    return { error: "transcript 형식이 잘못됐어요" };
  }

  await updateBookclubTranscript(id, lines);
  revalidatePath(`/bookclub/${id}/review`);
  revalidatePath(`/bookclub/${id}`);
  return { error: "", ok: true };
}

export async function updateMetaAction(
  _prev: BookclubActionState,
  formData: FormData
): Promise<BookclubActionState> {
  const session = await auth();
  const uid = session?.user?.id;
  if (uid !== "Y" && uid !== "H") return { error: "로그인이 필요해요" };
  const id = String(formData.get("id") ?? "");
  if (!id) return { error: "잘못된 요청" };
  const bookTitle = String(formData.get("bookTitle") ?? "").trim();
  const bookAuthor = String(formData.get("bookAuthor") ?? "").trim();
  const meetingDate = String(formData.get("meetingDate") ?? "").trim();
  const duration = String(formData.get("duration") ?? "").trim();
  if (!bookTitle || !bookAuthor || !meetingDate)
    return { error: "책 제목/저자/날짜는 필수예요" };
  await updateBookclubMeta(id, {
    bookTitle,
    bookAuthor,
    meetingDate,
    duration,
  });
  revalidatePath(`/bookclub/${id}`);
  revalidatePath(`/bookclub/${id}/review`);
  revalidatePath("/bookclub");
  return { error: "", ok: true };
}

export async function updateCoverAction(formData: FormData) {
  "use server";
  const session = await auth();
  const uid = session?.user?.id;
  if (uid !== "Y" && uid !== "H") return;
  const id = String(formData.get("id") ?? "");
  const url = String(formData.get("coverUrl") ?? "").trim();
  if (!id) return;
  const next = url.startsWith("http") ? url : null;
  await updateBookclubCover(id, next);
  revalidatePath(`/bookclub/${id}/review`);
  revalidatePath(`/bookclub/${id}`);
  revalidatePath("/bookclub");
}

export async function publishAction(formData: FormData) {
  "use server";
  const session = await auth();
  const uid = session?.user?.id;
  if (uid !== "Y" && uid !== "H") return;
  const id = String(formData.get("id") ?? "");
  if (!id) return;
  await publishBookclub(id);
  revalidatePath(`/bookclub/${id}`);
  revalidatePath("/bookclub");
  redirect(`/bookclub/${id}`);
}

export async function unpublishAction(formData: FormData) {
  "use server";
  const session = await auth();
  const uid = session?.user?.id;
  if (uid !== "Y" && uid !== "H") return;
  const id = String(formData.get("id") ?? "");
  if (!id) return;
  await unpublishBookclub(id);
  revalidatePath(`/bookclub/${id}`);
  revalidatePath("/bookclub");
}

// —— 소감 ——
export async function saveImpressionAction(
  _prev: BookclubActionState,
  formData: FormData
): Promise<BookclubActionState> {
  const session = await auth();
  const author = session?.user?.id;
  if (author !== "Y" && author !== "H") return { error: "로그인이 필요해요" };
  const id = String(formData.get("id") ?? "");
  const title = String(formData.get("title") ?? "");
  const content = sanitizeRichHtml(String(formData.get("content") ?? ""));
  if (!id) return { error: "잘못된 요청" };
  const res = await setBookclubImpression(id, author, { title, content });
  if (!res.ok) return { error: res.error ?? "저장 실패" };

  void notifyOnNewItem({
    kind: "bookclub",
    actor: author,
    id,
    title: title || "독서 소감",
    preview: content.replace(/<[^>]+>/g, "").slice(0, 200),
  });

  revalidatePath(`/bookclub/${id}`);
  return { error: "", ok: true };
}

export async function deleteImpressionAction(formData: FormData) {
  "use server";
  const session = await auth();
  const author = session?.user?.id;
  if (author !== "Y" && author !== "H") return;
  const id = String(formData.get("id") ?? "");
  if (!id) return;
  await setBookclubImpression(id, author, null);
  revalidatePath(`/bookclub/${id}`);
}

// —— 인용 문장 ——
export async function addQuoteAction(
  _prev: BookclubActionState,
  formData: FormData
): Promise<BookclubActionState> {
  const session = await auth();
  const author = session?.user?.id;
  if (author !== "Y" && author !== "H") return { error: "로그인이 필요해요" };
  const id = String(formData.get("id") ?? "");
  const text = String(formData.get("text") ?? "");
  const source = String(formData.get("source") ?? "");
  if (!id) return { error: "잘못된 요청" };
  const res = await addBookclubQuote(id, author, text, source);
  if (!res.ok) return { error: res.error ?? "추가 실패" };
  revalidatePath(`/bookclub/${id}`);
  return { error: "", ok: true };
}

export async function updateQuoteAction(
  _prev: BookclubActionState,
  formData: FormData
): Promise<BookclubActionState> {
  const session = await auth();
  const author = session?.user?.id;
  if (author !== "Y" && author !== "H") return { error: "로그인이 필요해요" };
  const id = String(formData.get("id") ?? "");
  const quoteId = String(formData.get("quoteId") ?? "");
  const text = String(formData.get("text") ?? "");
  const source = String(formData.get("source") ?? "");
  if (!id || !quoteId) return { error: "잘못된 요청" };
  const res = await updateBookclubQuote(id, quoteId, author, text, source);
  if (!res.ok) return { error: res.error ?? "수정 실패" };
  revalidatePath(`/bookclub/${id}`);
  return { error: "", ok: true };
}

export async function deleteQuoteAction(formData: FormData) {
  "use server";
  const session = await auth();
  const author = session?.user?.id;
  if (author !== "Y" && author !== "H") return;
  const id = String(formData.get("id") ?? "");
  const quoteId = String(formData.get("quoteId") ?? "");
  if (!id || !quoteId) return;
  await deleteBookclubQuote(id, quoteId, author);
  revalidatePath(`/bookclub/${id}`);
}
