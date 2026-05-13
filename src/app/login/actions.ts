"use server";

import { signIn, signOut } from "@/auth";
import { AuthError } from "next-auth";

export type LoginState = { error: string };

export async function loginAction(
  _prev: LoginState,
  formData: FormData
): Promise<LoginState> {
  const id = String(formData.get("id") ?? "");
  const password = String(formData.get("password") ?? "");
  const from = String(formData.get("from") ?? "/");

  if (!id || !password) {
    return { error: "아이디와 비밀번호를 입력해주세요" };
  }

  try {
    await signIn("yh-credentials", {
      id,
      password,
      redirectTo: from,
    });
    return { error: "" };
  } catch (err) {
    if (err instanceof AuthError) {
      if (err.type === "CredentialsSignin") {
        return { error: "아이디 또는 비밀번호가 맞지 않아요" };
      }
      return { error: "로그인 중 문제가 발생했어요" };
    }
    throw err;
  }
}

export async function logoutAction() {
  await signOut({ redirectTo: "/" });
}
