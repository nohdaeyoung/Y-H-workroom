import Link from "next/link";
import { notFound } from "next/navigation";
import { auth } from "@/auth";
import { getPhotostory } from "@/lib/mock-photostories";
import PhotoSlider from "@/components/PhotoSlider";
import Comments from "@/components/Comments";

type Props = { params: { id: string } };

export async function generateMetadata({ params }: Props) {
  const p = getPhotostory(params.id);
  return { title: p ? `${p.photoTitle} — 사진+글` : "사진+글" };
}

export default async function PhotostoryDetailPage({ params }: Props) {
  const [p, session] = await Promise.all([
    getPhotostory(params.id),
    auth(),
  ]);
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
      <Link
        href="/photostory"
        className="btn btn-ghost btn-sm"
        style={{ marginBottom: 20 }}
      >
        ← 갤러리
      </Link>

      <PhotoSlider hue={p.photoHue} count={p.photoCount} />

      {/* 사진 정보 */}
      <div
        className="row-between"
        style={{ marginTop: 20, marginBottom: 28, flexWrap: "wrap", gap: 12 }}
      >
        <div className="row gap-8">
          <span className={`avatar-mini ${photoAuthorCls}`}>{p.photoAuthor}</span>
          <div>
            <div style={{ fontSize: 13, color: "var(--ink-3)" }}>📸 사진</div>
            <div
              className="hand"
              style={{ fontSize: 17, color: photoDeep }}
            >
              {photoName} · {p.photoUploadedAt}
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

      {/* 글 영역 */}
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
                {textName} · {p.textWrittenAt}
              </div>
            </div>
          </div>
          <div
            className="prose"
            style={{
              fontSize: 18,
              lineHeight: 2,
              whiteSpace: "pre-line",
            }}
          >
            {p.text}
          </div>
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
            <span style={{ color: textDeep, fontWeight: 600 }}>
              {textName}
            </span>
            의 글을 기다리고 있어요
          </div>
          <div className="meta" style={{ marginTop: 6 }}>
            {p.photoAuthor}가(이) 올린 사진에 어울리는 글이 채워지면 공개됩니다.
          </div>
          {canWrite && (
            <button
              className="btn btn-primary"
              style={{ marginTop: 16 }}
              type="button"
              disabled
              title="Phase 5"
            >
              ✎ 글 쓰러 가기 (Phase 5)
            </button>
          )}
        </div>
      )}

      {p.status === "completed" && (
        <Comments parentType="photostory" parentId={p.id} isYH={isYH} />
      )}
    </div>
  );
}
