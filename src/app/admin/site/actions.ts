"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { saveSiteSettings } from "@/lib/site-settings";

export type SiteActionState = { error: string; ok?: boolean };

export async function saveSiteAction(
  _prev: SiteActionState,
  formData: FormData
): Promise<SiteActionState> {
  const session = await auth();
  const uid = session?.user?.id;
  if (uid !== "Y") return { error: "Y 계정만 편집 가능해요" };

  const metaTitle = String(formData.get("metaTitle") ?? "").slice(0, 200);
  const metaDescription = String(formData.get("metaDescription") ?? "").slice(0, 500);
  const ogImageUrl = String(formData.get("ogImageUrl") ?? "").slice(0, 500);
  const headHtml = String(formData.get("headHtml") ?? "").slice(0, 50000);
  const bodyStartHtml = String(formData.get("bodyStartHtml") ?? "").slice(0, 50000);
  const bodyEndHtml = String(formData.get("bodyEndHtml") ?? "").slice(0, 50000);

  try {
    await saveSiteSettings(
      { metaTitle, metaDescription, ogImageUrl, headHtml, bodyStartHtml, bodyEndHtml },
      uid
    );
  } catch (err) {
    console.error("saveSiteAction failed:", err);
    return { error: "저장 중 문제가 생겼어요" };
  }

  revalidatePath("/");
  revalidatePath("/admin/site");
  return { error: "", ok: true };
}
