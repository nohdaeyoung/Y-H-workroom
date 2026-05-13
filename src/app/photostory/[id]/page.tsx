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

  const uid = session?.user?.id;
  const isYH = !!uid;
  const canWrite = uid === p.textAuthor && p.status === "waiting";

  const photoAuthorCls = p.photoAuthor.toLowerCase();
  const textAuthorCls = p.textAuthor.toLowerCase();
  const photoName = p.photoAuthor === "Y" ? "대영" : "희서";
  const textName = p.textAuthor === "Y" ? "대영" : "희서";
  const photoDeep =
    p.photoAuthor === "Y" ? "var(--y-deep)" : "var(--h-deep)";
  const textDeep = p.textAuthor === "Y" ? "var(--y-deep)" : "var(--h-deep)";

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
        <div className="row gap-8">
          <span className={`avatar-mini ${photoAuthorCls}`}>{p.photoAuthor}</span>
          <div>
            <div style={{ fontSize: 13, color: "var(--ink-3)" }}>📸 사진</div>
            <div className="hand" style={{ fontSize: 17, color: photoDeep }}>
              {p.photoAuthor} · {formatDate(p.photoUploadedAt)}
            </div>
          </div>
        </div>
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
              p.textAuthor === "Y"
                ? "linear-gradient(180deg, var(--y-soft) 0%, var(--paper-2) 60%)"
                : "linear-gradient(180deg, var(--h-soft) 0%, var(--paper-2) 60%)",
            borderColor:
              p.textAuthor === "Y" ? "var(--y-line)" : "var(--h-line)",
          }}
        >
          <div className="row gap-8" style={{ marginBottom: 16 }}>
            <span className={`avatar-mini ${textAuthorCls}`}>{p.textAuthor}</span>
            <div>
              <div style={{ fontSize: 13, color: "var(--ink-3)" }}>✍️ 글</div>
              <div className="hand" style={{ fontSize: 17, color: textDeep }}>
                {p.textAuthor}
                {p.textWrittenAt && ` · ${formatDate(p.textWrittenAt)}`}
              </div>
            </div>
          </div>
          <SafeHtml html={p.text} className="prose" />
        </div>
      ) : (
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
            <span style={{ color: textDeep, fontWeight: 600 }}>{p.textAuthor}</span>
            의 글을 기다리고 있어요
          </div>
          <div className="meta" style={{ marginTop: 6 }}>
            {p.photoAuthor}가(이) 올린 사진에 어울리는 글이 채워지면 공개됩니다.
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
      )}

      {p.status === "completed" && (
        <Comments parentType="photostory" parentId={p.id} isYH={isYH} />
      )}
    </div>
  );
}
