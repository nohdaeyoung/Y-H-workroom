"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import DOMPurify from "isomorphic-dompurify";
import { auth } from "@/auth";
import { deleteEssay, getEssay, updateEssay } from "@/lib/essays";
import type { EssayStatus } from "@/types/domain";

export type EssayActionState = { error: string; ok?: boolean };

export async function updateEssayAction(
  _prev: EssayActionState,
  formData: FormData
): Promise<EssayActionState> {
  const session = await auth();
  const uid = session?.user?.id;
  if (uid !== "Y" && uid !== "H") return { error: "로그인이 필요해요" };

  const id = String(formData.get("id") ?? "");
  const title = String(formData.get("title") ?? "").trim();
  const rawContent = String(formData.get("content") ?? "");
  const tagInput = String(formData.get("tags") ?? "");
  const status = String(formData.get("status") ?? "published") as EssayStatus;
  if (!id) return { error: "잘못된 요청" };
  if (!title) return { error: "제목을 적어주세요" };

  const essay = await getEssay(id);
  if (!essay) return { error: "에세이를 찾을 수 없어요" };
  if (essay.author !== uid)
    return { error: "본인 글만 수정할 수 있어요" };

  const content = DOMPurify.sanitize(rawContent, {
    USE_PROFILES: { html: true },
  });
  const tags = tagInput
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean);

  try {
    await updateEssay(id, { title, content, tags, status });
  } catch (err) {
    console.error("updateEssayAction failed:", err);
    return { error: "수정 중 문제가 생겼어요" };
  }

  revalidatePath(`/essay/${id}`);
  revalidatePath("/essay");
  revalidatePath("/admin/my/essay");
  redirect(`/essay/${id}`);
}

export async function deleteEssayAction(formData: FormData) {
  "use server";
  const session = await auth();
  const uid = session?.user?.id;
  if (uid !== "Y" && uid !== "H") return;
  const id = String(formData.get("id") ?? "");
  if (!id) return;
  const essay = await getEssay(id);
  if (!essay || essay.author !== uid) return;
  await deleteEssay(id);
  revalidatePath("/essay");
  revalidatePath("/admin/my/essay");
  const from = String(formData.get("from") ?? "/essay");
  redirect(from);
}

export async function toggleEssayVisibilityAction(formData: FormData) {
  "use server";
  const session = await auth();
  const uid = session?.user?.id;
  if (uid !== "Y" && uid !== "H") return;
  const id = String(formData.get("id") ?? "");
  if (!id) return;
  const essay = await getEssay(id);
  if (!essay || essay.author !== uid) return;
  const next: EssayStatus =
    essay.status === "published" ? "private" : "published";
  await updateEssay(id, { status: next });
  revalidatePath(`/essay/${id}`);
  revalidatePath("/essay");
  revalidatePath("/admin/my/essay");
}
