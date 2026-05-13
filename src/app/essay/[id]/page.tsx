import Link from "next/link";
import { notFound } from "next/navigation";
import { auth } from "@/auth";
import { getEssay } from "@/lib/essays";
import SafeHtml from "@/components/SafeHtml";
import Comments from "@/components/Comments";

type Props = { params: { id: string } };

export async function generateMetadata({ params }: Props) {
  const essay = await getEssay(params.id);
  return { title: essay ? `${essay.title} — 영희네 작업실` : "에세이" };
}

function formatDate(ts: number) {
  const d = new Date(ts);
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, "0")}.${String(d.getDate()).padStart(2, "0")}`;
}

export default async function EssayDetailPage({ params }: Props) {
  const [essay, session] = await Promise.all([getEssay(params.id), auth()]);
  if (!essay) notFound();

  const isY = essay.author === "Y";
  const labelClass = isY ? "text-y" : "text-h";
  const isYH = !!session?.user?.id;

  return (
    <article className="max-w-2xl mx-auto px-5 pt-12 pb-24">
      <Link href="/essay" className="text-xs text-ink-soft hover:text-ink">
        ← 에세이 목록
      </Link>

      <header className="mt-6 mb-10 pb-8 border-b border-line">
        <div className={`text-xs tracking-[0.2em] ${labelClass} mb-3 font-medium`}>
          {isY ? "Y · 대영" : "H · 희서"}
        </div>
        <h1 className="font-serif text-3xl md:text-4xl font-medium mb-3">
          {essay.title}
        </h1>
        <div className="text-xs text-ink-soft">{formatDate(essay.createdAt)}</div>
      </header>

      <SafeHtml html={essay.content} className="prose-serif text-base text-ink" />

      <Comments parentType="essay" parentId={essay.id} isYH={isYH} />
    </article>
  );
}
