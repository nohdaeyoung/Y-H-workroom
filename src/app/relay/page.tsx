import Link from "next/link";
import { auth } from "@/auth";
import { listRelays } from "@/lib/relays";
import type { Relay } from "@/types/domain";

export const metadata = { title: "이어쓰기 — 영이네 작업실" };
export const dynamic = "force-dynamic";

function formatDate(ts: number) {
  const d = new Date(ts);
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, "0")}.${String(d.getDate()).padStart(2, "0")}`;
}

function RelayCard({ r }: { r: Relay }) {
  const chipClass = r.status === "completed" ? "chip done" : "chip wait";
  const statusLabel = r.status === "completed" ? "완결" : "이어가는 중";

  return (
    <Link
      href={`/relay/${r.id}`}
      className="card lift"
      style={{ display: "block", padding: "20px 22px" }}
    >
      <div className="row gap-8" style={{ flexWrap: "wrap", marginBottom: 6 }}>
        <span className="hand" style={{ fontSize: 16, color: "var(--ink-3)" }}>
          {formatDate(r.updatedAt)}
        </span>
        <span className={chipClass}>{statusLabel}</span>
        <span className="meta">{r.sentenceCount}문장</span>
      </div>
      <h3 className="serif" style={{ fontSize: 20, marginTop: 4 }}>
        「{r.title}」
      </h3>
      <div
        className="serif"
        style={{
          marginTop: 8,
          fontSize: 14,
          color: "var(--ink-2)",
          lineHeight: 1.6,
          display: "-webkit-box",
          WebkitLineClamp: 2,
          WebkitBoxOrient: "vertical",
          overflow: "hidden",
        }}
      >
        {r.lastSentenceText}
      </div>
    </Link>
  );
}

export default async function RelayListPage() {
  const [items, session] = await Promise.all([listRelays(), auth()]);
  const isYH = !!session?.user?.id;

  return (
    <div className="container narrow fade-in" style={{ maxWidth: 760 }}>
      <div className="row-between" style={{ marginBottom: 24, flexWrap: "wrap", gap: 12 }}>
        <div>
          <div className="hand" style={{ fontSize: 22, color: "var(--ink-3)" }}>
            relay
          </div>
          <h1 className="page-title">이어쓰기</h1>
          <div
            className="serif"
            style={{ color: "var(--ink-2)", marginTop: 4 }}
          >
            한 문장씩 쌓아가는 글
          </div>
        </div>
        {isYH && (
          <Link href="/relay/new" className="btn btn-primary">
            <span>＋</span> 새 이어쓰기
          </Link>
        )}
      </div>

      {items.length === 0 ? (
        <div className="card-flat center" style={{ padding: 48, color: "var(--ink-3)" }}>
          <span className="hand" style={{ fontSize: 18 }}>아직 비어 있어요</span>
        </div>
      ) : (
        <div className="col gap-16">
          {items.map((r) => (
            <RelayCard key={r.id} r={r} />
          ))}
        </div>
      )}
    </div>
  );
}
