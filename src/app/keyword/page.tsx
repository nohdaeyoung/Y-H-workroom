import Link from "next/link";
import { auth } from "@/auth";
import { listKeywords } from "@/lib/keywords";
import NewKeywordButton from "@/components/NewKeywordButton";
import type { Keyword } from "@/types/domain";

export const metadata = { title: "키워드 — 영이네 작업실" };
export const dynamic = "force-dynamic";

function formatDate(ts: number) {
  const d = new Date(ts);
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, "0")}.${String(d.getDate()).padStart(2, "0")}`;
}

function KeywordCard({ k }: { k: Keyword }) {
  const done = !!k.yEssay;
  return (
    <Link
      href={`/keyword/${k.id}`}
      className="card lift"
      style={{ display: "block", padding: "20px 22px" }}
    >
      <div className="row gap-8" style={{ flexWrap: "wrap", marginBottom: 6 }}>
        <span className="hand" style={{ fontSize: 16, color: "var(--ink-3)" }}>
          {formatDate(k.suggestedAt)}
        </span>
        <span className={done ? "chip done" : "chip wait"}>
          {done ? "쓴 글 있음" : "대기 중"}
        </span>
      </div>
      <h3 className="serif" style={{ fontSize: 22, marginTop: 4 }}>
        &ldquo;{k.keyword}&rdquo;
      </h3>
      {k.yEssay && (
        <div
          className="serif"
          style={{ marginTop: 8, color: "var(--ink-2)", fontSize: 14 }}
        >
          {k.yEssay.title}
        </div>
      )}
    </Link>
  );
}

export default async function KeywordListPage() {
  const [items, session] = await Promise.all([listKeywords(), auth()]);
  const isYH = !!session?.user?.id;

  // 솔로 모드: 마지막 키워드에 Y가 글을 썼거나, 처음이면 새 키워드 요청 가능.
  const lastKeyword = items[0];
  const canRequest = !lastKeyword || !!lastKeyword.yEssay;

  return (
    <div className="container narrow fade-in" style={{ maxWidth: 760 }}>
      <div className="row-between" style={{ marginBottom: 24, flexWrap: "wrap", gap: 12 }}>
        <div>
          <div className="hand" style={{ fontSize: 22, color: "var(--ink-3)" }}>
            keyword
          </div>
          <h1 className="page-title">키워드</h1>
          <div
            className="serif"
            style={{ color: "var(--ink-2)", marginTop: 4 }}
          >
            AI가 던지는 단어 한 개에 글 한 편
          </div>
        </div>
        {isYH && (
          <NewKeywordButton canRequest={canRequest} variant="primary" />
        )}
      </div>

      {items.length === 0 ? (
        <div className="card-flat center" style={{ padding: 48, color: "var(--ink-3)" }}>
          <span className="hand" style={{ fontSize: 18 }}>
            아직 받은 키워드가 없어요
          </span>
        </div>
      ) : (
        <div className="col gap-16">
          {items.map((k) => (
            <KeywordCard key={k.id} k={k} />
          ))}
        </div>
      )}
    </div>
  );
}
