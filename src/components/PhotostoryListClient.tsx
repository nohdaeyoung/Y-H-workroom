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

const HEIGHTS = [240, 280, 220, 300, 260];

function formatShort(ts: number) {
  const d = new Date(ts);
  return `${d.getMonth() + 1}/${d.getDate()}`;
}

function PhotoCard({ story, idx }: { story: Photostory; idx: number }) {
  const waiting = story.status === "waiting";
  const h = HEIGHTS[idx % HEIGHTS.length];
  const name = story.textAuthor === "Y" ? "대영" : "희서";
  const firstPhoto = story.photos[0];

  return (
    <Link
      href={`/photostory/${story.id}`}
      className="lift"
      style={{
        display: "block",
        borderRadius: "var(--r-lg)",
        overflow: "hidden",
        background: "var(--paper-2)",
        border: "1px solid var(--line)",
      }}
    >
      <div style={{ position: "relative", height: h, overflow: "hidden" }}>
        {firstPhoto ? (
          <img
            src={firstPhoto}
            alt={story.photoTitle}
            loading="lazy"
            decoding="async"
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
          />
        ) : (
          <PhotoPlaceholder hue={(idx * 47) % 360} height={h} idx={idx} />
        )}
        {story.photos.length > 1 && (
          <div
            style={{
              position: "absolute",
              top: 10,
              right: 10,
              padding: "3px 8px",
              background: "oklch(0.2 0.02 50 / 0.65)",
              color: "white",
              fontSize: 11,
              borderRadius: "var(--r-pill)",
            }}
          >
            📷 {story.photos.length}
          </div>
        )}
        {waiting && (
          <div
            style={{
              position: "absolute",
              bottom: 10,
              left: 10,
              padding: "4px 10px",
              background: "oklch(0.97 0.03 80 / 0.95)",
              color: "var(--ink-2)",
              fontSize: 11,
              borderRadius: "var(--r-pill)",
              fontWeight: 500,
            }}
          >
            ⏳ {name}의 글 대기중
          </div>
        )}
      </div>
      <div style={{ padding: "14px 16px 16px" }}>
        <div
          className="row gap-4"
          style={{ fontSize: 11, color: "var(--ink-3)", letterSpacing: "0.04em" }}
        >
          <span
            style={{
              color:
                story.photoAuthor === "Y" ? "var(--y-deep)" : "var(--h-deep)",
              fontWeight: 600,
            }}
          >
            📸 {story.photoAuthor}
          </span>
          <span>→</span>
          <span
            style={{
              color:
                story.textAuthor === "Y" ? "var(--y-deep)" : "var(--h-deep)",
              fontWeight: 600,
              opacity: waiting ? 0.4 : 1,
            }}
          >
            ✍️ {story.textAuthor}
          </span>
          <span style={{ marginLeft: "auto" }}>
            {formatShort(story.photoUploadedAt)}
          </span>
        </div>
        <h3 className="serif" style={{ fontSize: 17, marginTop: 8, lineHeight: 1.4 }}>
          {story.photoTitle}
        </h3>
        {story.text && (
          <p
            className="serif"
            style={{
              fontSize: 14,
              color: "var(--ink-2)",
              marginTop: 8,
              lineHeight: 1.7,
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
            }}
          >
            {story.text.replace(/<[^>]+>/g, "").slice(0, 120)}
          </p>
        )}
      </div>
    </Link>
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
    <div className="container fade-in" style={{ maxWidth: 1080 }}>
      <div style={{ textAlign: "center", marginBottom: 32 }}>
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
        style={{ marginBottom: 24, flexWrap: "wrap", gap: 12 }}
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
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
            gap: 20,
          }}
        >
          {filtered.map((p, idx) => (
            <PhotoCard key={p.id} story={p} idx={idx} />
          ))}
        </div>
      )}
    </div>
  );
}
