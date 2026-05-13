import Link from "next/link";
import { notFound } from "next/navigation";
import { auth } from "@/auth";
import { getRelay } from "@/lib/mock-relays";

type Props = { params: { id: string } };

export async function generateMetadata({ params }: Props) {
  const r = getRelay(params.id);
  return { title: r ? `${r.title} — 이어쓰기` : "이어쓰기" };
}

function formatDate(ts: number) {
  const d = new Date(ts);
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, "0")}.${String(d.getDate()).padStart(2, "0")}`;
}

export default async function RelayDetailPage({ params }: Props) {
  const [relay, session] = await Promise.all([getRelay(params.id), auth()]);
  if (!relay) notFound();

  const uid = session?.user?.id;
  const isYH = uid === "Y" || uid === "H";
  const lastAuthor = relay.sentences[relay.sentences.length - 1]?.author;
  const blocked = isYH && uid === lastAuthor;

  return (
    <div className="container narrow fade-in" style={{ maxWidth: 680 }}>
      <Link
        href="/relay"
        className="btn btn-ghost btn-sm"
        style={{ marginBottom: 20 }}
      >
        ← 이어쓰기 목록
      </Link>

      <div style={{ textAlign: "center", padding: "12px 0 28px" }}>
        <div className="hand" style={{ fontSize: 20, color: "var(--ink-3)" }}>
          relay #{relay.id.split("-")[1]}
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
          <span className="meta">{relay.sentences.length}문장</span>
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
        {relay.sentences.map((s, i) => {
          const showAuthor = isYH;
          const cls = s.author === "Y" ? "y" : "h";
          const bg =
            s.author === "Y" ? "oklch(0.965 0.03 82)" : "oklch(0.96 0.018 250)";
          const bd = s.author === "Y" ? "var(--y-line)" : "var(--h-line)";
          return (
            <div
              key={i}
              style={{ position: "relative", marginBottom: 20 }}
            >
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
              </div>
            </div>
          );
        })}
      </div>

      {/* 이어쓰기 입력 */}
      {relay.status === "ongoing" && isYH && (
        <RelayInputForm
          author={uid as "Y" | "H"}
          blocked={blocked}
          relayId={relay.id}
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
            style={{ color: "var(--ink)", fontWeight: 500, textDecoration: "underline" }}
          >
            로그인
          </Link>
        </div>
      )}

      {/* 완결 동의 상태 */}
      {relay.status === "ongoing" && (
        <div
          className="row-between"
          style={{
            marginTop: 16,
            padding: "12px 18px",
            background: "var(--paper-ink)",
            borderRadius: "var(--r-md)",
          }}
        >
          <span className="meta">완결 동의</span>
          <div className="row gap-12">
            <span style={{ fontSize: 13 }}>Y {relay.yAgreed ? "✅" : "⬜"}</span>
            <span style={{ fontSize: 13 }}>H {relay.hAgreed ? "✅" : "⬜"}</span>
            <span className="meta">둘 다 동의 시 완결</span>
          </div>
        </div>
      )}
    </div>
  );
}

function RelayInputForm({
  author,
  blocked,
  relayId,
}: {
  author: "Y" | "H";
  blocked: boolean;
  relayId: string;
}) {
  // 현재는 mock — 다음 phase에서 server action으로 실제 저장
  const name = author === "Y" ? "대영" : "희서";
  const cls = author === "Y" ? "y" : "h";
  const lineVar = author === "Y" ? "var(--y-line)" : "var(--h-line)";

  return (
    <form
      className="card"
      style={{ marginTop: 24, borderColor: lineVar }}
      action="#"
    >
      <input type="hidden" name="relayId" value={relayId} />
      <div className="row gap-8" style={{ marginBottom: 12 }}>
        <span className={`avatar-mini ${cls}`}>{author}</span>
        <div>
          <div style={{ fontSize: 14, fontWeight: 500 }}>{name}로 이어쓰기</div>
          {blocked && (
            <div style={{ fontSize: 12, color: "var(--danger)" }}>
              직전 문장의 작성자입니다. 상대를 기다려 주세요.
            </div>
          )}
        </div>
      </div>
      <textarea
        className="textarea"
        placeholder="한 문장을 이어 적어주세요…"
        maxLength={200}
        disabled={blocked}
        rows={3}
        name="text"
      />
      <div className="row-between" style={{ marginTop: 12 }}>
        <label
          className="meta"
          style={{ display: "flex", gap: 6, alignItems: "center" }}
        >
          <input type="checkbox" name="agreeComplete" /> 이 문장으로 완결 동의
        </label>
        <button type="submit" className="btn btn-primary" disabled={blocked}>
          이어쓰기
        </button>
      </div>
      <div className="meta" style={{ marginTop: 8, fontSize: 11 }}>
        ※ 데모 — Phase 2 후반부에서 실제 저장 연결
      </div>
    </form>
  );
}
