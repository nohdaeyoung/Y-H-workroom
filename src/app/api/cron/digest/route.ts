import { NextResponse, type NextRequest } from "next/server";
import { listEssays } from "@/lib/essays";
import { listRelays } from "@/lib/relays";
import { listKeywords } from "@/lib/keywords";
import { listBookclubs } from "@/lib/bookclubs";
import { listPhotostories } from "@/lib/photostories";
import { emailFor, sendMail } from "@/lib/mail";
import type { UserId } from "@/types/domain";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const ONE_DAY_MS = 24 * 60 * 60 * 1000;
const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://yh-workroom.vercel.app";

type DigestItem = {
  href: string;
  label: string;
};

function authorized(req: NextRequest): boolean {
  const expected = process.env.CRON_SECRET;
  if (!expected) return false;
  const header = req.headers.get("authorization") || "";
  return header === `Bearer ${expected}`;
}

async function collectYesterday(): Promise<DigestItem[]> {
  const since = Date.now() - ONE_DAY_MS;
  const [essays, relays, keywords, bookclubs, photostories] = await Promise.all([
    listEssays({ limit: 50, status: "published", author: "Y" }),
    listRelays(),
    listKeywords(),
    listBookclubs({ includeDrafts: false }),
    listPhotostories({ includeWaiting: true }),
  ]);

  const items: DigestItem[] = [];

  for (const e of essays) {
    if (e.createdAt >= since) {
      items.push({ href: `${APP_URL}/essay/${e.id}`, label: `📝 에세이 「${e.title}」` });
    }
  }
  for (const r of relays) {
    if (r.updatedAt >= since) {
      items.push({ href: `${APP_URL}/relay/${r.id}`, label: `✍️ 이어쓰기 「${r.title}」` });
    }
  }
  for (const k of keywords) {
    if (k.yEssay && k.yEssay.writtenAt >= since) {
      items.push({ href: `${APP_URL}/keyword/${k.id}`, label: `🎲 키워드 "${k.keyword}"` });
    }
  }
  for (const b of bookclubs) {
    if (b.publishedAt && b.publishedAt >= since) {
      items.push({ href: `${APP_URL}/bookclub/${b.id}`, label: `📖 독서모임 「${b.bookTitle}」` });
    }
  }
  for (const p of photostories) {
    if (p.photoAuthor !== "Y") continue;
    if (p.photoUploadedAt >= since) {
      items.push({ href: `${APP_URL}/photostory/${p.id}`, label: `📷 사진 「${p.photoTitle}」` });
    }
    if (p.textWrittenAt && p.textWrittenAt >= since) {
      items.push({ href: `${APP_URL}/photostory/${p.id}`, label: `📷 글이 채워진 「${p.photoTitle}」` });
    }
  }

  return items;
}

function renderDigest(items: DigestItem[], recipient: UserId): string {
  const rows = items
    .map(
      (it) => `
    <tr><td style="padding:8px 0;border-bottom:1px solid #ece6d7;">
      <a href="${it.href}" style="color:#3a342c;text-decoration:none;">${it.label}</a>
    </td></tr>`
    )
    .join("");
  const name = recipient === "Y" ? "대영" : "희서";
  return `<!doctype html>
<html lang="ko"><body style="margin:0;padding:24px;background:#f7f3eb;font-family:'Apple SD Gothic Neo','Pretendard',system-ui,sans-serif;color:#3a342c;">
  <table cellpadding="0" cellspacing="0" border="0" width="100%" style="max-width:560px;margin:0 auto;background:#fbfaf6;border-radius:14px;padding:32px;">
    <tr><td>
      <div style="font-family:'Gaegu','Nanum Pen Script',cursive;font-size:18px;color:#85756a;margin-bottom:8px;">영이네 작업실 · 어제의 작업</div>
      <h1 style="font-family:'Noto Serif KR',serif;font-size:22px;font-weight:600;margin:0 0 20px 0;line-height:1.4;">
        ${name}, 어제는 이런 것들이 쌓였어요.
      </h1>
      <table cellpadding="0" cellspacing="0" border="0" width="100%">${rows}</table>
      <div style="margin-top:24px;"><a href="${APP_URL}" style="display:inline-block;background:#3a342c;color:#fbfaf6;padding:12px 22px;border-radius:8px;text-decoration:none;font-weight:500;font-size:14px;">작업실 둘러보기</a></div>
      <div style="margin-top:36px;padding-top:20px;border-top:1px solid #e6dfd0;font-size:12px;color:#a59989;font-family:'Gaegu','Nanum Pen Script',cursive;">매일 아침의 우편함.</div>
    </td></tr>
  </table>
</body></html>`;
}

export async function GET(req: NextRequest) {
  if (!authorized(req)) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  let items: DigestItem[] = [];
  try {
    items = await collectYesterday();
  } catch (err) {
    console.error("[cron/digest] collect failed:", err);
    return NextResponse.json({ ok: false, error: "collect_failed" }, { status: 500 });
  }

  if (items.length === 0) {
    return NextResponse.json({ ok: true, sent: 0, reason: "no_items" });
  }

  let sent = 0;
  // Y에게만 발송.
  const to = emailFor("Y");
  if (to) {
    const html = renderDigest(items, "Y");
    const ok = await sendMail({
      to,
      subject: `영이네 작업실 · 어제는 ${items.length}건 쌓였어요`,
      html,
    });
    if (ok) sent++;
  }

  return NextResponse.json({ ok: true, sent, items: items.length });
}
