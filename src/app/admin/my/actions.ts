"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { getDbOrThrow } from "@/lib/firebase-admin";
import { deleteEssay, getEssay, updateEssay } from "@/lib/essays";

export async function deleteItemAction(formData: FormData) {
  "use server";
  const session = await auth();
  const uid = session?.user?.id;
  if (uid !== "Y" && uid !== "H") return;

  const section = String(formData.get("section") ?? "");
  const id = String(formData.get("id") ?? "");
  if (!section || !id) return;

  const db = getDbOrThrow();

  try {
    if (section === "essay") {
      const essay = await getEssay(id);
      if (!essay || essay.author !== uid) return;
      await deleteEssay(id);
    } else if (section === "relay") {
      // 이어쓰기는 sentences 서브컬렉션 같이 삭제
      const ref = db.collection("relays").doc(id);
      const sents = await ref.collection("sentences").get();
      const batch = db.batch();
      sents.docs.forEach((d) => batch.delete(d.ref));
      batch.delete(ref);
      await batch.commit();
    } else if (section === "keyword") {
      await db.collection("keywords").doc(id).delete();
    } else if (section === "bookclub") {
      await db.collection("bookclubs").doc(id).delete();
    } else if (section === "photo") {
      await db.collection("photostories").doc(id).delete();
    } else {
      return;
    }
  } catch (err) {
    console.error("deleteItemAction failed:", err);
  }

  revalidatePath(`/admin/my/${section}`);
  revalidatePath(`/admin`);
  if (section === "essay") revalidatePath("/essay");
  else if (section === "relay") revalidatePath("/relay");
  else if (section === "keyword") revalidatePath("/keyword");
  else if (section === "bookclub") revalidatePath("/bookclub");
  else if (section === "photo") revalidatePath("/photostory");
}

export async function toggleVisibilityAction(formData: FormData) {
  "use server";
  const session = await auth();
  const uid = session?.user?.id;
  if (uid !== "Y" && uid !== "H") return;

  const section = String(formData.get("section") ?? "");
  const id = String(formData.get("id") ?? "");
  if (!section || !id) return;

  if (section === "essay") {
    const essay = await getEssay(id);
    if (!essay || essay.author !== uid) return;
    const next = essay.status === "published" ? "private" : "published";
    await updateEssay(id, { status: next });
    revalidatePath("/essay");
  } else if (section === "bookclub") {
    const db = getDbOrThrow();
    const doc = await db.collection("bookclubs").doc(id).get();
    if (!doc.exists) return;
    const status = doc.data()?.status;
    const next = status === "published" ? "review" : "published";
    await db.collection("bookclubs").doc(id).update({
      status: next,
      publishedAt: next === "published" ? Date.now() : null,
    });
    revalidatePath("/bookclub");
  }
  // relay/keyword/photo는 별도 status 모델 — 토글 X

  revalidatePath(`/admin/my/${section}`);
}
