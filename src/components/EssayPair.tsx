"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import parse from "html-react-parser";
import { sanitizeRichHtml } from "@/lib/sanitize";
import type { Essay } from "@/types/domain";
import { pairEssaysByDate } from "@/lib/mock-essays";
import Comments from "./Comments";

function formatDate(ts: number) {
  const d = new Date(ts);
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, "0")}.${String(d.getDate()).padStart(2, "0")}`;
}

function shortDate(ts: number) {
  const d = new Date(ts);
  return `${d.getMonth() + 1}/${d.getDate()}`;
}

function sanitize(html: string) {
  return sanitizeRichHtml(html);
}

function EssayPane({
  essay,
  color,
  isYH,
}: {
  essay?: Essay;
  color: "y" | "h";
  isYH: boolean;
}) {
  if (!essay) {
    return (
      <div
        className="hand"
        style={{
          textAlign: "center",
          color: "var(--ink-4)",
          fontSize: 18,
          padding: "120px 0",
        }}
      >
        {color === "y" ? "Y" : "H"}의 글이 아직 없어요
      </div>
    );
  }
  const name = color === "y" ? "Y" : "H";
  const deepVar = color === "y" ? "var(--y-deep)" : "var(--h-deep)";

  return (
    <>
      <div className="row gap-8" style={{ marginBottom: 16 }}>
        <span className={`avatar-mini ${color}`}>{essay.author}</span>
        <div>
          <div style={{ fontSize: 13, fontWeight: 500, color: deepVar }}>
            {name}
          </div>
          <div className="hand" style={{ fontSize: 15, color: "var(--ink-4)" }}>
            {formatDate(essay.createdAt)}
          </div>
        </div>
      </div>
      <h2
        className="serif"
        style={{
          fontSize: 24,
          marginBottom: 16,
          lineHeight: 1.4,
          letterSpacing: "-0.02em",
        }}
      >
        {essay.title}
      </h2>
      {essay.tags && essay.tags.length > 0 && (
        <div className="row gap-4" style={{ marginBottom: 16, flexWrap: "wrap" }}>
          {essay.tags.map((t) => (
            <span key={t} className="chip" style={{ fontSize: 11 }}>
              #{t}
            </span>
          ))}
        </div>
      )}
      <div
        className="prose"
        style={{ maxHeight: 460, overflowY: "auto", paddingRight: 6 }}
      >
        {parse(sanitize(essay.content))}
      </div>
      <div style={{ marginTop: 12, textAlign: "right" }}>
        <Link
          href={`/essay/${essay.id}`}
          className="btn btn-ghost btn-sm"
          style={{ fontSize: 12 }}
        >
          단독으로 보기 →
        </Link>
      </div>
      <Comments parentType="essay" parentId={essay.id} isYH={isYH} />
    </>
  );
}

export default function EssayPair({
  essays,
  isYH,
}: {
  essays: Essay[];
  isYH: boolean;
}) {
  const pairs = useMemo(() => {
    const ps = pairEssaysByDate(essays);
    return ps.map((p, i) => ({
      id: `${p.y?.id ?? "y"}-${p.h?.id ?? "h"}-${i}`,
      y: p.y,
      h: p.h,
      date: p.y?.createdAt ?? p.h?.createdAt ?? Date.now(),
      topic: p.y?.tags?.[0] || p.h?.tags?.[0] || "",
    }));
  }, [essays]);

  const [activeIdx, setActiveIdx] = useState(0);
  const [mobileTab, setMobileTab] = useState<"y" | "h">("y");

  if (pairs.length === 0) {
    return (
      <div className="card center" style={{ padding: 80 }}>
        <div className="hand" style={{ fontSize: 22, color: "var(--ink-4)" }}>
          아직 비어 있어요
        </div>
      </div>
    );
  }

  const active = pairs[activeIdx];

  return (
    <div data-essay-mobile-tab={mobileTab}>
      {/* 페어 셀렉터 */}
      {pairs.length > 1 && (
        <div
          className="row gap-8"
          style={{
            overflowX: "auto",
            paddingBottom: 12,
            marginBottom: 20,
          }}
        >
          {pairs.map((p, i) => {
            const isActive = i === activeIdx;
            return (
              <button
                key={p.id}
                type="button"
                onClick={() => setActiveIdx(i)}
                className="chip"
                style={{
                  fontSize: 13,
                  padding: "8px 14px",
                  background: isActive ? "var(--ink)" : "var(--paper-2)",
                  color: isActive ? "var(--paper-2)" : "var(--ink-2)",
                  borderColor: isActive ? "var(--ink)" : "var(--line)",
                  cursor: "pointer",
                  whiteSpace: "nowrap",
                }}
              >
                <span className="hand" style={{ fontSize: 16 }}>
                  {shortDate(p.date)}
                </span>
                {p.topic && (
                  <>
                    <span style={{ margin: "0 6px", opacity: 0.5 }}>·</span>
                    <span>{p.topic}</span>
                  </>
                )}
              </button>
            );
          })}
        </div>
      )}

      {/* 모바일 탭 */}
      <div className="essay-mobile-tabs" style={{ marginBottom: 14 }}>
        <button
          type="button"
          className={`btn btn-sm ${mobileTab === "y" ? "btn-y" : ""}`}
          onClick={() => setMobileTab("y")}
          style={{ flex: 1 }}
        >
          Y · {active.y?.title ?? "글 없음"}
        </button>
        <button
          type="button"
          className={`btn btn-sm ${mobileTab === "h" ? "btn-h" : ""}`}
          onClick={() => setMobileTab("h")}
          style={{ flex: 1 }}
        >
          H · {active.h?.title ?? "글 없음"}
        </button>
      </div>

      {/* Split */}
      <div className="split essay-split">
        <div className="split-pane y-pane essay-pane-y">
          <EssayPane essay={active.y} color="y" isYH={isYH} />
        </div>
        <div className="split-pane h-pane essay-pane-h">
          <EssayPane essay={active.h} color="h" isYH={isYH} />
        </div>
      </div>

      {/* 페어 네비 */}
      {pairs.length > 1 && (
        <div className="row-between" style={{ marginTop: 24 }}>
          <button
            type="button"
            className="btn"
            disabled={activeIdx === pairs.length - 1}
            onClick={() => setActiveIdx((i) => Math.min(i + 1, pairs.length - 1))}
          >
            ← 이전 페어
          </button>
          <span className="meta">
            {activeIdx + 1} / {pairs.length}
          </span>
          <button
            type="button"
            className="btn"
            disabled={activeIdx === 0}
            onClick={() => setActiveIdx((i) => Math.max(i - 1, 0))}
          >
            다음 페어 →
          </button>
        </div>
      )}
    </div>
  );
}
