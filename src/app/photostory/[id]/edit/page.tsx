import Link from "next/link";
import { redirect, notFound } from "next/navigation";
import { auth } from "@/auth";
import { getPhotostory } from "@/lib/photostories";
import PhotostoryEditForm from "./PhotostoryEditForm";

type Props = { params: { id: string } };

export const metadata = { title: "사진+글 수정 — 영희네 작업실" };
export const dynamic = "force-dynamic";

export default async function PhotostoryEditPage({ params }: Props) {
  const session = await auth();
  const uid = session?.user?.id;
  if (uid !== "Y" && uid !== "H")
    redirect(`/login?from=/photostory/${params.id}/edit`);

  const p = await getPhotostory(params.id);
  if (!p) notFound();

  return (
    <div className="container narrow fade-in" style={{ maxWidth: 720 }}>
      <Link href={`/photostory/${p.id}`} className="btn btn-ghost btn-sm">
        ← 사진+글로
      </Link>
      <div style={{ marginTop: 16, marginBottom: 24 }}>
        <div className="hand" style={{ fontSize: 20, color: "var(--ink-3)" }}>
          edit photo + words
        </div>
        <h1 className="page-title" style={{ fontSize: 26 }}>
          사진+글 수정
        </h1>
        <div className="meta" style={{ marginTop: 4 }}>
          📸 {p.photoAuthor === uid ? "사진 작성자" : `사진은 ${p.photoAuthor}만 수정`} · ✍️{" "}
          {p.textAuthor === uid ? "글 작성자" : `글은 ${p.textAuthor}만 수정`}
        </div>
      </div>

      <PhotostoryEditForm photostory={p} viewer={uid} />
    </div>
  );
}
