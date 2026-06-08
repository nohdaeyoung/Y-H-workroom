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

export default async function HomePage() {
  const [essays, relays, keywords, bookclubs, photostories] = await Promise.all([
    listEssays({ status: "published", author: "Y", limit: 50 }),
    listRelays(),
    listKeywords(),
    listBookclubs(),
    listPhotostories(),
  ]);

  const yPhotos = photostories.filter(
    (p) => p.photoAuthor === "Y" && (p.status === "completed" || p.textAuthor === "Y")
  );

  const activities: Activity[] = [];

  for (const e of essays) {
    activities.push({
      icon: "📝",
      kind: "에세이",
      text: <>「{e.title}」 을 썼습니다</>,
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
          <>「{r.title}」에 한 문장 이어 썼습니다</>
        ),
      when: relativeTime(r.updatedAt),
      ts: r.updatedAt,
      link: `/relay/${r.id}`,
    });
  }

  for (const k of keywords) {
    activities.push({
      icon: "🎲",
      kind: "키워드",
      text: k.yEssay ? (
        <>키워드 &ldquo;{k.keyword}&rdquo;에 글 한 편</>
      ) : (
        <>새 키워드 &ldquo;{k.keyword}&rdquo;</>
      ),
      when: relativeTime(k.yEssay?.writtenAt ?? k.suggestedAt),
      ts: k.yEssay?.writtenAt ?? k.suggestedAt,
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

  for (const p of yPhotos) {
    const ts = p.textWrittenAt ?? p.photoUploadedAt;
    activities.push({
      icon: "📷",
      kind: "사진+글",
      text:
        p.status === "completed" ? (
          <>「{p.photoTitle}」 사진+글</>
        ) : (
          <>「{p.photoTitle}」 사진 올림 · 글 대기중</>
        ),
      when: relativeTime(ts),
      ts,
      link: `/photostory/${p.id}`,
    });
  }

  const recent = activities.sort((a, b) => b.ts - a.ts).slice(0, 6);

  const publishedBookclubs = bookclubs.filter((b) => b.status !== "reading").length;
  const completedPhotos = yPhotos.filter((p) => p.status === "completed").length;
  const keywordsDone = keywords.filter((k) => !!k.yEssay).length;

  const sections = [
    { icon: "📝", label: "에세이", href: "/essay", desc: "오늘의 글", count: essays.length },
    { icon: "✍️", label: "이어쓰기", href: "/relay", desc: "한 문장씩 이어가기", count: relays.length },
    { icon: "🎲", label: "키워드", href: "/keyword", desc: "AI가 던지는 단어", count: keywordsDone },
    { icon: "📖", label: "독서모임", href: "/bookclub", desc: "한 권의 책", count: publishedBookclubs },
    { icon: "📷", label: "사진+글", href: "/photostory", desc: "한 장면, 한 줄", count: completedPhotos },
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
          <span style={{ color: "var(--y-deep)" }}>영이</span>
          <span>네 작업실</span>
        </h1>
        <div
          className="serif"
          style={{ marginTop: 16, fontSize: 17, color: "var(--ink-2)" }}
        >
          영이의 글과 사진이 머무는 곳
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
        한 페이지에 영이의 시간을 모아두는 곳
      </div>
    </div>
  );
}
