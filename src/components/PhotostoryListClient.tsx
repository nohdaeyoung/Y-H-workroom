"use client";

import { useState } from "react";
import Link from "next/link";
import PhotoPlaceholder from "./PhotoPlaceholder";
import Comments from "./Comments";
import type { Photostory } from "@/types/domain";

function formatShort(ts: number) {
  const d = new Date(ts);
  return `${d.getMonth() + 1}.${String(d.getDate()).padStart(2, "0")}`;
}

function stripHtml(html: string): string {
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
              background: "var(--paper-2)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              minHeight: 240,
            }}
          >
            <img
              src={src}
              alt={`${title} - ${i + 1}`}
              loading="lazy"
              decoding="async"
              style={{
                width: "100%",
                height: "auto",
                maxHeight: "80vh",
                objectFit: "contain",
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

function FeedCard({ story, isYH }: { story: Photostory; isYH: boolean }) {
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
      <div
        className="row gap-8"
        style={{
          padding: "14px 18px",
          borderBottom: "1px solid var(--line)",
          alignItems: "center",
          flexWrap: "wrap",
        }}
      >
        <div style={{ flex: 1, minWidth: 0 }}>
          <div className="meta" style={{ fontSize: 12 }}>
            {formatShort(story.photoUploadedAt)}
            {waiting && isYH && (
              <span style={{ marginLeft: 8 }}>· ⏳ 글 작성 대기</span>
            )}
          </div>
        </div>
        {isYH && (
          <Link
            href={`/photostory/${story.id}/edit`}
            className="btn btn-ghost btn-sm"
            style={{ fontSize: 12 }}
          >
            ✎ 편집
          </Link>
        )}
      </div>

      {story.photos.length > 0 ? (
        <PhotoSlider photos={story.photos} title={story.photoTitle} />
      ) : (
        <PhotoPlaceholder hue={0} height={400} idx={0} />
      )}

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
          isYH && (
            <div
              className="hand"
              style={{
                marginTop: 10,
                fontSize: 16,
                color: "var(--ink-3)",
              }}
            >
              아직 글을 적지 않았어요
            </div>
          )
        )}
      </div>

      <div
        style={{
          borderTop: "1px solid var(--line)",
          padding: "12px 20px 18px",
        }}
      >
        <Comments parentType="photostory" parentId={story.id} isYH={isYH} />
      </div>
    </article>
  );
}

export default function PhotostoryListClient({
  items,
  canUpload,
  isYH,
}: {
  items: Photostory[];
  canUpload: boolean;
  isYH: boolean;
}) {
  // Y가 찍은 사진만 노출.
  const ySource = items.filter((p) => p.photoAuthor === "Y");
  // 비로그인은 완성된 것만, 로그인이면 대기중도 보임.
  const visible = isYH ? ySource : ySource.filter((p) => p.status === "completed");

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
          한 장면, 한 줄의 기록
        </div>
      </div>

      <div
        className="row-between"
        style={{ marginBottom: 20, flexWrap: "wrap", gap: 12 }}
      >
        <span />
        {canUpload && (
          <Link href="/photostory/new" className="btn btn-primary">
            <span>📷</span> 사진 올리기
          </Link>
        )}
      </div>

      {visible.length === 0 ? (
        <div className="card-flat center" style={{ padding: 60, color: "var(--ink-3)" }}>
          <span className="hand" style={{ fontSize: 20 }}>아직 비어 있어요</span>
        </div>
      ) : (
        <div>
          {visible.map((p) => (
            <FeedCard key={p.id} story={p} isYH={isYH} />
          ))}
        </div>
      )}
    </div>
  );
}
