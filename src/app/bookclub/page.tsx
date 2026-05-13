import Link from "next/link";
import { auth } from "@/auth";
import { MOCK_BOOKCLUBS } from "@/lib/mock-bookclubs";

export const metadata = { title: "독서모임 — 영희네 작업실" };

function BookSpine({ title, hue }: { title: string; hue: number }) {
  return (
    <div
      style={{
        width: 80,
        height: 110,
        flexShrink: 0,
        background: `linear-gradient(135deg, oklch(0.78 0.05 ${hue}), oklch(0.55 0.07 ${(hue + 30) % 360}))`,
        borderRadius: "2px 6px 6px 2px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        boxShadow: "2px 2px 6px oklch(0.3 0.04 70 / 0.15)",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          position: "absolute",
          left: 2,
          top: 0,
          bottom: 0,
          width: 4,
          background: "oklch(0.3 0.05 60 / 0.3)",
        }}
      />
      <div
        className="serif"
        style={{
          color: "oklch(0.98 0.01 80)",
          fontSize: 11,
          padding: "0 8px",
          textAlign: "center",
          fontWeight: 500,
          lineHeight: 1.3,
        }}
      >
        {title}
      </div>
    </div>
  );
}

export default async function BookclubListPage() {
  const session = await auth();

  return (
    <div className="container narrow fade-in" style={{ maxWidth: 760 }}>
      <div className="row-between" style={{ marginBottom: 28 }}>
        <div>
          <div className="hand" style={{ fontSize: 22, color: "var(--ink-3)" }}>
            book club
          </div>
          <h1 className="page-title">독서 모임</h1>
          <div className="serif" style={{ color: "var(--ink-2)", marginTop: 4 }}>
            한 권의 책, 한 시간의 대화.
          </div>
        </div>
        {session?.user?.id && (
          <button type="button" className="btn btn-primary" disabled title="Phase 4">
            <span>🎙</span> 녹음 업로드
          </button>
        )}
      </div>

      <div className="col gap-16">
        {MOCK_BOOKCLUBS.map((b, i) => (
          <Link
            key={b.id}
            href={`/bookclub/${b.id}`}
            className="card lift"
            style={{ padding: "20px 22px" }}
          >
            <div className="row gap-20" style={{ flexWrap: "wrap" }}>
              <BookSpine
                title={b.bookTitle}
                hue={30 + (b.bookTitle.charCodeAt(0) * 7) % 200}
              />
              <div className="flex-1">
                <div className="hand" style={{ fontSize: 17, color: "var(--ink-3)" }}>
                  독서모임 #{b.id.split("-")[1]}
                </div>
                <h3 className="serif" style={{ fontSize: 20, marginTop: 2 }}>
                  「{b.bookTitle}」
                </h3>
                <div className="meta" style={{ marginTop: 4 }}>
                  {b.bookAuthor}
                </div>
                <div className="row gap-12" style={{ marginTop: 12, flexWrap: "wrap" }}>
                  <span className="meta">📅 {b.meetingDate}</span>
                  <span className="meta">⏱ {b.duration}</span>
                  {b.comments > 0 && <span className="meta">💬 {b.comments}</span>}
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
