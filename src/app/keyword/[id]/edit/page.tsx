import Link from "next/link";
import { redirect, notFound } from "next/navigation";
import { auth } from "@/auth";
import { getKeyword } from "@/lib/keywords";
import KeywordEditForm from "./KeywordEditForm";

type Props = { params: { id: string } };

export const metadata = { title: "키워드 수정 — 영희네 작업실" };
export const dynamic = "force-dynamic";

export default async function KeywordEditPage({ params }: Props) {
  const session = await auth();
  const uid = session?.user?.id;
  if (uid !== "Y" && uid !== "H")
    redirect(`/login?from=/keyword/${params.id}/edit`);

  const k = await getKeyword(params.id);
  if (!k) notFound();

  return (
    <div className="container narrow fade-in" style={{ maxWidth: 720 }}>
      <Link href={`/keyword/${k.id}`} className="btn btn-ghost btn-sm">
        ← 키워드로
      </Link>
      <div style={{ marginTop: 16, marginBottom: 24 }}>
        <div className="hand" style={{ fontSize: 20, color: "var(--ink-3)" }}>
          edit keyword
        </div>
        <h1 className="page-title" style={{ fontSize: 26 }}>
          키워드 수정
        </h1>
        <div className="meta" style={{ marginTop: 4 }}>
          키워드 단어는 둘 다 수정 가능 · 글은 본인 것만
        </div>
      </div>

      <KeywordEditForm keyword={k} viewer={uid} />
    </div>
  );
}
