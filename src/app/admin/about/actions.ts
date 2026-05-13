"use server";

import { revalidatePath } from "next/cache";
import DOMPurify from "isomorphic-dompurify";
import { auth } from "@/auth";
import { saveAboutContent } from "@/lib/about";
import type { AboutSection } from "@/types/domain";

export type AboutActionState = { error: string; ok?: boolean };

export async function saveAboutAction(
  _prev: AboutActionState,
  formData: FormData
): Promise<AboutActionState> {
  const session = await auth();
  const uid = session?.user?.id;
  if (uid !== "Y" && uid !== "H") return { error: "로그인이 필요해요" };

  const raw = String(formData.get("sections") ?? "[]");
  let sections: AboutSection[] = [];
  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) throw new Error("not array");
    sections = parsed
      .filter(
        (s) =>
          s &&
          typeof s.key === "string" &&
          typeof s.title === "string" &&
          typeof s.body === "string"
      )
      .map((s) => ({
        key: String(s.key).slice(0, 30),
        title: String(s.title).slice(0, 200),
        body: DOMPurify.sanitize(String(s.body), {
          USE_PROFILES: { html: true },
        }),
        imageUrl: typeof s.imageUrl === "string" ? s.imageUrl : undefined,
      }));
  } catch {
    return { error: "섹션 데이터 형식이 잘못됐어요" };
  }
  if (sections.length === 0) return { error: "섹션이 비어 있어요" };

  try {
    await saveAboutContent(sections, uid);
  } catch (err) {
    console.error("saveAboutAction failed:", err);
    return { error: "저장 중 문제가 생겼어요" };
  }

  revalidatePath("/about");
  revalidatePath("/admin/about");
  return { error: "", ok: true };
}
