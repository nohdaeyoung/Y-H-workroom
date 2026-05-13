"use client";

import { useState } from "react";
import Link from "next/link";
import parse from "html-react-parser";
import DOMPurify from "isomorphic-dompurify";
import type { Essay } from "@/types/domain";

function formatDate(ts: number) {
  const d = new Date(ts);
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, "0")}.${String(d.getDate()).padStart(2, "0")}`;
}

function sanitize(html: string) {
  return DOMPurify.sanitize(html, { USE_PROFILES: { html: true } });
}

function EssayPane({ essay, color }: { essay?: Essay; color: "y" | "h" }) {
  const bgClass = color === "y" ? "bg-y-bg" : "bg-h-bg";
  const labelClass = color === "y" ? "text-y" : "text-h";
  const letter = color === "y" ? "영" : "희";

  if (!essay) {
    return (
      <div className={`${bgClass} p-8 md:p-10 h-full flex items-center justify-center text-ink-soft text-sm font-serif`}>
        <div className="text-center">
          <div className={`text-3xl font-serif ${labelClass} mb-2`}>{letter}</div>
          아직 글이 없어요
        </div>
      </div>
    );
  }

  return (
    <article className={`${bgClass} p-8 md:p-10 h-full overflow-y-auto`}>
      <div className={`text-xs tracking-[0.2em] ${labelClass} mb-3 font-medium`}>
        {color === "y" ? "Y · 대영" : "H · 희서"}
      </div>
      <h3 className="font-serif text-2xl md:text-3xl font-medium mb-2">
        {essay.title}
      </h3>
      <div className="text-xs text-ink-soft mb-6">
        {formatDate(essay.createdAt)}
      </div>
      <div className="prose-serif text-[15px] md:text-base text-ink">
        {parse(sanitize(essay.content))}
      </div>
      <div className="mt-8 pt-6 border-t border-line/60 text-xs text-ink-soft flex justify-between">
        <Link href={`/essay/${essay.id}`} className="hover:text-ink">
          단독으로 보기 →
        </Link>
        <span>💬 댓글</span>
      </div>
    </article>
  );
}

export default function EssayPair({ y, h }: { y?: Essay; h?: Essay }) {
  const [activeTab, setActiveTab] = useState<"y" | "h">("y");

  return (
    <section>
      <div className="md:hidden flex border border-line rounded-md overflow-hidden mb-4">
        <button
          onClick={() => setActiveTab("y")}
          className={`flex-1 py-2 text-sm font-medium transition-colors ${
            activeTab === "y" ? "bg-y text-white" : "bg-paper text-ink-soft"
          }`}
        >
          Y · 대영
        </button>
        <button
          onClick={() => setActiveTab("h")}
          className={`flex-1 py-2 text-sm font-medium transition-colors ${
            activeTab === "h" ? "bg-h text-white" : "bg-paper text-ink-soft"
          }`}
        >
          H · 희서
        </button>
      </div>

      <div className="md:hidden border border-line rounded-md overflow-hidden min-h-[60vh]">
        {activeTab === "y" ? (
          <EssayPane essay={y} color="y" />
        ) : (
          <EssayPane essay={h} color="h" />
        )}
      </div>

      <div className="hidden md:grid grid-cols-2 gap-0.5 bg-line border border-line rounded-md overflow-hidden min-h-[70vh] max-h-[75vh]">
        <EssayPane essay={y} color="y" />
        <EssayPane essay={h} color="h" />
      </div>
    </section>
  );
}
