"use client";

import { useState } from "react";
import Link from "next/link";
import PhotoPlaceholder from "./PhotoPlaceholder";
import type { Photostory } from "@/types/domain";

type Filter = "all" | "h2y" | "y2h";

const FILTERS: { id: Filter; label: string }[] = [
  { id: "all", label: "전체" },
  { id: "h2y", label: "📸H → ✍️Y" },
  { id: "y2h", label: "📸Y → ✍️H" },
];

function formatShort(ts: number) {
  const d = new Date(ts);
  return `${d.getMonth() + 1}.${String(d.getDate()).padStart(2, "0")}`;
}

function stripHtml(html: string): string {
  // 줄바꿈 의미 있는 태그는 \n으로 변환 후 나머지 태그 제거.
  return html
    .replace(/<\/(p|div|h[1-6]|li|br\s*\/?)>/gi, "\n")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function PhotoSlider({ photos, title }: { photos: string[]; title: string }) {
  const [active, setActive] = useState(0);
  if (photos.length === 0) return null;
  const single = photos.length === 1;

  function onScroll(e: React.UIEvent<HTMLDivElement>) {
    const el = e.currentTarget;
    const idx = Math.round(el.scrollLeft / el.clientWidth);
    if (idx !== active) setActive(idx);
  }

  return (
    <div style={{ position: "relative", background: "var(--paper-ink)" }}>
      <div
        onScroll={single ? undefined : onScroll}
        style={{
          display: "flex",
          overflowX: single ? "hidden" : "auto",
          scrollSnapType: "x mandatory",
          scrollbarWidth: "none",
          WebkitOverflowScrolling: "touch",
        }}
      >
        {photos.map((src, i) => (
          <div
            key={`${src}-${i}`}
            style={{
              flex: "0 0 100%",
              scrollSnapAlign: "start",
              width: "100%",
              aspectRatio: "1 / 1",
              overflow: "hidden",
              background: "var(--paper-2)",
            }}
          >
            <img
              src={src}
              alt={`${title} - ${i + 1}`}
              loading="lazy"
              decoding="async"
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
                display: "block",
              }}
            />
          </div>
        ))}
      </div>
      {!single && (
        <>
          <div
            style={{
              position: "absolute",
              top: 12,
              right: 12,
              padding: "3px 10px",
              background: "oklch(0.2 0.02 50 / 0.65)",
              color: "white",
              fontSize: 12,
              borderRadius: "var(--r-pill)",
              fontVariantNumeric: "tabular-nums",
            }}
          >
            {active + 1} / {photos.length}
          </div>
          <div
            className="row gap-4"
            style={{
              position: "absolute",
              bottom: 10,
              left: 0,
              right: 0,
              justifyContent: "center",
            }}
          >
            {photos.map((_, i) => (
              <span
                key={i}
                style={{
                  width: 6,
                  height: 6,
                  borderRadius: "50%",
                  background:
                    i === active
                      ? "white"
                      : "oklch(1 0 0 / 0.5)",
                  boxShadow: "0 0 2px oklch(0.2 0.02 50 / 0.3)",
                }}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

function FeedCard({ story }: { story: Photostory }) {
  const waiting = story.status === "waiting";
  const plain = story.text ? stripHtml(story.text) : "";

  return (
    <article
      style={{
        background: "var(--paper-2)",
        border: "1px solid var(--line)",
        borderRadius: "var(--r-lg)",
        overflow: "hidden",
        marginBottom: 28,
      }}
    >
      {/* 헤더 */}
      <div
        className="row gap-8"
        style={{
          padding: "14px 18px",
          borderBottom: "1px solid var(--line)",
          alignItems: "center",
          flexWrap: "wrap",
        }}
      >
        <span
          className={`avatar-mini ${story.photoAuthor === "Y" ? "y" : "h"}`}
          style={{ width: 28, height: 28, fontSize: 12 }}
        >
          {story.photoAuthor}
        </span>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div className="row gap-4" style={{ fontSize: 13 }}>
            <span
              style={{
                color: story.photoAuthor === "Y" ? "var(--y-deep)" : "var(--h-deep)",
                fontWeight: 600,
              }}
            >
              📸 {story.photoAuthor}
            </span>
            <span style={{ color: "var(--ink-4)" }}>→</span>
            <span
              style={{
                color: story.textAuthor === "Y" ? "var(--y-deep)" : "var(--h-deep)",
                fontWeight: 600,
                opacity: waiting ? 0.4 : 1,
              }}
            >
              ✍️ {story.textAuthor}
            </span>
          </div>
          <div className="meta" style={{ fontSize: 11, marginTop: 2 }}>
            {formatShort(story.photoUploadedAt)}
            {waiting && <span style={{ marginLeft: 8 }}>· ⏳ 글 대기중</span>}
          </div>
        </div>
        <Link
          href={`/photostory/${story.id}`}
          className="btn btn-ghost btn-sm"
          style={{ fontSize: 12 }}
        >
          상세 →
        </Link>
      </div>

      {/* 사진 */}
      {story.photos.length > 0 ? (
        <PhotoSlider photos={story.photos} title={story.photoTitle} />
      ) : (
        <PhotoPlaceholder hue={0} height={400} idx={0} />
      )}

      {/* 본문 */}
      <div style={{ padding: "16px 20px 20px" }}>
        <h3
          className="serif"
          style={{ fontSize: 20, fontWeight: 600, lineHeight: 1.4 }}
        >
          {story.photoTitle}
        </h3>
        {plain ? (
          <div
            className="serif"
            style={{
              marginTop: 10,
              fontSize: 15,
              color: "var(--ink)",
              lineHeight: 1.8,
              whiteSpace: "pre-wrap",
              wordBreak: "break-word",
            }}
          >
            {plain}
          </div>
        ) : (
          <div
            className="hand"
            style={{
              marginTop: 10,
              fontSize: 16,
              color: "var(--ink-3)",
            }}
          >
            {story.textAuthor}의 글을 기다리고 있어요
          </div>
        )}
      </div>
    </article>
  );
}

export default function PhotostoryListClient({
  items,
  canUpload,
}: {
  items: Photostory[];
  canUpload: boolean;
}) {
  const [filter, setFilter] = useState<Filter>("all");

  const filtered = items.filter((p) => {
    if (filter === "all") return true;
    if (filter === "h2y") return p.photoAuthor === "H" && p.textAuthor === "Y";
    if (filter === "y2h") return p.photoAuthor === "Y" && p.textAuthor === "H";
    return true;
  });

  return (
    <div className="container fade-in" style={{ maxWidth: 560 }}>
      <div style={{ textAlign: "center", marginBottom: 28 }}>
        <div className="hand" style={{ fontSize: 22, color: "var(--ink-3)" }}>
          photo + words
        </div>
        <h1 className="page-title" style={{ fontSize: 32 }}>
          사진 + 글
        </h1>
        <div
          className="serif"
          style={{ color: "var(--ink-2)", marginTop: 6, fontSize: 16 }}
        >
          한 사람이 찍고, 한 사람이 쓰다
        </div>
      </div>

      <div
        className="row-between"
        style={{ marginBottom: 20, flexWrap: "wrap", gap: 12 }}
      >
        <div
          className="row gap-4"
          style={{
            padding: 4,
            background: "var(--paper-ink)",
            borderRadius: "var(--r-md)",
          }}
        >
          {FILTERS.map((f) => (
            <button
              key={f.id}
              type="button"
              onClick={() => setFilter(f.id)}
              className="btn btn-sm"
              style={{
                background: filter === f.id ? "var(--paper-2)" : "transparent",
                border: "none",
                color: filter === f.id ? "var(--ink)" : "var(--ink-3)",
                fontWeight: filter === f.id ? 500 : 400,
                boxShadow: filter === f.id ? "var(--shadow-sm)" : "none",
              }}
            >
              {f.label}
            </button>
          ))}
        </div>
        {canUpload && (
          <Link href="/photostory/new" className="btn btn-primary">
            <span>📷</span> 사진 올리기
          </Link>
        )}
      </div>

      {filtered.length === 0 ? (
        <div className="card-flat center" style={{ padding: 60, color: "var(--ink-3)" }}>
          <span className="hand" style={{ fontSize: 20 }}>아직 비어 있어요</span>
        </div>
      ) : (
        <div>
          {filtered.map((p) => (
            <FeedCard key={p.id} story={p} />
          ))}
        </div>
      )}
    </div>
  );
}
