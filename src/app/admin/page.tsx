import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { listEssays } from "@/lib/essays";
import { listRelays } from "@/lib/relays";
import { listKeywords } from "@/lib/keywords";
import { listBookclubs } from "@/lib/bookclubs";
import { listPhotostories } from "@/lib/photostories";

export const metadata = { title: "어드민 — 영희네 작업실" };
export const dynamic = "force-dynamic";

const DAYS = ["일", "월", "화", "수", "목", "금", "토"];

function todayLabel() {
  const d = new Date();
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, "0")}.${String(d.getDate()).padStart(2, "0")} · ${DAYS[d.getDay()]}요일`;
}

export default async function AdminHomePage() {
  const session = await auth();
  const id = session?.user?.id;
  if (id !== "Y" && id !== "H") redirect("/login?from=/admin");
  const name = id === "Y" ? "대영" : "희서";
  const cls = id === "Y" ? "y" : "h";

  const [essays, relays, keywords, bookclubs, photostories] = await Promise.all([
    listEssays({ limit: 100 }),
    listRelays(),
    listKeywords(),
    listBookclubs({ includeDrafts: true }),
    listPhotostories({ includeWaiting: true }),
  ]);

  const myEssayCount = essays.filter((e) => e.author === id).length;

  const counts = {
    essay: myEssayCount,
    relay: relays.length,
    keyword: keywords.filter((k) => (id === "Y" ? k.yEssay : k.hEssay)).length,
    bookclub: bookclubs.length,
    photo: photostories.filter(
      (p) => p.photoAuthor === id || p.textAuthor === id
    ).length,
  };

  const todos: { icon: string; text: string; link: string }[] = [];
  // 아직 안 쓴 키워드
  for (const k of keywords) {
    const mine = id === "Y" ? k.yEssay : k.hEssay;
    if (!mine) {
      todos.push({
        icon: "🎲",
        text: `키워드 "${k.keyword}" 아직 안 쓰셨어요`,
        link: `/keyword/${k.id}`,
      });
      break;
    }
  }
  // 사진+글 대기
  for (const p of photostories) {
    if (p.status === "waiting" && p.textAuthor === id) {
      todos.push({
        icon: "📷",
        text: `${p.photoAuthor}가 사진을 올렸어요 — 글 써주세요`,
        link: `/photostory/${p.id}`,
      });
      break;
    }
  }

  const quickLinks = [
    {
      href: "/admin/my",
      icon: "📚",
      label: "내 글 모아보기",
      desc: "발행 / 임시저장 관리",
    },
    {
      href: "/admin/about",
      icon: "📄",
      label: "소개 관리",
      desc: "About 페이지 편집",
    },
    {
      href: "/admin/account",
      icon: "⚙️",
      label: "계정 설정",
      desc: "비밀번호 · 구글 연동",
    },
  ];

  const sectionCards = [
    { icon: "📝", label: "에세이", n: counts.essay, link: "/admin/my/essay" },
    { icon: "✍️", label: "이어쓰기", n: counts.relay, link: "/admin/my/relay" },
    { icon: "🎲", label: "키워드", n: counts.keyword, link: "/admin/my/keyword" },
    { icon: "📖", label: "독서모임", n: counts.bookclub, link: "/admin/my/bookclub" },
    { icon: "📷", label: "사진+글", n: counts.photo, link: "/admin/my/photo" },
  ];

  return (
    <div
      className="container fade-in"
      style={{
        maxWidth: 880,
        background: "var(--paper-deep)",
        padding: "24px 0",
        borderRadius: "var(--r-lg)",
      }}
    >
      <div style={{ padding: "0 24px" }}>
        <div className="row gap-8" style={{ marginBottom: 24, flexWrap: "wrap" }}>
          <span
            className="chip"
            style={{
              background: "var(--ink)",
              color: "var(--paper-2)",
              borderColor: "var(--ink)",
            }}
          >
            관리자
          </span>
          <span className="meta">/admin</span>
        </div>

        <div style={{ marginBottom: 32 }}>
          <div className="hand" style={{ fontSize: 22, color: "var(--ink-3)" }}>
            hello,
          </div>
          <h1 className="serif" style={{ fontSize: 34, marginTop: 4 }}>
            환영해요,{" "}
            <span className={cls === "y" ? "text-y" : "text-h"}>{name}</span>
          </h1>
          <div className="meta" style={{ marginTop: 6 }}>{todayLabel()}</div>
        </div>

        <h3 className="section-title" style={{ marginBottom: 12 }}>
          내가 쓴 글
        </h3>
        <div className="card" style={{ marginBottom: 24, padding: "20px 24px" }}>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(5, 1fr)",
              gap: 12,
            }}
          >
            {sectionCards.map((s) => (
              <Link
                key={s.label}
                href={s.link}
                className="lift"
                style={{
                  padding: 14,
                  textAlign: "center",
                  borderRadius: "var(--r-md)",
                }}
              >
                <div style={{ fontSize: 22 }}>{s.icon}</div>
                <div
                  className="serif"
                  style={{ fontSize: 22, fontWeight: 600, marginTop: 4 }}
                >
                  {s.n}
                </div>
                <div className="meta">{s.label}</div>
              </Link>
            ))}
          </div>
        </div>

        {todos.length > 0 && (
          <>
            <h3 className="section-title" style={{ marginBottom: 12 }}>
              해야 할 일
            </h3>
            <div className="card" style={{ marginBottom: 24, padding: "8px 0" }}>
              {todos.map((t, i) => (
                <Link
                  key={i}
                  href={t.link}
                  className="row gap-12"
                  style={{
                    padding: "14px 20px",
                    borderBottom:
                      i < todos.length - 1 ? "1px solid var(--line)" : "none",
                    alignItems: "center",
                  }}
                >
                  <span style={{ fontSize: 20 }}>{t.icon}</span>
                  <span className="serif" style={{ fontSize: 15, flex: 1 }}>
                    {t.text}
                  </span>
                  <span className="meta">→</span>
                </Link>
              ))}
            </div>
          </>
        )}

        <h3 className="section-title" style={{ marginBottom: 12 }}>
          설정
        </h3>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
            gap: 12,
          }}
        >
          {quickLinks.map((q) => (
            <Link key={q.href} href={q.href} className="card lift" style={{ padding: 18 }}>
              <div style={{ fontSize: 22 }}>{q.icon}</div>
              <div
                className="serif"
                style={{ fontSize: 16, fontWeight: 600, marginTop: 6 }}
              >
                {q.label}
              </div>
              <div className="meta" style={{ marginTop: 2 }}>
                {q.desc}
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
