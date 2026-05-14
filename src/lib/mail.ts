import "server-only";
import { Resend } from "resend";
import type { UserId } from "@/types/domain";

const API_KEY = process.env.RESEND_API_KEY ?? "";
const FROM = process.env.MAIL_FROM ?? "onboarding@resend.dev";
const Y_EMAIL = process.env.Y_EMAIL ?? "";
const H_EMAIL = process.env.H_EMAIL ?? "";

let _client: Resend | null = null;
function getClient(): Resend | null {
  if (!API_KEY) return null;
  if (!_client) _client = new Resend(API_KEY);
  return _client;
}

export function emailFor(user: UserId): string | null {
  const v = user === "Y" ? Y_EMAIL : H_EMAIL;
  return v && v.trim() ? v.trim() : null;
}

export type SendArgs = {
  to: string;
  subject: string;
  html: string;
};

/**
 * 메일 발송. 실패해도 throw 안 함 (작성 흐름 보호).
 * 환경변수 누락 / API 실패 시 console.warn 후 false 반환.
 */
export async function sendMail({ to, subject, html }: SendArgs): Promise<boolean> {
  const client = getClient();
  if (!client) {
    console.warn("[mail] RESEND_API_KEY 미설정 — 발송 스킵");
    return false;
  }
  if (!to) {
    console.warn("[mail] 수신자 비어있음 — 발송 스킵");
    return false;
  }
  try {
    const { error } = await client.emails.send({
      from: FROM,
      to,
      subject,
      html,
    });
    if (error) {
      console.warn("[mail] Resend 응답 에러:", error);
      return false;
    }
    return true;
  } catch (err) {
    console.warn("[mail] 발송 실패:", err);
    return false;
  }
}
