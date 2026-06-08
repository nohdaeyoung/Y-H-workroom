import Link from "next/link";
import parse from "html-react-parser";
import { auth } from "@/auth";
import { listEssays } from "@/lib/essays";
import { sanitizeRichHtml } from "@/lib/sanitize";
import Comments from "@/components/Comments";

export const metadata = { title: "에세이 — 영이네 작업실" };
export const dynamic = "force-dynamic";

function formatDate(ts: number) {
  const d = new Date(ts);
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, "0")}.${String(d.getDate()).padStart(2, "0")}`;
}

export default async function EssayPage() {
  const session = await auth();
  const isYH = !!session?.user?.id;
  const essays = await listEssays({
    status: isYH ? undefined : "published",
    author: "Y",
    limit: 50,
  });

  return (
    <div className="container fade-in" style={{ maxWidth: 720 }}>
      <div style={{ marginBottom: 24 }}>
        <div className="row-between" style={{ alignItems: "flex-end" }}>
          <div>
            <div className="hand" style={{ fontSize: 22, color: "var(--ink-3)" }}>
              essay
            </div>
            <h1 className="page-title" style={{ fontSize: 32 }}>
              에세이
            </h1>
            <div
              className="serif"
              style={{ color: "var(--ink-2)", marginTop: 4 }}
            >
              오늘의 글, 어제의 글
            </div>
          </div>
          {isYH && (
            <Link href="/essay/write" className="btn btn-primary">
              <span>✎</span> 새 에세이
            </Link>
          )}
        </div>
      </div>

      {essays.length === 0 ? (
        <div className="card center" style={{ padding: 80 }}>
          <div className="hand" style={{ fontSize: 22, color: "var(--ink-4)" }}>
            아직 비어 있어요
          </div>
        </div>
      ) : (
        <ul className="col gap-16">
          {essays.map((e) => (
            <li key={e.id}>
              <Link
                href={`/essay/${e.id}`}
                className="card lift"
                style={{ display: "block", padding: "20px 24px" }}
              >
                <div className="hand" style={{ fontSize: 15, color: "var(--ink-4)" }}>
                  {formatDate(e.createdAt)}
                  {e.status !== "published" && isYH && (
                    <span className="chip" style={{ marginLeft: 10, fontSize: 11 }}>
                      {e.status === "draft" ? "임시저장" : "비공개"}
                    </span>
                  )}
                </div>
                <h2
                  className="serif"
                  style={{
                    fontSize: 22,
                    marginTop: 6,
                    lineHeight: 1.4,
                    letterSpacing: "-0.02em",
                  }}
                >
                  {e.title}
                </h2>
                {e.tags && e.tags.length > 0 && (
                  <div className="row gap-4" style={{ marginTop: 8, flexWrap: "wrap" }}>
                    {e.tags.map((t) => (
                      <span key={t} className="chip" style={{ fontSize: 11 }}>
                        #{t}
                      </span>
                    ))}
                  </div>
                )}
                <div
                  className="serif"
                  style={{
                    marginTop: 10,
                    color: "var(--ink-2)",
                    fontSize: 14,
                    lineHeight: 1.7,
                    display: "-webkit-box",
                    WebkitBoxOrient: "vertical",
                    WebkitLineClamp: 3,
                    overflow: "hidden",
                  }}
                >
                  {parse(sanitizeRichHtml(e.excerpt || e.content))}
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
