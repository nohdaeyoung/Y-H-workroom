import "server-only";
import { emailFor, sendMail } from "@/lib/mail";
import type { ActionRequestKind, UserId } from "@/types/domain";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3324";

export type NotificationKind =
  | "essay"
  | "relay"
  | "keyword"
  | "bookclub"
  | "photostory";

const KIND_LABEL: Record<NotificationKind, string> = {
  essay: "에세이",
  relay: "이어쓰기",
  keyword: "키워드",
  bookclub: "독서모임",
  photostory: "사진+글",
};

const NAME: Record<UserId, string> = { Y: "대영", H: "희서" };

export type NotifyPayload = {
  kind: NotificationKind;
  /** 액션을 행한 사람 (글을 쓴 사람). 메일은 반대편에게 발송. */
  actor: UserId;
  /** 컨텐츠 식별자. URL 구성에 사용. */
  id: string;
  /** 메일 제목/본문에 들어갈 짧은 제목 또는 첫 문장. */
  title: string;
  /** 선택: 본문 미리보기 (HTML 살균 후 ~200자). */
  preview?: string;
};

function viewerHref(p: NotifyPayload): string {
  return `${APP_URL}/${p.kind}/${p.id}`;
}

function renderHtml(p: NotifyPayload, recipient: UserId): string {
  const fromName = NAME[p.actor];
  const toName = NAME[recipient];
  const kindLabel = KIND_LABEL[p.kind];
  const href = viewerHref(p);
  const preview = p.preview?.slice(0, 200) ?? "";

  return `<!doctype html>
<html lang="ko">
  <body style="margin:0;padding:24px;background:#f7f3eb;font-family:'Apple SD Gothic Neo','Pretendard',system-ui,sans-serif;color:#3a342c;">
    <table cellpadding="0" cellspacing="0" border="0" width="100%" style="max-width:560px;margin:0 auto;background:#fbfaf6;border-radius:14px;padding:32px;">
      <tr><td>
        <div style="font-family:'Gaegu','Nanum Pen Script',cursive;font-size:18px;color:#85756a;margin-bottom:8px;">영이네 작업실</div>
        <h1 style="font-family:'Noto Serif KR',serif;font-size:22px;font-weight:600;margin:0 0 16px 0;line-height:1.4;">
          ${toName}, ${fromName}가 ${kindLabel}을 남겼어요.
        </h1>
        <h2 style="font-family:'Noto Serif KR',serif;font-size:18px;font-weight:600;margin:0 0 8px 0;">${p.title}</h2>
        ${
          preview
            ? `<div style="color:#5a5048;font-size:14px;line-height:1.7;margin:12px 0 24px 0;border-left:3px solid #c8954a;padding-left:14px;">${preview}</div>`
            : '<div style="margin:0 0 24px 0;"></div>'
        }
        <a href="${href}" style="display:inline-block;background:#3a342c;color:#fbfaf6;padding:12px 22px;border-radius:8px;text-decoration:none;font-weight:500;font-size:14px;">보러가기</a>
        <div style="margin-top:36px;padding-top:20px;border-top:1px solid #e6dfd0;font-size:12px;color:#a59989;font-family:'Gaegu','Nanum Pen Script',cursive;">
          둘만의 작업실에서 보낸 편지예요.
        </div>
      </td></tr>
    </table>
  </body>
</html>`;
}

function subjectFor(p: NotifyPayload, recipient: UserId): string {
  return `${NAME[p.actor]}가 ${KIND_LABEL[p.kind]}을 남겼어요 — ${p.title.slice(0, 40)}`;
}

/**
 * 이벤트 알림. fire-and-forget으로 호출하길 권장 (await 안 해도 됨).
 * 수신자(actor의 반대)의 이메일이 비어있으면 자동 스킵.
 */
export async function notifyOnNewItem(p: NotifyPayload): Promise<boolean> {
  const recipient: UserId = p.actor === "Y" ? "H" : "Y";
  const to = emailFor(recipient);
  if (!to) {
    console.warn(`[notify] ${recipient}_EMAIL 비어있음 — ${p.kind}/${p.id} 발송 스킵`);
    return false;
  }
  return sendMail({
    to,
    subject: subjectFor(p, recipient),
    html: renderHtml(p, recipient),
  });
}

const REQUEST_KIND_LABEL: Record<ActionRequestKind, string> = {
  "delete-relay": "이어쓰기 삭제",
  "delete-keyword": "키워드 전체 삭제",
  "delete-photostory": "사진+글 삭제",
  "delete-bookclub": "독서모임 삭제",
  "set-relay-status": "이어쓰기 상태 전환",
  "set-bookclub-status": "독서모임 상태 전환",
  "set-photostory-status": "사진+글 상태 전환",
};

export type RequestNotifyPayload = {
  kind: ActionRequestKind;
  requester: UserId;
  targetLabel: string;
};

function renderRequestHtml(p: RequestNotifyPayload, recipient: UserId): string {
  const fromName = NAME[p.requester];
  const toName = NAME[recipient];
  const kindLabel = REQUEST_KIND_LABEL[p.kind];
  const href = `${APP_URL}/admin/requests`;

  return `<!doctype html>
<html lang="ko">
  <body style="margin:0;padding:24px;background:#f7f3eb;font-family:'Apple SD Gothic Neo','Pretendard',system-ui,sans-serif;color:#3a342c;">
    <table cellpadding="0" cellspacing="0" border="0" width="100%" style="max-width:560px;margin:0 auto;background:#fbfaf6;border-radius:14px;padding:32px;">
      <tr><td>
        <div style="font-family:'Gaegu','Nanum Pen Script',cursive;font-size:18px;color:#85756a;margin-bottom:8px;">영이네 작업실 · 동의 요청</div>
        <h1 style="font-family:'Noto Serif KR',serif;font-size:22px;font-weight:600;margin:0 0 16px 0;line-height:1.4;">
          ${toName}, ${fromName}가 [${kindLabel}]을 요청했어요.
        </h1>
        <h2 style="font-family:'Noto Serif KR',serif;font-size:18px;font-weight:600;margin:0 0 8px 0;">${p.targetLabel}</h2>
        <div style="color:#5a5048;font-size:14px;line-height:1.7;margin:12px 0 24px 0;border-left:3px solid #c8954a;padding-left:14px;">
          승인하면 실제로 처리돼요. 거절하거나 그냥 두면 변경되지 않아요.
        </div>
        <a href="${href}" style="display:inline-block;background:#3a342c;color:#fbfaf6;padding:12px 22px;border-radius:8px;text-decoration:none;font-weight:500;font-size:14px;">관리자에서 보기</a>
        <div style="margin-top:36px;padding-top:20px;border-top:1px solid #e6dfd0;font-size:12px;color:#a59989;font-family:'Gaegu','Nanum Pen Script',cursive;">
          둘의 동의가 필요한 일이에요.
        </div>
      </td></tr>
    </table>
  </body>
</html>`;
}

/**
 * 동의 요청 생성 시 상대에게 메일 발송. fire-and-forget 권장.
 */
export async function notifyOnActionRequest(
  p: RequestNotifyPayload
): Promise<boolean> {
  const recipient: UserId = p.requester === "Y" ? "H" : "Y";
  const to = emailFor(recipient);
  if (!to) {
    console.warn(`[notify-request] ${recipient}_EMAIL 비어있음 — 발송 스킵`);
    return false;
  }
  return sendMail({
    to,
    subject: `[동의 요청] ${NAME[p.requester]}가 ${REQUEST_KIND_LABEL[p.kind]} 요청 — ${p.targetLabel.slice(0, 40)}`,
    html: renderRequestHtml(p, recipient),
  });
}
