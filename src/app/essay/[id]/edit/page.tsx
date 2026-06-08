import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { auth } from "@/auth";
import { getEssay } from "@/lib/essays";
import EssayEditForm from "./EssayEditForm";

type Props = { params: { id: string } };

export const metadata = { title: "에세이 수정 — 영이네 작업실" };
export const dynamic = "force-dynamic";

export default async function EssayEditPage({ params }: Props) {
  const session = await auth();
  const uid = session?.user?.id;
  if (uid !== "Y" && uid !== "H")
    redirect(`/login?from=/essay/${params.id}/edit`);

  const essay = await getEssay(params.id);
  if (!essay) notFound();
  if (essay.author !== uid) {
    redirect(`/essay/${essay.id}`);
  }

  return (
    <div className="container narrow fade-in" style={{ maxWidth: 760 }}>
      <Link href={`/essay/${essay.id}`} className="btn btn-ghost btn-sm">
        ← 글로 돌아가기
      </Link>
      <div style={{ marginTop: 16, marginBottom: 28 }}>
        <div className="hand" style={{ fontSize: 20, color: "var(--ink-3)" }}>
          edit essay
        </div>
        <h1 className="page-title" style={{ fontSize: 26 }}>
          에세이 수정
        </h1>
      </div>

      <EssayEditForm essay={essay} authorId={uid} />
    </div>
  );
}
