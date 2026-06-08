import Link from "next/link";
import { notFound } from "next/navigation";
import { auth } from "@/auth";
import { getRelayWithSentences } from "@/lib/relays";
import RelayInputForm from "./RelayInputForm";
import RelayAgreeForm from "./RelayAgreeForm";
import MySentenceActions from "./MySentenceActions";
import { RegenerateAiButton, RequestAiButton } from "./RelayAiActions";
import Comments from "@/components/Comments";

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
  const [r, session] = await Promise.all([
    getRelayWithSentences(params.id),
    auth(),
  ]);
  if (!r) notFound();

  const uid = session?.user?.id;
  const isYH = !!uid;

  const last = r.sentences.length > 0 ? r.sentences[r.sentences.length - 1] : null;
  const lastIsAi = last?.source === "ai";

  return (
    <div className="container narrow fade-in" style={{ maxWidth: 880 }}>
      <div className="row-between" style={{ marginBottom: 20 }}>
        <Link href="/relay" className="btn btn-ghost btn-sm">
          ← 이어쓰기 목록
        </Link>
        {isYH && (
          <Link href={`/relay/${r.id}/edit`} className="btn btn-ghost btn-sm">
            ✎ 수정
          </Link>
        )}
      </div>

      <div style={{ textAlign: "center", padding: "12px 0 28px" }}>
        <div className="hand" style={{ fontSize: 20, color: "var(--ink-3)" }}>
          relay
        </div>
        <h1
          className="serif"
          style={{ fontSize: 30, marginTop: 6, letterSpacing: "-0.02em" }}
        >
          「{r.title}」
        </h1>
        <div className="meta" style={{ marginTop: 8 }}>
          {r.sentenceCount}문장 ·{" "}
          {r.status === "completed" ? "완결" : "이어가는 중"}
        </div>
      </div>

      <div className="col gap-10">
        {r.sentences.map((s, i) => {
          const isAi = s.source === "ai";
          const isLast = i === r.sentences.length - 1;
          const isMineEditable =
            !isAi && uid === s.author && isLast && r.status !== "completed";
          const bgGrad = isAi
            ? "linear-gradient(180deg, oklch(0.965 0.025 250) 0%, var(--paper-2) 100%)"
            : "var(--paper-2)";
          const borderColor = isAi ? "oklch(0.85 0.04 250)" : "var(--y-line)";

          return (
            <div
              key={s.id}
              className="card"
              style={{
                padding: "16px 22px",
                background: bgGrad,
                borderColor,
              }}
            >
              <div className="row gap-8" style={{ marginBottom: 6, alignItems: "center" }}>
                <span className="meta" style={{ fontSize: 12 }}>
                  #{i + 1}
                </span>
                {isAi ? (
                  <span
                    className="chip"
                    style={{
                      background: "oklch(0.55 0.13 250)",
                      color: "white",
                      borderColor: "oklch(0.55 0.13 250)",
                      fontSize: 11,
                      padding: "2px 8px",
                    }}
                  >
                    ✨ AI
                  </span>
                ) : (
                  <span
                    className="chip"
                    style={{
                      background: "var(--y-deep)",
                      color: "white",
                      borderColor: "var(--y-deep)",
                      fontSize: 11,
                      padding: "2px 8px",
                    }}
                  >
                    영이
                  </span>
                )}
                <span className="meta">{formatDate(s.createdAt)}</span>
                {isAi && isLast && isYH && r.status !== "completed" && (
                  <span style={{ marginLeft: "auto" }}>
                    <RegenerateAiButton relayId={r.id} />
                  </span>
                )}
              </div>
              <div
                className="serif"
                style={{
                  fontSize: 16.5,
                  lineHeight: 1.85,
                  color: "var(--ink)",
                  whiteSpace: "pre-wrap",
                }}
              >
                {s.text}
              </div>
              {isMineEditable && (
                <MySentenceActions
                  relayId={r.id}
                  sentenceId={s.id}
                  initialText={s.text}
                />
              )}
            </div>
          );
        })}
      </div>

      {isYH && r.status !== "completed" && !lastIsAi && r.sentences.length > 0 && (
        <div
          style={{
            marginTop: 18,
            padding: 14,
            borderRadius: "var(--r-md)",
            background: "oklch(0.965 0.025 250 / 0.6)",
            border: "1px dashed oklch(0.75 0.06 250)",
          }}
        >
          <div className="meta" style={{ marginBottom: 8, fontSize: 12 }}>
            AI 차례가 비어 있어요. 받을까요?
          </div>
          <RequestAiButton relayId={r.id} />
        </div>
      )}

      {isYH && r.status !== "completed" && (
        <RelayInputForm relayId={r.id} author={uid as "Y" | "H"} blocked={false} />
      )}

      {isYH && (
        <RelayAgreeForm
          relayId={r.id}
          yAgreed={r.yAgreed}
          hAgreed={r.hAgreed}
          viewer={uid as "Y" | "H"}
        />
      )}

      <div className="divider-dot" />

      <Comments parentType="relay" parentId={r.id} isYH={isYH} />
    </div>
  );
}
