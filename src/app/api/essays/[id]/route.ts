import { NextResponse, type NextRequest } from "next/server";
import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { deleteEssay, getEssay, updateEssay } from "@/lib/essays";
import { sanitizeRichHtml } from "@/lib/sanitize";

type Params = { params: { id: string } };

export async function GET(_req: NextRequest, { params }: Params) {
  const essay = await getEssay(params.id);
  if (!essay) {
    return NextResponse.json({ error: "에세이를 찾을 수 없어요" }, { status: 404 });
  }
  return NextResponse.json({ essay });
}

export async function PATCH(req: NextRequest, { params }: Params) {
  const session = await auth();
  const uid = session?.user?.id;
  if (uid !== "Y" && uid !== "H") {
    return NextResponse.json({ error: "로그인이 필요해요" }, { status: 401 });
  }

  const existing = await getEssay(params.id);
  if (!existing) {
    return NextResponse.json({ error: "에세이를 찾을 수 없어요" }, { status: 404 });
  }
  if (existing.author !== uid) {
    return NextResponse.json({ error: "본인 글만 수정할 수 있어요" }, { status: 403 });
  }

  const body = await req.json().catch(() => null);
  if (!body) {
    return NextResponse.json({ error: "잘못된 요청" }, { status: 400 });
  }

  try {
    await updateEssay(params.id, {
      title: typeof body.title === "string" ? body.title : undefined,
      content:
        typeof body.content === "string" ? sanitizeRichHtml(body.content) : undefined,
      excerpt: typeof body.excerpt === "string" ? body.excerpt : undefined,
      tags: Array.isArray(body.tags) ? body.tags : undefined,
      status: body.status,
    });
    revalidatePath("/essay");
    revalidatePath(`/essay/${params.id}`);
    revalidatePath(`/admin/my/essay`);
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("PATCH /api/essays/[id] failed:", err);
    return NextResponse.json({ error: "수정 중 문제가 발생했어요" }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  const session = await auth();
  const uid = session?.user?.id;
  if (uid !== "Y" && uid !== "H") {
    return NextResponse.json({ error: "로그인이 필요해요" }, { status: 401 });
  }

  const existing = await getEssay(params.id);
  if (!existing) {
    return NextResponse.json({ error: "에세이를 찾을 수 없어요" }, { status: 404 });
  }
  if (existing.author !== uid) {
    return NextResponse.json({ error: "본인 글만 삭제할 수 있어요" }, { status: 403 });
  }

  try {
    await deleteEssay(params.id);
    revalidatePath("/essay");
    revalidatePath(`/essay/${params.id}`);
    revalidatePath(`/admin/my/essay`);
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("DELETE /api/essays/[id] failed:", err);
    return NextResponse.json({ error: "삭제 중 문제가 발생했어요" }, { status: 500 });
  }
}
