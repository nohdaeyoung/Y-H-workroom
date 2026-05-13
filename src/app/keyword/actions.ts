"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import DOMPurify from "isomorphic-dompurify";
import { auth } from "@/auth";
import {
  createKeyword,
  suggestNewKeyword,
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

  const content = DOMPurify.sanitize(rawContent, {
    USE_PROFILES: { html: true },
  });
  if (content.length > 1000)
    return { error: "1000자 이내로 부탁해요" };

  const res = await writeKeywordEssay({
    keywordId,
    author,
    title,
    content,
  });
  if (!res.ok) return { error: res.error };

  revalidatePath(`/keyword/${keywordId}`);
  revalidatePath("/keyword");
  return { error: "", ok: true };
}
