import { NextResponse, type NextRequest } from "next/server";
import { sanitizeRichHtml } from "@/lib/sanitize";
import { auth } from "@/auth";
import { createComment, listComments } from "@/lib/comments";
import type { Comment } from "@/types/domain";

const PARENT_TYPES = ["essay", "relay", "keyword", "bookclub", "photostory"] as const;

type ParentType = (typeof PARENT_TYPES)[number];

function isParentType(v: string | null): v is ParentType {
  return PARENT_TYPES.includes(v as ParentType);
}

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const parentType = searchParams.get("parentType");
  const parentId = searchParams.get("parentId");

  if (!isParentType(parentType) || !parentId) {
    return NextResponse.json({ error: "parentType / parentId 필수" }, { status: 400 });
  }

  const session = await auth();
  const isYH = !!session?.user?.id;

  try {
    const all = await listComments(parentType, parentId);
    const visible = isYH ? all : all.filter((c) => !c.secret);
    return NextResponse.json({ comments: visible });
  } catch (err) {
    console.error("GET /api/comments failed:", err);
    return NextResponse.json({ error: "댓글을 가져오지 못했어요" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  if (!body) {
    return NextResponse.json({ error: "잘못된 요청" }, { status: 400 });
  }

  if (!isParentType(body.parentType) || typeof body.parentId !== "string") {
    return NextResponse.json({ error: "parentType / parentId 필수" }, { status: 400 });
  }

  const nickname = String(body.nickname ?? "").trim().slice(0, 20);
  const rawText = String(body.text ?? "");
  const text = sanitizeRichHtml(rawText);
  const textPlain = text.replace(/<[^>]+>/g, "").trim();
  if (!nickname || !textPlain) {
    return NextResponse.json(
      { error: "닉네임과 내용을 입력해주세요" },
      { status: 400 }
    );
  }
  if (text.length > 5000) {
    return NextResponse.json(
      { error: "댓글이 너무 길어요" },
      { status: 400 }
    );
  }

  const session = await auth();
  const secret = !!body.secret && !!session?.user?.id;

  try {
    const comment: Omit<Comment, "id" | "createdAt"> = {
      parentType: body.parentType,
      parentId: body.parentId,
      nickname,
      text,
      secret,
    };
    const created = await createComment(comment);
    return NextResponse.json({ comment: created }, { status: 201 });
  } catch (err) {
    console.error("POST /api/comments failed:", err);
    return NextResponse.json({ error: "댓글 저장 중 문제가 생겼어요" }, { status: 500 });
  }
}
