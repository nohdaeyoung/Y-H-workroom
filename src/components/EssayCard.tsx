import Link from "next/link";
import type { Essay } from "@/types/domain";

function formatDate(ts: number) {
  const d = new Date(ts);
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, "0")}.${String(d.getDate()).padStart(2, "0")}`;
}

function stripHtml(html: string) {
  return html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
}

export default function EssayCard({ essay }: { essay: Essay }) {
  const isY = essay.author === "Y";
  const labelClass = isY ? "text-y" : "text-h";
  const bgClass = isY ? "bg-y-bg" : "bg-h-bg";
  const preview = essay.excerpt || stripHtml(essay.content).slice(0, 80);

  return (
    <Link
      href={`/essay/${essay.id}`}
      className={`block ${bgClass} border border-line rounded-md p-5 hover:border-ink/30 transition-colors`}
    >
      <div className={`text-xs tracking-[0.2em] ${labelClass} mb-2 font-medium`}>
        {isY ? "Y · 대영" : "H · 희서"}
      </div>
      <h3 className="font-serif text-lg font-medium mb-2 line-clamp-1">
        {essay.title}
      </h3>
      <p className="text-sm text-ink-soft font-serif line-clamp-2 leading-relaxed">
        {preview}
      </p>
      <div className="mt-3 text-xs text-ink-soft">{formatDate(essay.createdAt)}</div>
    </Link>
  );
}
