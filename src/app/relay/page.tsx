import Link from "next/link";
import { auth } from "@/auth";
import { MOCK_RELAYS, type Relay } from "@/lib/mock-relays";

export const metadata = { title: "이어쓰기 — 영희네 작업실" };

function relativeDate(ts: number) {
  const diff = Date.now() - ts;
  const day = Math.floor(diff / 86400000);
  if (day < 1) return `${Math.max(1, Math.floor(diff / 3600000))}시간 전`;
  if (day < 7) return `${day}일 전`;
  if (day < 30) return `${Math.floor(day / 7)}주 전`;
  return `${Math.floor(day / 30)}달 전`;
}

function RelayCard({ relay }: { relay: Relay }) {
  const first = relay.sentences[0];
  const last = relay.sentences[relay.sentences.length - 1];
  const more = relay.sentences.length > 1;

  return (
    <Link href={`/relay/${relay.id}`} className="card lift">
      <div className="row gap-8" style={{ marginBottom: 8, flexWrap: "wrap" }}>
        {relay.status === "completed" ? (
          <span className="chip" style={{ background: "var(--paper-ink)" }}>
            완결 ✓
          </span>
        ) : (
          <span className="chip live">이어지는 중</span>
        )}
        <span className="meta">{relay.sentences.length}문장</span>
        <span className="meta">·</span>
        <span className="meta">{relativeDate(relay.updatedAt)}</span>
      </div>
      <h3 className="serif" style={{ fontSize: 22, marginBottom: 8 }}>
        {relay.title}
      </h3>
      <p
        className="serif"
        style={{ color: "var(--ink-2)", fontSize: 15.5, lineHeight: 1.7 }}
      >
        {first.text}
        {more && <span style={{ color: "var(--ink-4)" }}> … </span>}
        {more && <span>{last.text}</span>}
      </p>
    </Link>
  );
}

export default async function RelayListPage() {
  const session = await auth();
  const ongoing = MOCK_RELAYS.filter((r) => r.status === "ongoing");
  const completed = MOCK_RELAYS.filter((r) => r.status === "completed");

  return (
    <div className="container fade-in" style={{ maxWidth: 880 }}>
      <div className="row-between" style={{ marginBottom: 28 }}>
        <div>
          <div className="hand" style={{ fontSize: 22, color: "var(--ink-3)" }}>
            relay
          </div>
          <h1 className="page-title">이어쓰기</h1>
          <div className="serif" style={{ color: "var(--ink-2)", marginTop: 4 }}>
            한 사람이 한 문장, 그렇게 천천히.
          </div>
        </div>
        {session?.user?.id && (
          <Link href="/relay/new" className="btn btn-primary">
            <span>＋</span> 새로 시작
          </Link>
        )}
      </div>

      <h3 className="section-title" style={{ marginBottom: 12 }}>
        이어지는 중
      </h3>
      <div className="col gap-12" style={{ marginBottom: 32 }}>
        {ongoing.length === 0 ? (
          <div className="card-flat center" style={{ padding: 32, color: "var(--ink-3)" }}>
            <span className="hand" style={{ fontSize: 18 }}>아직 비어 있어요</span>
          </div>
        ) : (
          ongoing.map((r) => <RelayCard key={r.id} relay={r} />)
        )}
      </div>

      <h3 className="section-title" style={{ marginBottom: 12 }}>
        완결된 글
      </h3>
      <div className="col gap-12">
        {completed.length === 0 ? (
          <div className="card-flat center" style={{ padding: 32, color: "var(--ink-3)" }}>
            <span className="hand" style={{ fontSize: 18 }}>완결된 글이 없어요</span>
          </div>
        ) : (
          completed.map((r) => <RelayCard key={r.id} relay={r} />)
        )}
      </div>
    </div>
  );
}
