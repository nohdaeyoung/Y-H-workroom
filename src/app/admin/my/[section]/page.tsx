import Link from "next/link";
import { redirect, notFound } from "next/navigation";
import { auth } from "@/auth";
import { listEssays } from "@/lib/essays";
import { MOCK_RELAYS } from "@/lib/mock-relays";
import { MOCK_KEYWORDS } from "@/lib/mock-keywords";
import { MOCK_BOOKCLUBS } from "@/lib/mock-bookclubs";
import { MOCK_PHOTOSTORIES } from "@/lib/mock-photostories";
import type { UserId } from "@/types/domain";

export const dynamic = "force-dynamic";

type Section = "essay" | "relay" | "keyword" | "bookclub" | "photo";

const TABS: { id: Section; label: string }[] = [
  { id: "essay", label: "📝 에세이" },
  { id: "relay", label: "✍️ 이어쓰기" },
  { id: "keyword", label: "🎲 키워드" },
  { id: "bookclub", label: "📖 독서모임" },
  { id: "photo", label: "📷 사진+글" },
];

const STATUS_LABELS: Record<string, string> = {
  all: "전체",
  published: "발행됨",
  draft: "임시저장",
  private: "비공개",
};

function formatDate(ts: number) {
  const d = new Date(ts);
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, "0")}.${String(d.getDate()).padStart(2, "0")}`;
}

type ListItem = {
  id: string;
  title: string;
  excerpt?: string;
  status: string;
  dateLabel: string;
  comments: number;
  href: string;
};

async function getItems(section: Section, uid: UserId): Promise<ListItem[]> {
  if (section === "essay") {
    const essays = await listEssays({ author: uid, limit: 100 });
    return essays.map((e) => ({
      id: e.id,
      title: e.title,
      excerpt: e.excerpt,
      status: e.status,
      dateLabel: formatDate(e.createdAt),
      comments: 0,
      href: `/essay/${e.id}`,
    }));
  }
  if (section === "relay") {
    return MOCK_RELAYS.map((r) => ({
      id: r.id,
      title: r.title,
      excerpt: r.sentences[0]?.text,
      status: r.status === "completed" ? "published" : "published",
      dateLabel: formatDate(r.updatedAt),
      comments: 0,
      href: `/relay/${r.id}`,
    }));
  }
  if (section === "keyword") {
    return MOCK_KEYWORDS.filter((k) => (uid === "Y" ? k.yEssay : k.hEssay)).map(
      (k) => {
        const mine = uid === "Y" ? k.yEssay : k.hEssay;
        return {
          id: k.id,
          title: `"${k.keyword}"`,
          excerpt: mine?.title,
          status: "published",
          dateLabel: formatDate(k.suggestedAt),
          comments: k.comments,
          href: `/keyword/${k.id}`,
        };
      }
    );
  }
  if (section === "bookclub") {
    return MOCK_BOOKCLUBS.map((b) => ({
      id: b.id,
      title: `「${b.bookTitle}」`,
      excerpt: b.bookAuthor,
      status: "published",
      dateLabel: b.meetingDate,
      comments: b.comments,
      href: `/bookclub/${b.id}`,
    }));
  }
  if (section === "photo") {
    return MOCK_PHOTOSTORIES.filter(
      (p) => p.photoAuthor === uid || p.textAuthor === uid
    ).map((p) => ({
      id: p.id,
      title: p.photoTitle,
      excerpt: p.text?.split("\n")[0] ?? "",
      status: p.status === "completed" ? "published" : "draft",
      dateLabel: p.photoUploadedAt,
      comments: p.comments,
      href: `/photostory/${p.id}`,
    }));
  }
  return [];
}

export default async function AdminMySectionPage({
  params,
  searchParams,
}: {
  params: { section: string };
  searchParams?: { status?: string };
}) {
  const session = await auth();
  const id = session?.user?.id;
  if (id !== "Y" && id !== "H") redirect("/login?from=/admin/my");

  const section = params.section as Section;
  if (!TABS.some((t) => t.id === section)) notFound();

  const name = id === "Y" ? "대영" : "희서";
  const cls = id === "Y" ? "y" : "h";

  const statusFilter = searchParams?.status ?? "all";
  const allItems = await getItems(section, id);
  const items =
    statusFilter === "all"
      ? allItems
      : allItems.filter((it) => it.status === statusFilter);

  return (
    <div className="container fade-in" style={{ maxWidth: 980 }}>
      <Link
        href="/admin"
        className="btn btn-ghost btn-sm"
        style={{ marginBottom: 16 }}
      >
        ← 어드민 홈
      </Link>

      <div
        className="row gap-12"
        style={{ marginBottom: 24, alignItems: "flex-end", flexWrap: "wrap" }}
      >
        <div>
          <div className="hand" style={{ fontSize: 20, color: "var(--ink-3)" }}>
            my posts
          </div>
          <h1 className="page-title">내 글 모아보기</h1>
        </div>
        <span className={`avatar-mini ${cls}`} style={{ marginLeft: "auto" }}>
          {id}
        </span>
        <span className="hand" style={{ fontSize: 17, color: "var(--ink-3)" }}>
          {name}의 글
        </span>
      </div>

      {/* 탭 */}
      <div
        className="row gap-4"
        style={{
          borderBottom: "1px solid var(--line)",
          marginBottom: 24,
          overflowX: "auto",
        }}
      >
        {TABS.map((t) => (
          <Link
            key={t.id}
            href={`/admin/my/${t.id}`}
            className="btn btn-ghost btn-sm"
            style={{
              borderRadius: "6px 6px 0 0",
              borderBottom:
                section === t.id ? "2px solid var(--ink)" : "2px solid transparent",
              color: section === t.id ? "var(--ink)" : "var(--ink-3)",
              fontWeight: section === t.id ? 500 : 400,
              padding: "10px 14px",
              marginBottom: -1,
              whiteSpace: "nowrap",
            }}
          >
            {t.label}
          </Link>
        ))}
      </div>

      {/* 상태 필터 */}
      <div
        className="row gap-8"
        style={{ marginBottom: 16, flexWrap: "wrap" }}
      >
        {Object.keys(STATUS_LABELS).map((s) => {
          const active = statusFilter === s;
          return (
            <Link
              key={s}
              href={`/admin/my/${section}?status=${s}`}
              className="chip"
              style={{
                background: active ? "var(--ink)" : "var(--paper-2)",
                color: active ? "var(--paper-2)" : "var(--ink-2)",
                borderColor: active ? "var(--ink)" : "var(--line)",
              }}
            >
              {STATUS_LABELS[s]}
            </Link>
          );
        })}
      </div>

      {/* 리스트 */}
      <div className="col gap-8">
        {items.length === 0 ? (
          <div className="card" style={{ padding: 40, textAlign: "center" }}>
            <div className="hand" style={{ fontSize: 22, color: "var(--ink-3)" }}>
              아직 글이 없어요
            </div>
          </div>
        ) : (
          items.map((item) => (
            <div
              key={item.id}
              className="card"
              style={{ padding: "16px 20px" }}
            >
              <div className="row-between" style={{ flexWrap: "wrap", gap: 12 }}>
                <div className="flex-1">
                  <div
                    className="row gap-8"
                    style={{ marginBottom: 4, flexWrap: "wrap" }}
                  >
                    <span className="chip" style={{ fontSize: 11 }}>
                      {STATUS_LABELS[item.status] || "발행됨"}
                    </span>
                    <span className="meta">{item.dateLabel}</span>
                    {item.comments > 0 && (
                      <span className="meta">💬 {item.comments}</span>
                    )}
                  </div>
                  <Link
                    href={item.href}
                    className="serif"
                    style={{ fontSize: 17, fontWeight: 600 }}
                  >
                    {item.title}
                  </Link>
                  {item.excerpt && (
                    <p
                      className="serif"
                      style={{
                        fontSize: 14,
                        color: "var(--ink-3)",
                        marginTop: 4,
                        display: "-webkit-box",
                        WebkitLineClamp: 1,
                        WebkitBoxOrient: "vertical",
                        overflow: "hidden",
                      }}
                    >
                      {item.excerpt}
                    </p>
                  )}
                </div>
                <div className="row gap-4">
                  <button type="button" className="btn btn-ghost btn-sm" disabled>
                    수정
                  </button>
                  <button type="button" className="btn btn-ghost btn-sm" disabled>
                    공개↔비공개
                  </button>
                  <button
                    type="button"
                    className="btn btn-ghost btn-sm"
                    disabled
                    style={{ color: "var(--danger)" }}
                  >
                    삭제
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="meta" style={{ marginTop: 16, textAlign: "center" }}>
        ※ 수정/삭제 액션은 Phase 6 후반부에서 API 연결
      </div>
    </div>
  );
}
