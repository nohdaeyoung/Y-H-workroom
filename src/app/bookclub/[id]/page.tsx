import Link from "next/link";
import { notFound } from "next/navigation";
import { auth } from "@/auth";
import { getBookclub } from "@/lib/mock-bookclubs";
import BookclubAudio from "@/components/BookclubAudio";
import Comments from "@/components/Comments";

type Props = { params: { id: string } };

export async function generateMetadata({ params }: Props) {
  const b = getBookclub(params.id);
  return { title: b ? `${b.bookTitle} — 독서모임` : "독서모임" };
}

export default async function BookclubDetailPage({ params }: Props) {
  const [b, session] = await Promise.all([getBookclub(params.id), auth()]);
  if (!b) notFound();
  const isYH = !!session?.user?.id;

  return (
    <div className="container narrow fade-in" style={{ maxWidth: 720 }}>
      <Link href="/bookclub" className="btn btn-ghost btn-sm" style={{ marginBottom: 20 }}>
        ← 독서모임 목록
      </Link>

      {/* 책 헤더 */}
      <div className="card" style={{ padding: "24px 24px 28px", marginBottom: 16 }}>
        <div className="row gap-20" style={{ flexWrap: "wrap" }}>
          <div
            style={{
              width: 100,
              height: 140,
              flexShrink: 0,
              background:
                "linear-gradient(135deg, oklch(0.62 0.10 25), oklch(0.42 0.08 30))",
              borderRadius: "2px 8px 8px 2px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "3px 3px 10px oklch(0.3 0.04 70 / 0.18)",
              position: "relative",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                position: "absolute",
                left: 3,
                top: 0,
                bottom: 0,
                width: 4,
                background: "oklch(0.3 0.05 60 / 0.3)",
              }}
            />
            <div
              className="serif"
              style={{
                color: "white",
                fontSize: 14,
                padding: "0 12px",
                textAlign: "center",
                fontWeight: 600,
                lineHeight: 1.35,
              }}
            >
              {b.bookTitle}
            </div>
          </div>
          <div className="flex-1">
            <div className="hand" style={{ fontSize: 18, color: "var(--ink-3)" }}>
              독서모임 #{b.id.split("-")[1]}
            </div>
            <h1 className="serif" style={{ fontSize: 26, marginTop: 4, lineHeight: 1.3 }}>
              「{b.bookTitle}」
            </h1>
            <div style={{ color: "var(--ink-2)", marginTop: 4 }}>{b.bookAuthor}</div>
            <div className="row gap-12" style={{ marginTop: 12, flexWrap: "wrap" }}>
              <span className="chip" style={{ fontSize: 12 }}>
                📅 {b.meetingDate}
              </span>
              <span className="chip" style={{ fontSize: 12 }}>
                ⏱ {b.duration}
              </span>
            </div>
          </div>
        </div>

        <BookclubAudio duration={b.duration} />
      </div>

      {/* 대화 (메신저) */}
      <div
        className="card-flat"
        style={{
          padding: "24px 16px 28px",
          background: "var(--paper-2)",
          border: "1px solid var(--line)",
          borderRadius: "var(--r-lg)",
        }}
      >
        <div
          className="hand"
          style={{
            textAlign: "center",
            fontSize: 18,
            color: "var(--ink-4)",
            marginBottom: 18,
          }}
        >
          — 대화 시작 —
        </div>
        <div className="col gap-12">
          {b.transcript.map((t, i) => {
            const isY = t.speaker === "Y";
            const sameSpeaker = i > 0 && b.transcript[i - 1].speaker === t.speaker;
            const name = isY ? "대영" : "희서";
            return (
              <div
                key={i}
                style={{
                  display: "flex",
                  justifyContent: isY ? "flex-start" : "flex-end",
                  gap: 8,
                }}
              >
                {isY && (
                  <span
                    className="avatar-mini y"
                    style={{
                      visibility: sameSpeaker ? "hidden" : "visible",
                      alignSelf: "flex-end",
                    }}
                  >
                    Y
                  </span>
                )}
                <div
                  style={{
                    maxWidth: "78%",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: isY ? "flex-start" : "flex-end",
                  }}
                >
                  {!sameSpeaker && (
                    <div
                      style={{
                        fontSize: 12,
                        color: isY ? "var(--y-deep)" : "var(--h-deep)",
                        fontWeight: 500,
                        marginBottom: 4,
                        padding: "0 6px",
                      }}
                    >
                      {name}
                    </div>
                  )}
                  <div
                    className="serif"
                    style={{
                      padding: "12px 16px",
                      background: isY
                        ? "oklch(0.95 0.045 82)"
                        : "oklch(0.95 0.025 250)",
                      borderRadius: isY
                        ? "4px 14px 14px 14px"
                        : "14px 4px 14px 14px",
                      border: "1px solid",
                      borderColor: isY ? "var(--y-line)" : "var(--h-line)",
                      fontSize: 15.5,
                      lineHeight: 1.7,
                      color: "var(--ink)",
                    }}
                  >
                    {t.text}
                  </div>
                </div>
                {!isY && (
                  <span
                    className="avatar-mini h"
                    style={{
                      visibility: sameSpeaker ? "hidden" : "visible",
                      alignSelf: "flex-end",
                    }}
                  >
                    H
                  </span>
                )}
              </div>
            );
          })}
        </div>
        <div
          className="hand"
          style={{
            textAlign: "center",
            fontSize: 18,
            color: "var(--ink-4)",
            marginTop: 18,
          }}
        >
          — 대화 끝 —
        </div>
      </div>

      <Comments parentType="bookclub" parentId={b.id} isYH={isYH} />
    </div>
  );
}
