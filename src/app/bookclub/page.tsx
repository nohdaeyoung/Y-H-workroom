import Link from "next/link";
import { auth } from "@/auth";
import { listBookclubs } from "@/lib/bookclubs";
import { BOOKCLUB_STATUS_LABEL, type Bookclub } from "@/types/domain";

export const metadata = { title: "독서모임 — 영희네 작업실" };
export const dynamic = "force-dynamic";

function BookSpine({
  title,
  hue,
  coverUrl,
}: {
  title: string;
  hue: number;
  coverUrl?: string | null;
}) {
  if (coverUrl) {
    return (
      <div
        style={{
          width: 80,
          height: 110,
          flexShrink: 0,
          borderRadius: "2px 6px 6px 2px",
          overflow: "hidden",
          boxShadow: "2px 2px 6px oklch(0.3 0.04 70 / 0.15)",
        }}
      >
        <img
          src={coverUrl}
          alt={title}
          style={{ width: "100%", height: "100%", objectFit: "cover" }}
        />
      </div>
    );
  }
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

function BookclubCard({ b }: { b: Bookclub }) {
  const chipClass =
    b.status === "finished" ? "chip done" : b.status === "met" ? "chip" : "chip wait";
  return (
    <Link
      href={`/bookclub/${b.id}`}
      className="card lift"
      style={{ padding: "20px 22px" }}
    >
      <div className="row gap-20" style={{ flexWrap: "wrap" }}>
        <BookSpine
          title={b.bookTitle}
          hue={30 + (b.bookTitle.charCodeAt(0) * 7) % 200}
          coverUrl={b.coverUrl}
        />
        <div className="flex-1">
          <div className="row gap-8" style={{ flexWrap: "wrap" }}>
            <span className="hand" style={{ fontSize: 17, color: "var(--ink-3)" }}>
              독서모임 #{b.id.slice(-4)}
            </span>
            <span className={chipClass}>{BOOKCLUB_STATUS_LABEL[b.status]}</span>
          </div>
          <h3 className="serif" style={{ fontSize: 20, marginTop: 2 }}>
            「{b.bookTitle}」
          </h3>
          <div className="meta" style={{ marginTop: 4 }}>
            {b.bookAuthor}
          </div>
          <div className="row gap-12" style={{ marginTop: 12, flexWrap: "wrap" }}>
            <span className="meta">📅 {b.meetingDate}</span>
            {b.duration && <span className="meta">⏱ {b.duration}</span>}
            <span className="meta">💬 {b.transcript.length}줄</span>
          </div>
        </div>
      </div>
    </Link>
  );
}

export default async function BookclubListPage() {
  const session = await auth();
  const isYH = !!session?.user?.id;
  const items = await listBookclubs({ includeDrafts: isYH });

  const published = items.filter((b) => b.status !== "reading");
  const drafts = items.filter((b) => b.status === "reading");

  return (
    <div className="container narrow fade-in" style={{ maxWidth: 760 }}>
      <div className="row-between" style={{ marginBottom: 28, flexWrap: "wrap", gap: 12 }}>
        <div>
          <div className="hand" style={{ fontSize: 22, color: "var(--ink-3)" }}>
            book club
          </div>
          <h1 className="page-title">독서 모임</h1>
          <div className="serif" style={{ color: "var(--ink-2)", marginTop: 4 }}>
            한 권의 책, 한 시간의 대화.
          </div>
        </div>
        {isYH && (
          <Link href="/bookclub/new" className="btn btn-primary">
            <span>＋</span> 새 모임 추가
          </Link>
        )}
      </div>

      {isYH && drafts.length > 0 && (
        <>
          <h3 className="section-title" style={{ marginBottom: 12 }}>
            독서중
          </h3>
          <div className="col gap-16" style={{ marginBottom: 32 }}>
            {drafts.map((b) => (
              <BookclubCard key={b.id} b={b} />
            ))}
          </div>
        </>
      )}

      {published.length === 0 ? (
        <div className="card-flat center" style={{ padding: 48, color: "var(--ink-3)" }}>
          <span className="hand" style={{ fontSize: 18 }}>아직 비어 있어요</span>
        </div>
      ) : (
        <>
          {isYH && drafts.length > 0 && (
            <h3 className="section-title" style={{ marginBottom: 12 }}>
              공개된 모임
            </h3>
          )}
          <div className="col gap-16">
            {published.map((b) => (
              <BookclubCard key={b.id} b={b} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
