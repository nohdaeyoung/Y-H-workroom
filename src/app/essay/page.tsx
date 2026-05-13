import Link from "next/link";
import { auth } from "@/auth";
import { listEssays } from "@/lib/essays";
import { pairEssaysByDate } from "@/lib/mock-essays";
import EssayPair from "@/components/EssayPair";
import EssayCard from "@/components/EssayCard";

export const metadata = { title: "에세이 — 영희네 작업실" };

export const dynamic = "force-dynamic";

export default async function EssayPage() {
  const [essays, session] = await Promise.all([
    listEssays({ status: "published", limit: 50 }),
    auth(),
  ]);

  const pairs = pairEssaysByDate(essays);
  const latest = pairs[0];
  const rest = pairs.slice(1).flatMap((p) => [p.y, p.h]).filter(Boolean);

  return (
    <div className="max-w-6xl mx-auto px-5 pt-10 pb-24">
      <header className="text-center mb-10">
        <h1 className="font-serif text-3xl md:text-4xl font-medium">에세이</h1>
        <p className="mt-2 text-ink-soft text-sm font-serif">
          같은 시간, 다른 시선으로 나란히 읽기
        </p>
        {session?.user && (
          <div className="mt-5">
            <Link href="/essay/write" className="btn">
              ✍️ 새 에세이 쓰기
            </Link>
          </div>
        )}
      </header>

      {latest ? (
        <EssayPair y={latest.y} h={latest.h} />
      ) : (
        <p className="text-center text-ink-soft py-20">아직 에세이가 없어요.</p>
      )}

      {rest.length > 0 && (
        <section className="mt-16">
          <h2 className="text-xs tracking-[0.25em] text-ink-soft text-center mb-6">
            ── 지난 글 ──
          </h2>
          <div className="grid sm:grid-cols-2 gap-4">
            {rest.map((e) => e && <EssayCard key={e.id} essay={e} />)}
          </div>
        </section>
      )}
    </div>
  );
}
