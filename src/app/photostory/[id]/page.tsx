import Link from "next/link";
import { notFound } from "next/navigation";
import { auth } from "@/auth";
import { getPhotostory } from "@/lib/photostories";
import PhotoSlider from "@/components/PhotoSlider";
import PhotostoryWriteButton from "@/components/PhotostoryWriteButton";
import Comments from "@/components/Comments";
import SafeHtml from "@/components/SafeHtml";

type Props = { params: { id: string } };

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: Props) {
  const p = await getPhotostory(params.id);
  return { title: p ? `${p.photoTitle} — 사진+글` : "사진+글" };
}

function formatDate(ts: number) {
  const d = new Date(ts);
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, "0")}.${String(d.getDate()).padStart(2, "0")}`;
}

export default async function PhotostoryDetailPage({ params }: Props) {
  const [p, session] = await Promise.all([getPhotostory(params.id), auth()]);
  if (!p) notFound();
  // Y가 찍은 사진만 노출.
  if (p.photoAuthor !== "Y") notFound();

  const uid = session?.user?.id;
  const isYH = !!uid;
  const canWrite = uid === p.textAuthor && p.status === "waiting";

  return (
    <div className="container narrow fade-in" style={{ maxWidth: 740 }}>
      <div className="row-between" style={{ marginBottom: 20 }}>
        <Link href="/photostory" className="btn btn-ghost btn-sm">
          ← 갤러리
        </Link>
        {(uid === p.photoAuthor || uid === p.textAuthor) && (
          <Link
            href={`/photostory/${p.id}/edit`}
            className="btn btn-ghost btn-sm"
          >
            ✎ 수정
          </Link>
        )}
      </div>

      <PhotoSlider photos={p.photos} fallbackHue={60} />

      <div
        className="row-between"
        style={{ marginTop: 20, marginBottom: 28, flexWrap: "wrap", gap: 12 }}
      >
        <div className="meta">📸 {formatDate(p.photoUploadedAt)}</div>
        {p.photoTitle && (
          <div
            className="hand"
            style={{ fontSize: 18, color: "var(--ink-3)", textAlign: "right" }}
          >
            &ldquo;{p.photoTitle}&rdquo;
          </div>
        )}
      </div>

      {p.status === "completed" && p.text ? (
        <div
          className="card"
          style={{
            padding: "28px 28px 24px",
            background:
              "linear-gradient(180deg, var(--y-soft) 0%, var(--paper-2) 60%)",
            borderColor: "var(--y-line)",
          }}
        >
          <div className="meta" style={{ marginBottom: 16 }}>
            ✍️ {p.textWrittenAt ? formatDate(p.textWrittenAt) : ""}
          </div>
          <SafeHtml html={p.text} className="prose" />
        </div>
      ) : isYH ? (
        <div
          className="card"
          style={{
            padding: "40px 24px",
            textAlign: "center",
            borderStyle: "dashed",
          }}
        >
          <div style={{ fontSize: 36, opacity: 0.5 }}>✍️</div>
          <div className="serif" style={{ fontSize: 18, marginTop: 12 }}>
            아직 글을 적지 않았어요
          </div>
          {canWrite && (
            <div style={{ marginTop: 16 }}>
              <PhotostoryWriteButton
                photostoryId={p.id}
                photoTitle={p.photoTitle}
                photoUrl={p.photos[0]}
              />
            </div>
          )}
        </div>
      ) : null}

      {p.status === "completed" && (
        <Comments parentType="photostory" parentId={p.id} isYH={isYH} />
      )}
    </div>
  );
}
