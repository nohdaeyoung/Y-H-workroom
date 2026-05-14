import Link from "next/link";
import { redirect, notFound } from "next/navigation";
import { auth } from "@/auth";
import { listEssays } from "@/lib/essays";
import { listRelays } from "@/lib/relays";
import { listKeywords } from "@/lib/keywords";
import { listBookclubs } from "@/lib/bookclubs";
import { listPhotostories } from "@/lib/photostories";
import { listPendingRequests } from "@/lib/action-requests";
import type { ActionRequestKind, UserId } from "@/types/domain";
import AdminMyItemActions from "@/components/AdminMyItemActions";
import RequestsList from "@/app/admin/requests/RequestsList";

const SECTION_REQUEST_KINDS: Record<string, ActionRequestKind[]> = {
  essay: [],
  relay: ["delete-relay", "set-relay-status"],
  keyword: ["delete-keyword"],
  bookclub: ["delete-bookclub", "set-bookclub-status"],
  photo: ["delete-photostory", "set-photostory-status"],
};

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
  editHref?: string;
  canToggle?: boolean;
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
      editHref: `/essay/${e.id}/edit`,
      canToggle: true,
    }));
  }
  if (section === "relay") {
    const all = await listRelays();
    return all.map((r) => ({
      id: r.id,
      title: r.title,
      excerpt: r.firstSentenceText,
      status: r.status === "completed" ? "published" : "published",
      dateLabel: formatDate(r.updatedAt),
      comments: 0,
      href: `/relay/${r.id}`,
      editHref: `/relay/${r.id}/edit`,
    }));
  }
  if (section === "keyword") {
    const all = await listKeywords();
    return all
      .filter((k) => (uid === "Y" ? k.yEssay : k.hEssay))
      .map((k) => {
        const mine = uid === "Y" ? k.yEssay : k.hEssay;
        return {
          id: k.id,
          title: `"${k.keyword}"`,
          excerpt: mine?.title,
          status: "published",
          dateLabel: formatDate(k.suggestedAt),
          comments: 0,
          href: `/keyword/${k.id}`,
          editHref: `/keyword/${k.id}/edit`,
        };
      });
  }
  if (section === "bookclub") {
    const all = await listBookclubs({ includeDrafts: true });
    return all.map((b) => ({
      id: b.id,
      title: `「${b.bookTitle}」`,
      excerpt: b.bookAuthor,
      status: b.status !== "reading" ? "published" : "draft",
      dateLabel: b.meetingDate,
      comments: 0,
      href: b.status !== "reading" ? `/bookclub/${b.id}` : `/bookclub/${b.id}/review`,
      editHref: `/bookclub/${b.id}/review`,
      canToggle: true,
    }));
  }
  if (section === "photo") {
    const all = await listPhotostories({ includeWaiting: true });
    return all
      .filter((p) => p.photoAuthor === uid || p.textAuthor === uid)
      .map((p) => ({
        id: p.id,
        title: p.photoTitle,
        excerpt: p.text?.replace(/<[^>]+>/g, "").slice(0, 80) ?? "",
        status: p.status === "completed" ? "published" : "draft",
        dateLabel: formatDate(p.photoUploadedAt),
        comments: 0,
        href: `/photostory/${p.id}`,
        editHref: `/photostory/${p.id}/edit`,
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
  const [allItems, allPending] = await Promise.all([
    getItems(section, id),
    listPendingRequests(),
  ]);
  const items =
    statusFilter === "all"
      ? allItems
      : allItems.filter((it) => it.status === statusFilter);

  const sectionKinds = SECTION_REQUEST_KINDS[section] ?? [];
  const incomingRequests = allPending.filter(
    (r) => sectionKinds.includes(r.kind) && r.requester !== id
  );

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

      {incomingRequests.length > 0 && (
        <div
          className="card"
          style={{
            marginBottom: 20,
            padding: 16,
            background: "var(--paper-2)",
            border: "1px solid var(--y-line)",
          }}
        >
          <h3 className="section-title" style={{ marginBottom: 12 }}>
            🔔 상대가 보낸 요청 ({incomingRequests.length})
          </h3>
          <div className="meta" style={{ marginBottom: 12, fontSize: 12 }}>
            승인하면 실제로 처리돼요. 거절하면 변경되지 않아요.
          </div>
          <RequestsList
            viewer={id}
            incoming={incomingRequests}
            outgoing={[]}
            compact
          />
        </div>
      )}

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
                <AdminMyItemActions
                  section={section}
                  id={item.id}
                  editHref={item.editHref}
                  canToggle={item.canToggle}
                />
              </div>
            </div>
          ))
        )}
      </div>

    </div>
  );
}
