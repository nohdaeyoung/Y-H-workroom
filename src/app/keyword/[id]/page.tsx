import Link from "next/link";
import { notFound } from "next/navigation";
import { auth } from "@/auth";
import { getKeyword } from "@/lib/mock-keywords";
import KeywordSplit from "@/components/KeywordSplit";
import Comments from "@/components/Comments";

type Props = { params: { id: string } };

export async function generateMetadata({ params }: Props) {
  const k = getKeyword(params.id);
  return { title: k ? `"${k.keyword}" — 키워드` : "키워드" };
}

function formatDate(ts: number) {
  const d = new Date(ts);
  return `${d.getMonth() + 1}/${d.getDate()}`;
}

export default async function KeywordDetailPage({ params }: Props) {
  const [k, session] = await Promise.all([getKeyword(params.id), auth()]);
  if (!k) notFound();

  const uid = session?.user?.id;
  const isYH = uid === "Y" || uid === "H";
  const bothDone = !!k.yEssay && !!k.hEssay;
  const myEssay = uid === "Y" ? k.yEssay : uid === "H" ? k.hEssay : null;
  const myMissing = isYH && !myEssay;

  return (
    <div className="container fade-in" style={{ maxWidth: 1080 }}>
      <Link
        href="/keyword"
        className="btn btn-ghost btn-sm"
        style={{ marginBottom: 20 }}
      >
        ← 키워드 목록
      </Link>

      <div
        className="card"
        style={{
          padding: "36px 28px",
          marginBottom: 24,
          background:
            "linear-gradient(180deg, oklch(0.95 0.03 80) 0%, var(--paper-2) 100%)",
          textAlign: "center",
        }}
      >
        <div style={{ fontSize: 32, marginBottom: 4 }}>🎲</div>
        <div className="hand" style={{ fontSize: 20, color: "var(--ink-3)" }}>
          키워드
        </div>
        <div
          className="serif"
          style={{
            fontSize: 40,
            fontWeight: 600,
            letterSpacing: "-0.03em",
            marginTop: 6,
          }}
        >
          &ldquo;{k.keyword}&rdquo;
        </div>
        <div className="meta" style={{ marginTop: 8 }}>
          {formatDate(k.suggestedAt)}
        </div>
      </div>

      {myMissing && uid && (
        <div
          className="card y"
          style={{
            marginBottom: 20,
            padding: 18,
            background: uid === "Y" ? "var(--y-soft)" : "var(--h-soft)",
            borderColor: uid === "Y" ? "var(--y-line)" : "var(--h-line)",
          }}
        >
          <div className="row-between" style={{ flexWrap: "wrap", gap: 12 }}>
            <div className="row gap-12">
              <span className={`avatar-mini ${uid.toLowerCase()}`}>{uid}</span>
              <div>
                <div style={{ fontSize: 14, fontWeight: 500 }}>
                  아직 글을 쓰지 않으셨어요.
                </div>
                <div className="meta">
                  상대방의 글은 당신이 완성해야 보입니다.
                </div>
              </div>
            </div>
            <button className="btn btn-primary" type="button" disabled>
              ✎ 지금 쓰기 (데모)
            </button>
          </div>
        </div>
      )}

      <KeywordSplit
        yEssay={k.yEssay}
        hEssay={k.hEssay}
        viewerId={uid ?? null}
        bothDone={bothDone}
      />

      {!bothDone && (
        <div
          className="card-flat"
          style={{
            marginTop: 16,
            padding: 14,
            background: "var(--paper-ink)",
            textAlign: "center",
            border: "1px dashed var(--line-2)",
          }}
        >
          <span className="meta">
            둘 다 완성하면 동시에 공개됩니다. 그때까지는 서로의 글이 보이지 않아요.
          </span>
        </div>
      )}

      {bothDone && (
        <Comments parentType="keyword" parentId={k.id} isYH={isYH} />
      )}
    </div>
  );
}
