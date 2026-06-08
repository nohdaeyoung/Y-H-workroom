import Link from "next/link";
import { notFound } from "next/navigation";
import parse from "html-react-parser";
import { auth } from "@/auth";
import { getKeyword } from "@/lib/keywords";
import { sanitizeRichHtml } from "@/lib/sanitize";
import KeywordWriteButton from "@/components/KeywordWriteButton";
import Comments from "@/components/Comments";

type Props = { params: { id: string } };

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: Props) {
  const k = await getKeyword(params.id);
  return { title: k ? `"${k.keyword}" — 키워드` : "키워드" };
}

function formatDate(ts: number) {
  const d = new Date(ts);
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, "0")}.${String(d.getDate()).padStart(2, "0")}`;
}

export default async function KeywordDetailPage({ params }: Props) {
  const [k, session] = await Promise.all([getKeyword(params.id), auth()]);
  if (!k) notFound();

  const uid = session?.user?.id;
  const isYH = !!uid;
  const essay = k.yEssay;
  const canWrite = uid === "Y" && !essay;

  return (
    <div className="container narrow fade-in" style={{ maxWidth: 720 }}>
      <div className="row-between" style={{ marginBottom: 20 }}>
        <Link href="/keyword" className="btn btn-ghost btn-sm">
          ← 키워드 목록
        </Link>
        {isYH && (
          <Link
            href={`/keyword/${k.id}/edit`}
            className="btn btn-ghost btn-sm"
          >
            ✎ 수정
          </Link>
        )}
      </div>

      <div style={{ textAlign: "center", padding: "16px 0 32px" }}>
        <div className="hand" style={{ fontSize: 22, color: "var(--ink-3)" }}>
          keyword
        </div>
        <h1
          className="serif"
          style={{
            fontSize: 40,
            marginTop: 6,
            letterSpacing: "-0.02em",
          }}
        >
          &ldquo;{k.keyword}&rdquo;
        </h1>
        <div className="meta" style={{ marginTop: 8 }}>
          {formatDate(k.suggestedAt)} · AI가 던진 단어
        </div>
      </div>

      {essay ? (
        <div
          className="card"
          style={{
            padding: "28px 28px 24px",
            background:
              "linear-gradient(180deg, var(--y-soft) 0%, var(--paper-2) 60%)",
            borderColor: "var(--y-line)",
          }}
        >
          <div className="meta" style={{ marginBottom: 12 }}>
            ✍️ {formatDate(essay.writtenAt)}
          </div>
          <h2
            className="serif"
            style={{ fontSize: 24, marginBottom: 16, lineHeight: 1.4 }}
          >
            {essay.title}
          </h2>
          <div className="prose">{parse(sanitizeRichHtml(essay.content))}</div>
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
          <div style={{ fontSize: 36, opacity: 0.5 }}>⏳</div>
          <div className="serif" style={{ fontSize: 18, marginTop: 12 }}>
            이 키워드에 아직 글이 없어요
          </div>
          {canWrite && (
            <div style={{ marginTop: 16 }}>
              <KeywordWriteButton keywordId={k.id} keyword={k.keyword} />
            </div>
          )}
        </div>
      )}

      <div className="divider-dot" />

      <Comments parentType="keyword" parentId={k.id} isYH={isYH} />
    </div>
  );
}
