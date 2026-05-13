import Link from "next/link";
import { auth } from "@/auth";
import { listEssays } from "@/lib/essays";
import EssayPair from "@/components/EssayPair";

export const metadata = { title: "에세이 — 영희네 작업실" };
export const dynamic = "force-dynamic";

export default async function EssayPage() {
  const [essays, session] = await Promise.all([
    listEssays({ status: "published", limit: 50 }),
    auth(),
  ]);

  return (
    <div className="container fade-in" style={{ maxWidth: 1080 }}>
      <div style={{ marginBottom: 24 }}>
        <div className="row-between" style={{ alignItems: "flex-end" }}>
          <div>
            <div className="hand" style={{ fontSize: 22, color: "var(--ink-3)" }}>
              essay
            </div>
            <h1 className="page-title" style={{ fontSize: 32 }}>
              에세이, 나란히 읽기
            </h1>
            <div
              className="serif"
              style={{ color: "var(--ink-2)", marginTop: 4 }}
            >
              같은 시간, 다른 시선
            </div>
          </div>
          {session?.user?.id && (
            <Link href="/essay/write" className="btn btn-primary">
              <span>✎</span> 새 에세이
            </Link>
          )}
        </div>
      </div>

      <EssayPair essays={essays} isYH={!!session?.user?.id} />
    </div>
  );
}
