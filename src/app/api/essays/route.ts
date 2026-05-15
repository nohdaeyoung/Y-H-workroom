import { NextResponse, type NextRequest } from "next/server";
import { auth } from "@/auth";
import { createEssay, listEssays } from "@/lib/essays";
import { notifyOnNewItem } from "@/lib/notifications";
import { sanitizeRichHtml } from "@/lib/sanitize";
import type { EssayStatus, UserId } from "@/types/domain";

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const author = searchParams.get("author") as UserId | null;
  const status = searchParams.get("status") as EssayStatus | null;
  const limit = Number(searchParams.get("limit")) || undefined;

  try {
    const essays = await listEssays({
      author: author ?? undefined,
      status: status ?? "published",
      limit,
    });
    return NextResponse.json({ essays });
  } catch (err) {
    console.error("GET /api/essays failed:", err);
    return NextResponse.json({ error: "에세이 목록을 가져오지 못했어요" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const session = await auth();
  const authorId = session?.user?.id;
  if (authorId !== "Y" && authorId !== "H") {
    return NextResponse.json({ error: "로그인이 필요해요" }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  if (!body || typeof body.title !== "string" || typeof body.content !== "string") {
    return NextResponse.json({ error: "title / content 필수" }, { status: 400 });
  }

  try {
    const essay = await createEssay({
      author: authorId,
      title: body.title.trim() || "(제목 없음)",
      content: sanitizeRichHtml(body.content),
      excerpt: typeof body.excerpt === "string" ? body.excerpt : undefined,
      tags: Array.isArray(body.tags) ? body.tags : [],
      status: (body.status as EssayStatus) ?? "published",
    });
    if (essay.status === "published") {
      void notifyOnNewItem({
        kind: "essay",
        actor: authorId,
        id: essay.id,
        title: essay.title,
        preview: essay.excerpt ?? essay.content.replace(/<[^>]+>/g, "").slice(0, 200),
      });
    }
    return NextResponse.json({ essay }, { status: 201 });
  } catch (err) {
    console.error("POST /api/essays failed:", err);
    return NextResponse.json(
      { error: "에세이 저장 중 문제가 발생했어요" },
      { status: 500 }
    );
  }
}
