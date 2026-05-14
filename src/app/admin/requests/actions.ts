"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import {
  getActionRequest,
  resolveActionRequest,
} from "@/lib/action-requests";
import { executeActionRequest } from "@/lib/action-request-executor";

export type RequestActionState = { error: string; ok?: boolean };

async function getViewerOrFail(): Promise<"Y" | "H" | null> {
  const session = await auth();
  const uid = session?.user?.id;
  if (uid !== "Y" && uid !== "H") return null;
  return uid;
}

/**
 * 요청 승인. 요청자가 아닌 상대만 승인 가능. 승인 시 실제 mutation 수행.
 */
export async function approveRequestAction(
  _prev: RequestActionState,
  formData: FormData
): Promise<RequestActionState> {
  const uid = await getViewerOrFail();
  if (!uid) return { error: "로그인이 필요해요" };

  const id = String(formData.get("id") ?? "");
  if (!id) return { error: "잘못된 요청" };

  const req = await getActionRequest(id);
  if (!req) return { error: "요청을 찾을 수 없어요" };
  if (req.status !== "pending") return { error: "이미 처리된 요청이에요" };
  if (req.requester === uid)
    return { error: "본인이 만든 요청은 승인할 수 없어요" };

  try {
    await executeActionRequest(req);
  } catch (err) {
    console.error("executeActionRequest failed:", err);
    return { error: "처리 중 문제가 생겼어요" };
  }
  await resolveActionRequest(id, uid, "approved");

  revalidatePath("/admin/requests");
  revalidatePath("/admin");
  // 대상 경로도 무효화
  if (req.kind === "delete-relay" || req.kind === "set-relay-status") {
    revalidatePath("/relay");
    revalidatePath(`/relay/${req.targetId}`);
  } else if (req.kind === "delete-keyword") {
    revalidatePath("/keyword");
    revalidatePath(`/keyword/${req.targetId}`);
  } else if (
    req.kind === "delete-photostory" ||
    req.kind === "set-photostory-status"
  ) {
    revalidatePath("/photostory");
    revalidatePath(`/photostory/${req.targetId}`);
  } else if (
    req.kind === "delete-bookclub" ||
    req.kind === "set-bookclub-status"
  ) {
    revalidatePath("/bookclub");
    revalidatePath(`/bookclub/${req.targetId}`);
  }
  return { error: "", ok: true };
}

/** 요청 거절. 상대만 가능. */
export async function rejectRequestAction(
  _prev: RequestActionState,
  formData: FormData
): Promise<RequestActionState> {
  const uid = await getViewerOrFail();
  if (!uid) return { error: "로그인이 필요해요" };

  const id = String(formData.get("id") ?? "");
  if (!id) return { error: "잘못된 요청" };

  const req = await getActionRequest(id);
  if (!req) return { error: "요청을 찾을 수 없어요" };
  if (req.status !== "pending") return { error: "이미 처리된 요청이에요" };
  if (req.requester === uid)
    return { error: "본인이 만든 요청은 거절할 수 없어요" };

  await resolveActionRequest(id, uid, "rejected");
  revalidatePath("/admin/requests");
  return { error: "", ok: true };
}

/** 요청 취소. 요청자 본인만 가능. */
export async function cancelRequestAction(
  _prev: RequestActionState,
  formData: FormData
): Promise<RequestActionState> {
  const uid = await getViewerOrFail();
  if (!uid) return { error: "로그인이 필요해요" };

  const id = String(formData.get("id") ?? "");
  if (!id) return { error: "잘못된 요청" };

  const req = await getActionRequest(id);
  if (!req) return { error: "요청을 찾을 수 없어요" };
  if (req.status !== "pending") return { error: "이미 처리된 요청이에요" };
  if (req.requester !== uid)
    return { error: "본인이 만든 요청만 취소할 수 있어요" };

  await resolveActionRequest(id, uid, "cancelled");
  revalidatePath("/admin/requests");
  return { error: "", ok: true };
}
