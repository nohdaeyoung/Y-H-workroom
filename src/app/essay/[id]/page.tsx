import Link from "next/link";
import { notFound } from "next/navigation";
import { auth } from "@/auth";
import { getEssay } from "@/lib/essays";
import SafeHtml from "@/components/SafeHtml";
import Comments from "@/components/Comments";

type Props = { params: { id: string } };

export async function generateMetadata({ params }: Props) {
  const essay = await getEssay(params.id);
  return { title: essay ? `${essay.title} — 영희네 작업실` : "에세이" };
}

function formatDate(ts: number) {
  const d = new Date(ts);
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, "0")}.${String(d.getDate()).padStart(2, "0")}`;
}

export default async function EssayDetailPage({ params }: Props) {
  const [essay, session] = await Promise.all([getEssay(params.id), auth()]);
  if (!essay) notFound();

  const cls = essay.author === "Y" ? "y" : "h";
  const name = essay.author === "Y" ? "대영" : "희서";
  const deepVar = cls === "y" ? "var(--y-deep)" : "var(--h-deep)";
  const isYH = !!session?.user?.id;

  return (
    <div className="container narrow fade-in" style={{ maxWidth: 680 }}>
      <div className="row-between" style={{ marginBottom: 24 }}>
        <Link href="/essay" className="btn btn-ghost btn-sm">
          ← 나란히 보기로
        </Link>
        {session?.user?.id === essay.author && (
          <Link
            href={`/essay/${essay.id}/edit`}
            className="btn btn-ghost btn-sm"
          >
            ✎ 수정
          </Link>
        )}
      </div>

      <div style={{ textAlign: "center", padding: "20px 0 32px" }}>
        <div
          className="row gap-8"
          style={{ justifyContent: "center", marginBottom: 16 }}
        >
          <span className={`avatar-mini ${cls}`}>{essay.author}</span>
          <div style={{ fontSize: 14 }}>
            <span style={{ fontWeight: 500, color: deepVar }}>{name}</span>
            <span className="meta" style={{ marginLeft: 8 }}>
              {formatDate(essay.createdAt)}
            </span>
          </div>
        </div>
        <h1
          className="serif"
          style={{ fontSize: 32, letterSpacing: "-0.025em", lineHeight: 1.3 }}
        >
          {essay.title}
        </h1>
        {essay.tags && essay.tags.length > 0 && (
          <div
            className="row gap-4"
            style={{ justifyContent: "center", marginTop: 14, flexWrap: "wrap" }}
          >
            {essay.tags.map((t) => (
              <span key={t} className="chip" style={{ fontSize: 11 }}>
                #{t}
              </span>
            ))}
          </div>
        )}
      </div>

      <SafeHtml html={essay.content} className="prose" />

      <div className="divider-dot" />

      <Comments parentType="essay" parentId={essay.id} isYH={isYH} />
    </div>
  );
}
