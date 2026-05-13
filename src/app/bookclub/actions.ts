"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import {
  createBookclubDraft,
  publishBookclub,
  unpublishBookclub,
  updateBookclubCover,
  updateBookclubMeta,
  updateBookclubTranscript,
} from "@/lib/bookclubs";
import type { BookclubTranscriptLine, UserId } from "@/types/domain";

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
    });
    id = b.id;
  } catch (err) {
    console.error("createDraftAction failed:", err);
    return { error: "생성 중 문제가 생겼어요" };
  }
  revalidatePath("/bookclub");
  redirect(`/bookclub/${id}/review`);
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
