import Link from "next/link";
import { MOCK_KEYWORDS, type Keyword } from "@/lib/mock-keywords";

export const metadata = { title: "키워드 — 영희네 작업실" };

function formatDate(ts: number) {
  const d = new Date(ts);
  return `${d.getMonth() + 1}/${d.getDate()}`;
}

function CurrentKeywordCard({ k }: { k: Keyword }) {
  return (
    <Link
      href={`/keyword/${k.id}`}
      className="card lift"
      style={{
        padding: "40px 28px",
        background:
          "linear-gradient(180deg, oklch(0.95 0.03 80) 0%, var(--paper-2) 100%)",
        borderColor: "var(--y-line)",
      }}
    >
      <div style={{ textAlign: "center", marginBottom: 24 }}>
        <div style={{ fontSize: 40, marginBottom: 8 }}>🎲</div>
        <div className="hand" style={{ fontSize: 22, color: "var(--ink-3)" }}>
          이번 주의 키워드
        </div>
        <div
          className="serif"
          style={{
            fontSize: 44,
            fontWeight: 600,
            letterSpacing: "-0.03em",
            marginTop: 8,
          }}
        >
          &ldquo;{k.keyword}&rdquo;
        </div>
        <div className="meta" style={{ marginTop: 8 }}>
          {formatDate(k.suggestedAt)} · AI가 골라준 단어
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        {(["Y", "H"] as const).map((u) => {
          const essay = u === "Y" ? k.yEssay : k.hEssay;
          const cls = u === "Y" ? "y" : "h";
          const name = u === "Y" ? "대영" : "희서";
          return (
            <div
              key={u}
              className="card-flat"
              style={{
                padding: 18,
                background: essay
                  ? u === "Y"
                    ? "var(--y-soft)"
                    : "var(--h-soft)"
                  : "var(--paper)",
                border: "1px solid",
                borderColor: essay
                  ? u === "Y"
                    ? "var(--y-line)"
                    : "var(--h-line)"
                  : "var(--line)",
                textAlign: "center",
              }}
            >
              <span
                className={`avatar-mini ${cls}`}
                style={{
                  width: 36,
                  height: 36,
                  fontSize: 14,
                  margin: "0 auto",
                  display: "flex",
                }}
              >
                {u}
              </span>
              <div
                className="serif"
                style={{ fontSize: 14, fontWeight: 600, marginTop: 8 }}
              >
                {name}
              </div>
              {essay ? (
                <>
                  <div
                    className="hand"
                    style={{
                      fontSize: 18,
                      color: u === "Y" ? "var(--y-deep)" : "var(--h-deep)",
                      marginTop: 4,
                    }}
                  >
                    ✍️ 작성 완료
                  </div>
                  <div
                    style={{ fontSize: 12, color: "var(--ink-3)", marginTop: 4 }}
                  >
                    둘 다 완성 시 공개
                  </div>
                </>
              ) : (
                <>
                  <div
                    className="hand"
                    style={{
                      fontSize: 18,
                      color: "var(--ink-3)",
                      marginTop: 4,
                    }}
                  >
                    ⏳ 작성 대기
                  </div>
                  <div
                    style={{ fontSize: 12, color: "var(--ink-3)", marginTop: 4 }}
                  >
                    1,000자 이내
                  </div>
                </>
              )}
            </div>
          );
        })}
      </div>
    </Link>
  );
}

export default function KeywordListPage() {
  const current = MOCK_KEYWORDS[0];
  const past = MOCK_KEYWORDS.slice(1);

  return (
    <div className="container narrow fade-in" style={{ maxWidth: 760 }}>
      <div style={{ textAlign: "center", marginBottom: 28 }}>
        <div className="hand" style={{ fontSize: 22, color: "var(--ink-3)" }}>
          AI keyword
        </div>
        <h1 className="page-title" style={{ fontSize: 30 }}>
          이번 주의 키워드
        </h1>
        <div className="serif" style={{ color: "var(--ink-2)", marginTop: 6 }}>
          AI가 던진 단어로, 각자의 글을 씁니다.
        </div>
      </div>

      <CurrentKeywordCard k={current} />

      {past.length > 0 && (
        <>
          <h3 className="section-title" style={{ marginTop: 40, marginBottom: 12 }}>
            지난 키워드
          </h3>
          <div className="col gap-12">
            {past.map((k) => (
              <Link
                key={k.id}
                href={`/keyword/${k.id}`}
                className="card lift"
                style={{ padding: "16px 20px" }}
              >
                <div className="row-between" style={{ flexWrap: "wrap", gap: 8 }}>
                  <div className="row gap-12">
                    <span style={{ fontSize: 24 }}>🎲</span>
                    <div>
                      <div className="serif" style={{ fontSize: 18, fontWeight: 600 }}>
                        &ldquo;{k.keyword}&rdquo;
                      </div>
                      <div className="meta" style={{ marginTop: 2 }}>
                        {formatDate(k.suggestedAt)}
                      </div>
                    </div>
                  </div>
                  <div className="row gap-12">
                    <span style={{ fontSize: 13 }}>Y {k.yEssay ? "✅" : "⏳"}</span>
                    <span style={{ fontSize: 13 }}>H {k.hEssay ? "✅" : "⏳"}</span>
                    {k.comments > 0 && <span className="meta">💬 {k.comments}</span>}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
