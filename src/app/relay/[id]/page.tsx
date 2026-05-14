import Link from "next/link";
import { notFound } from "next/navigation";
import { auth } from "@/auth";
import { getRelayWithSentences } from "@/lib/relays";
import RelayInputForm from "./RelayInputForm";
import RelayAgreeForm from "./RelayAgreeForm";
import MySentenceActions from "./MySentenceActions";

type Props = { params: { id: string } };

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: Props) {
  const r = await getRelayWithSentences(params.id);
  return { title: r ? `${r.title} — 이어쓰기` : "이어쓰기" };
}

function formatDate(ts: number) {
  const d = new Date(ts);
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, "0")}.${String(d.getDate()).padStart(2, "0")}`;
}

export default async function RelayDetailPage({ params }: Props) {
  const [relay, session] = await Promise.all([
    getRelayWithSentences(params.id),
    auth(),
  ]);
  if (!relay) notFound();

  const uid = session?.user?.id;
  const isYH = uid === "Y" || uid === "H";
  const lastAuthor = relay.lastAuthor;
  const blocked = isYH && uid === lastAuthor;

  return (
    <div className="container narrow fade-in" style={{ maxWidth: 680 }}>
      <div className="row-between" style={{ marginBottom: 20 }}>
        <Link href="/relay" className="btn btn-ghost btn-sm">
          ← 이어쓰기 목록
        </Link>
        {isYH && (
          <Link
            href={`/relay/${relay.id}/edit`}
            className="btn btn-ghost btn-sm"
          >
            ✎ 수정
          </Link>
        )}
      </div>

      <div style={{ textAlign: "center", padding: "12px 0 28px" }}>
        <div className="hand" style={{ fontSize: 20, color: "var(--ink-3)" }}>
          relay
        </div>
        <h1 className="serif" style={{ fontSize: 30, marginTop: 4 }}>
          {relay.title}
        </h1>
        <div
          className="row gap-8"
          style={{ justifyContent: "center", marginTop: 10 }}
        >
          {relay.status === "completed" ? (
            <span className="chip" style={{ background: "var(--paper-ink)" }}>
              완결 ✓
            </span>
          ) : (
            <span className="chip live">이어지는 중</span>
          )}
          <span className="meta">{relay.sentenceCount}문장</span>
        </div>
      </div>

      {/* 타임라인 */}
      <div style={{ position: "relative", paddingLeft: 28 }}>
        <div
          style={{
            position: "absolute",
            left: 5,
            top: 8,
            bottom: 8,
            width: 2,
            background: "var(--line)",
          }}
        />
        {relay.sentences.map((s, idx) => {
          const showAuthor = isYH;
          const cls = s.author === "Y" ? "y" : "h";
          const bg =
            s.author === "Y" ? "oklch(0.965 0.03 82)" : "oklch(0.96 0.018 250)";
          const bd = s.author === "Y" ? "var(--y-line)" : "var(--h-line)";
          const isLast = idx === relay.sentences.length - 1;
          const isMineLast =
            isYH &&
            s.author === uid &&
            isLast &&
            relay.status === "ongoing";
          return (
            <div key={s.id} style={{ position: "relative", marginBottom: 20 }}>
              <div
                className={`timeline-dot ${showAuthor ? cls : ""}`}
                style={{ position: "absolute", left: -28, top: 12 }}
              />
              <div
                className="card-flat"
                style={{
                  padding: "14px 18px",
                  background: showAuthor ? bg : "var(--paper-2)",
                  border: "1px solid",
                  borderColor: showAuthor ? bd : "var(--line)",
                  borderRadius: "var(--r-md)",
                }}
              >
                <div className="serif" style={{ fontSize: 16, lineHeight: 1.8 }}>
                  {s.text}
                </div>
                <div
                  className="row gap-8"
                  style={{
                    justifyContent: "flex-end",
                    marginTop: 8,
                    fontSize: 12,
                    color: "var(--ink-4)",
                  }}
                >
                  <span className="hand" style={{ fontSize: 15 }}>
                    — {showAuthor ? s.author : "???"}
                  </span>
                  <span>·</span>
                  <span>{formatDate(s.createdAt)}</span>
                </div>
                {isMineLast && (
                  <MySentenceActions
                    relayId={relay.id}
                    sentenceId={s.id}
                    initialText={s.text}
                  />
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* 이어쓰기 입력 */}
      {relay.status === "ongoing" && isYH && (
        <RelayInputForm
          relayId={relay.id}
          author={uid as "Y" | "H"}
          blocked={blocked}
        />
      )}

      {relay.status === "ongoing" && !isYH && (
        <div
          className="card-flat"
          style={{
            marginTop: 24,
            padding: 16,
            textAlign: "center",
            background: "var(--paper-ink)",
            border: "1px dashed var(--line-2)",
          }}
        >
          <span className="meta">이어쓰기는 Y/H만 가능해요 — </span>
          <Link
            href={`/login?from=/relay/${relay.id}`}
            style={{
              color: "var(--ink)",
              fontWeight: 500,
              textDecoration: "underline",
            }}
          >
            로그인
          </Link>
        </div>
      )}

      {/* 완결 동의 상태 */}
      {relay.status === "ongoing" && (
        <RelayAgreeForm
          relayId={relay.id}
          yAgreed={relay.yAgreed}
          hAgreed={relay.hAgreed}
          viewer={isYH ? (uid as "Y" | "H") : null}
        />
      )}
    </div>
  );
}
