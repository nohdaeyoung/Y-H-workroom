import Link from "next/link";
import { listEssays } from "@/lib/essays";
import { listRelays } from "@/lib/relays";
import { listKeywords } from "@/lib/keywords";
import { listBookclubs } from "@/lib/bookclubs";
import { listPhotostories } from "@/lib/photostories";

export const metadata = { title: "여긴 빈 자리예요 — 영이네 작업실" };
export const dynamic = "force-dynamic";

type Pick = {
  kind: "essay" | "relay" | "keyword" | "bookclub" | "photostory";
  icon: string;
  title: string;
  excerpt?: string;
  href: string;
  ts: number;
};

function shortDate(ts: number) {
  const d = new Date(ts);
  return `${d.getMonth() + 1}.${String(d.getDate()).padStart(2, "0")}`;
}

async function gather(): Promise<Pick[]> {
  const [essays, relays, keywords, bookclubs, photos] = await Promise.all([
    listEssays({ limit: 4, status: "published", author: "Y" }).catch(() => []),
    listRelays().catch(() => []),
    listKeywords().catch(() => []),
    listBookclubs({ includeDrafts: false }).catch(() => []),
    listPhotostories({ includeWaiting: false }).catch(() => []),
  ]);

  const picks: Pick[] = [];
  for (const e of essays) {
    picks.push({
      kind: "essay",
      icon: "📝",
      title: e.title,
      excerpt: e.excerpt ?? e.content.replace(/<[^>]+>/g, "").slice(0, 80),
      href: `/essay/${e.id}`,
      ts: e.createdAt,
    });
  }
  for (const r of relays.slice(0, 3)) {
    picks.push({
      kind: "relay",
      icon: "✍️",
      title: r.title,
      excerpt: r.lastSentenceText,
      href: `/relay/${r.id}`,
      ts: r.updatedAt,
    });
  }
  for (const k of keywords.slice(0, 3)) {
    if (!k.yEssay) continue;
    picks.push({
      kind: "keyword",
      icon: "🎲",
      title: `"${k.keyword}"`,
      excerpt: k.yEssay.title,
      href: `/keyword/${k.id}`,
      ts: k.yEssay.writtenAt,
    });
  }
  for (const b of bookclubs.slice(0, 3)) {
    picks.push({
      kind: "bookclub",
      icon: "📖",
      title: `「${b.bookTitle}」`,
      excerpt: b.bookAuthor,
      href: `/bookclub/${b.id}`,
      ts: b.publishedAt ?? b.createdAt,
    });
  }
  for (const p of photos.filter((p) => p.photoAuthor === "Y").slice(0, 3)) {
    picks.push({
      kind: "photostory",
      icon: "📷",
      title: p.photoTitle,
      excerpt: p.text?.replace(/<[^>]+>/g, "").slice(0, 80),
      href: `/photostory`,
      ts: p.photoUploadedAt,
    });
  }
  return picks.sort((a, b) => b.ts - a.ts).slice(0, 6);
}

export default async function NotFoundPage() {
  const picks = await gather();

  return (
    <div className="container narrow fade-in" style={{ maxWidth: 720 }}>
      <div style={{ textAlign: "center", padding: "40px 0 16px" }}>
        <div className="hand" style={{ fontSize: 22, color: "var(--ink-3)" }}>
          오늘 길을 잘못 들었네요
        </div>
        <h1
          className="serif"
          style={{
            fontSize: 28,
            fontWeight: 600,
            marginTop: 8,
            letterSpacing: "-0.02em",
          }}
        >
          여긴 빈 자리예요
        </h1>
        <div className="meta" style={{ marginTop: 8, fontSize: 13 }}>
          대신 다른 글을 가져왔어요
        </div>
      </div>

      <div className="divider-dot" />

      {picks.length === 0 ? (
        <div
          className="card-flat center"
          style={{ padding: 48, color: "var(--ink-3)", marginTop: 24 }}
        >
          <span className="hand" style={{ fontSize: 18 }}>아직 글이 없어요</span>
        </div>
      ) : (
        <div className="col gap-12" style={{ marginTop: 24 }}>
          {picks.map((p, i) => (
            <Link
              key={`${p.kind}-${i}`}
              href={p.href}
              className="card lift"
              style={{ padding: "16px 20px", display: "block" }}
            >
              <div className="row gap-8" style={{ alignItems: "flex-start" }}>
                <span style={{ fontSize: 22, lineHeight: 1.2 }}>{p.icon}</span>
                <div className="flex-1" style={{ minWidth: 0 }}>
                  <div
                    className="meta"
                    style={{ fontSize: 11, color: "var(--ink-3)", marginBottom: 4 }}
                  >
                    {p.kind} · {shortDate(p.ts)}
                  </div>
                  <div
                    className="serif"
                    style={{
                      fontSize: 16,
                      fontWeight: 500,
                      lineHeight: 1.4,
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {p.title}
                  </div>
                  {p.excerpt && (
                    <div
                      className="meta"
                      style={{
                        marginTop: 4,
                        fontSize: 12.5,
                        color: "var(--ink-3)",
                        lineHeight: 1.6,
                        display: "-webkit-box",
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: "vertical",
                        overflow: "hidden",
                      }}
                    >
                      {p.excerpt}
                    </div>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      <div
        className="row gap-8"
        style={{ marginTop: 32, justifyContent: "center", flexWrap: "wrap" }}
      >
        <Link href="/" className="btn btn-primary btn-sm">
          ← 홈으로
        </Link>
        <Link href="/essay" className="btn btn-ghost btn-sm">
          에세이
        </Link>
        <Link href="/relay" className="btn btn-ghost btn-sm">
          이어쓰기
        </Link>
        <Link href="/keyword" className="btn btn-ghost btn-sm">
          키워드
        </Link>
        <Link href="/bookclub" className="btn btn-ghost btn-sm">
          독서모임
        </Link>
        <Link href="/photostory" className="btn btn-ghost btn-sm">
          사진+글
        </Link>
      </div>

      <div
        className="meta"
        style={{ marginTop: 24, textAlign: "center", fontSize: 11, color: "var(--ink-4)" }}
      >
        (찾으려던 페이지가 사라졌거나, 주소가 잘못된 것 같아요)
      </div>
    </div>
  );
}
