import { NextResponse, type NextRequest } from "next/server";
import { auth } from "@/auth";
import { getDbOrThrow } from "@/lib/firebase-admin";
import { publicUrlFor } from "@/lib/r2";

export const runtime = "nodejs";

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await auth();
  const uid = session?.user?.id;
  if (uid !== "Y" && uid !== "H")
    return NextResponse.json({ error: "로그인이 필요해요" }, { status: 401 });

  const body = await req.json().catch(() => null);
  const key = String(body?.key ?? "");
  if (!key) return NextResponse.json({ error: "key 필수" }, { status: 400 });

  const url = publicUrlFor(key);
  try {
    await getDbOrThrow()
      .collection("bookclubs")
      .doc(params.id)
      .update({ audioUrl: url, audioKey: key });
    return NextResponse.json({ ok: true, audioUrl: url });
  } catch (err) {
    console.error("save audio failed:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "저장 실패" },
      { status: 500 }
    );
  }
}
