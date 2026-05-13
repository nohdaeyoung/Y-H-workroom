"use server";

import { revalidatePath } from "next/cache";
import bcrypt from "bcryptjs";
import { auth } from "@/auth";
import {
  resolvePasswordHash,
  updateUserPasswordHash,
  updateUserProfile,
} from "@/lib/user-profile";

export type AccountActionState = { error: string; ok?: boolean };

export async function updateProfileAction(
  _prev: AccountActionState,
  formData: FormData
): Promise<AccountActionState> {
  const session = await auth();
  const uid = session?.user?.id;
  if (uid !== "Y" && uid !== "H") return { error: "로그인이 필요해요" };

  const displayName = String(formData.get("displayName") ?? "").trim();
  const desc = String(formData.get("desc") ?? "").trim();
  if (!displayName) return { error: "표시 이름을 적어주세요" };
  if (displayName.length > 50) return { error: "표시 이름이 너무 길어요" };
  if (desc.length > 200) return { error: "한 줄 설명이 너무 길어요" };

  try {
    await updateUserProfile(uid, { displayName, desc });
  } catch (err) {
    console.error("updateProfileAction failed:", err);
    return { error: "저장 중 문제가 생겼어요" };
  }

  revalidatePath("/admin/account");
  revalidatePath("/admin");
  return { error: "", ok: true };
}

export async function updatePasswordAction(
  _prev: AccountActionState,
  formData: FormData
): Promise<AccountActionState> {
  const session = await auth();
  const uid = session?.user?.id;
  if (uid !== "Y" && uid !== "H") return { error: "로그인이 필요해요" };

  const current = String(formData.get("currentPassword") ?? "");
  const next = String(formData.get("newPassword") ?? "");
  const confirm = String(formData.get("confirmPassword") ?? "");

  if (!current || !next || !confirm)
    return { error: "모든 칸을 채워주세요" };
  if (next.length < 4) return { error: "새 비밀번호는 4자 이상" };
  if (next !== confirm) return { error: "새 비밀번호와 확인이 달라요" };

  const currentHash = await resolvePasswordHash(uid);
  if (!currentHash) return { error: "현재 비밀번호 정보가 없어요" };
  const valid = await bcrypt.compare(current, currentHash);
  if (!valid) return { error: "현재 비밀번호가 맞지 않아요" };

  try {
    const nextHash = await bcrypt.hash(next, 10);
    await updateUserPasswordHash(uid, nextHash);
  } catch (err) {
    console.error("updatePasswordAction failed:", err);
    return { error: "변경 중 문제가 생겼어요" };
  }

  revalidatePath("/admin/account");
  return { error: "", ok: true };
}
