import Link from "next/link";
import { listEssays } from "@/lib/essays";
import { listRelays } from "@/lib/relays";
import { listKeywords } from "@/lib/keywords";
import { listBookclubs } from "@/lib/bookclubs";
import { listPhotostories } from "@/lib/photostories";
import type { ReactNode } from "react";

export const dynamic = "force-dynamic";

const DAYS = ["일", "월", "화", "수", "목", "금", "토"];

function formatToday() {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}.${mm}.${dd} · ${DAYS[d.getDay()]}요일`;
}

function relativeTime(ts: number) {
  const diff = Date.now() - ts;
  const min = Math.floor(diff / 60000);
  if (min < 1) return "방금";
  if (min < 60) return `${min}분 전`;
  const hour = Math.floor(min / 60);
  if (hour < 24) return `${hour}시간 전`;
  const day = Math.floor(hour / 24);
  if (day < 7) return `${day}일 전`;
  return `${Math.floor(day / 7)}주 전`;
}

type Activity = {
  icon: string;
  kind: string;
  text: ReactNode;
  when: string;
  ts: number;
  link: string;
};

function authorBadge(author: "Y" | "H") {
  return (
    <span className={author === "Y" ? "text-y" : "text-h"}>
      {author === "Y" ? "Y" : "H"}
    </span>
  );
}

export default async function HomePage() {
  const [essays, relays, keywords, bookclubs, photostories] = await Promise.all([
    listEssays({ status: "published", limit: 50 }),
    listRelays(),
    listKeywords(),
    listBookclubs(),
    listPhotostories(),
  ]);

  // 각 컬렉션 → Activity로 변환
  const activities: Activity[] = [];

  for (const e of essays) {
    activities.push({
      icon: "📝",
      kind: "에세이",
      text: (
        <>
          {authorBadge(e.author)}가 「{e.title}」 을 썼습니다
        </>
      ),
      when: relativeTime(e.createdAt),
      ts: e.createdAt,
      link: `/essay/${e.id}`,
    });
  }

  for (const r of relays) {
    activities.push({
      icon: "✍️",
      kind: "이어쓰기",
      text:
        r.status === "completed" ? (
          <>「{r.title}」이 완결됐어요</>
        ) : (
          <>
            「{r.title}」에 {authorBadge(r.lastAuthor)}가 이어 썼습니다
          </>
        ),
      when: relativeTime(r.updatedAt),
      ts: r.updatedAt,
      link: `/relay/${r.id}`,
    });
  }

  for (const k of keywords) {
    let text: ReactNode;
    if (k.status === "both_done") {
      text = <>키워드 &ldquo;{k.keyword}&rdquo; 둘 다 완성 · 공개</>;
    } else if (k.status === "y_done") {
      text = (
        <>
          키워드 &ldquo;{k.keyword}&rdquo; — Y <span className="text-y">✅</span>{" "}
          H <span className="text-ink-soft">⏳</span>
        </>
      );
    } else if (k.status === "h_done") {
      text = (
        <>
          키워드 &ldquo;{k.keyword}&rdquo; — Y <span className="text-ink-soft">⏳</span>{" "}
          H <span className="text-h">✅</span>
        </>
      );
    } else {
      text = <>새 키워드 &ldquo;{k.keyword}&rdquo;</>;
    }
    activities.push({
      icon: "🎲",
      kind: "키워드",
      text,
      when: relativeTime(k.suggestedAt),
      ts: k.suggestedAt,
      link: `/keyword/${k.id}`,
    });
  }

  for (const b of bookclubs) {
    activities.push({
      icon: "📖",
      kind: "독서모임",
      text: <>「{b.bookTitle}」 — {b.bookAuthor}</>,
      when: b.publishedAt ? relativeTime(b.publishedAt) : "",
      ts: b.publishedAt ?? b.createdAt,
      link: `/bookclub/${b.id}`,
    });
  }

  for (const p of photostories) {
    let text: ReactNode;
    if (p.status === "completed") {
      text = (
        <>
          {authorBadge(p.photoAuthor)}의 사진에 {authorBadge(p.textAuthor)}의 글이 채워졌어요
        </>
      );
    } else {
      text = (
        <>
          {authorBadge(p.photoAuthor)}가 사진을 올렸습니다 ·{" "}
          {authorBadge(p.textAuthor)}의 글 대기중
        </>
      );
    }
    const ts = p.textWrittenAt ?? p.photoUploadedAt;
    activities.push({
      icon: "📷",
      kind: "사진+글",
      text,
      when: relativeTime(ts),
      ts,
      link: `/photostory/${p.id}`,
    });
  }

  const recent = activities.sort((a, b) => b.ts - a.ts).slice(0, 6);

  // 둘러보기 카운트
  const publishedBookclubs = bookclubs.filter((b) => b.status === "published")
    .length;
  const completedPhotos = photostories.filter((p) => p.status === "completed")
    .length;

  const sections = [
    { icon: "📝", label: "에세이", href: "/essay", desc: "나란히 읽기", count: essays.length },
    { icon: "✍️", label: "이어쓰기", href: "/relay", desc: "한 문장씩 번갈아", count: relays.length },
    { icon: "🎲", label: "키워드", href: "/keyword", desc: "AI가 던지는 단어", count: keywords.length },
    { icon: "📖", label: "독서모임", href: "/bookclub", desc: "둘의 대화", count: publishedBookclubs },
    { icon: "📷", label: "사진+글", href: "/photostory", desc: "한 사람의 사진, 한 사람의 글", count: completedPhotos },
  ];

  return (
    <div className="container narrow fade-in">
      <div style={{ padding: "60px 0 40px", textAlign: "center" }}>
        <div className="hand" style={{ fontSize: 22, color: "var(--ink-3)" }}>
          welcome to
        </div>
        <h1
          className="serif"
          style={{
            fontSize: 42,
            letterSpacing: "-0.03em",
            marginTop: 8,
            lineHeight: 1.15,
          }}
        >
          <span style={{ color: "var(--y-deep)" }}>영</span>
          <span style={{ color: "var(--ink-3)", fontWeight: 300 }}> · </span>
          <span style={{ color: "var(--h-deep)" }}>희</span>
          <span>네 작업실</span>
        </h1>
        <div
          className="serif"
          style={{ marginTop: 16, fontSize: 17, color: "var(--ink-2)" }}
        >
          두 사람의 글과 사진이 만나는 곳
        </div>
        <div
          className="hand"
          style={{ marginTop: 24, fontSize: 20, color: "var(--ink-4)" }}
        >
          {formatToday()}
        </div>
      </div>

      <div className="divider-dot" />

      <h2 className="serif" style={{ fontSize: 22, marginBottom: 16 }}>
        오늘의 작업실
      </h2>
      <ul className="col gap-8">
        {recent.length === 0 && (
          <li
            className="card-flat"
            style={{
              textAlign: "center",
              color: "var(--ink-3)",
              padding: "32px",
            }}
          >
            <span className="hand" style={{ fontSize: 18 }}>아직 비어 있어요</span>
          </li>
        )}
        {recent.map((a, i) => (
          <li key={i}>
            <Link
              href={a.link}
              className="card lift"
              style={{
                display: "flex",
                gap: 16,
                padding: "14px 18px",
                alignItems: "center",
              }}
            >
              <span style={{ fontSize: 22, lineHeight: 1 }}>{a.icon}</span>
              <div className="flex-1">
                <div
                  style={{ fontSize: 12, color: "var(--ink-4)", letterSpacing: "0.05em" }}
                >
                  {a.kind.toUpperCase()}
                </div>
                <div
                  className="serif"
                  style={{ fontSize: 16, color: "var(--ink)", marginTop: 2 }}
                >
                  {a.text}
                </div>
              </div>
              {a.when && <span className="meta">{a.when}</span>}
            </Link>
          </li>
        ))}
      </ul>

      <div className="divider-dot" />

      <h2 className="serif" style={{ fontSize: 22, marginBottom: 16 }}>
        둘러보기
      </h2>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
          gap: 12,
        }}
      >
        {sections.map((s) => (
          <Link
            key={s.href}
            href={s.href}
            className="card lift"
            style={{ padding: "18px 16px", textAlign: "center" }}
          >
            <div style={{ fontSize: 28 }}>{s.icon}</div>
            <div className="serif" style={{ fontSize: 16, fontWeight: 600, marginTop: 8 }}>
              {s.label}
            </div>
            <div style={{ fontSize: 12, color: "var(--ink-3)", marginTop: 2 }}>
              {s.desc}
            </div>
            <div
              className="hand"
              style={{ fontSize: 16, color: "var(--ink-4)", marginTop: 6 }}
            >
              {s.count}편
            </div>
          </Link>
        ))}
      </div>

      <div
        style={{ marginTop: 48, textAlign: "center", color: "var(--ink-4)" }}
        className="hand"
      >
        한 페이지에 두 사람의 시간을 모아두는 곳
      </div>
    </div>
  );
}
