"use client";

import { useState } from "react";
import type { KeywordEssay } from "@/lib/mock-keywords";

function formatDate(ts: number) {
  const d = new Date(ts);
  return `${d.getMonth() + 1}/${d.getDate()}`;
}

function Pane({
  essay,
  user,
  blind,
}: {
  essay: KeywordEssay | null;
  user: "Y" | "H";
  blind: boolean;
}) {
  const cls = user === "Y" ? "y" : "h";
  const name = user === "Y" ? "대영" : "희서";
  const deepVar = user === "Y" ? "var(--y-deep)" : "var(--h-deep)";

  return (
    <div className={`split-pane ${cls}-pane keyword-pane-${cls}`}>
      <div className="row gap-8" style={{ marginBottom: 16 }}>
        <span className={`avatar-mini ${cls}`}>{user}</span>
        <div>
          <div style={{ fontSize: 13, fontWeight: 500, color: deepVar }}>
            {name}
          </div>
          <div className="hand" style={{ fontSize: 15, color: "var(--ink-4)" }}>
            {essay ? `${formatDate(essay.writtenAt)} 작성 완료` : "대기 중"}
          </div>
        </div>
      </div>

      {!essay ? (
        <div
          style={{
            padding: "60px 12px",
            textAlign: "center",
            background: "oklch(0.97 0.015 80 / 0.5)",
            borderRadius: "var(--r-md)",
            border: "1px dashed var(--line)",
          }}
        >
          <div style={{ fontSize: 32, opacity: 0.4 }}>⏳</div>
          <div
            className="hand"
            style={{ fontSize: 22, color: "var(--ink-3)", marginTop: 8 }}
          >
            아직 쓰지 않았어요
          </div>
          <div className="meta" style={{ marginTop: 8 }}>
            {name}을(를) 기다리고 있어요
          </div>
        </div>
      ) : blind ? (
        <div
          style={{
            padding: "60px 12px",
            textAlign: "center",
            background: "oklch(0.97 0.015 80 / 0.6)",
            borderRadius: "var(--r-md)",
            border: "1px solid var(--line)",
            position: "relative",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              position: "absolute",
              inset: 0,
              backgroundImage:
                "repeating-linear-gradient(45deg, oklch(0.92 0.02 80) 0 8px, transparent 8px 16px)",
              opacity: 0.7,
            }}
          />
          <div style={{ position: "relative" }}>
            <div style={{ fontSize: 32, opacity: 0.5 }}>🔒</div>
            <div
              className="hand"
              style={{ fontSize: 22, color: "var(--ink-3)", marginTop: 8 }}
            >
              봉인됨
            </div>
            <div className="meta" style={{ marginTop: 8 }}>
              {name}이(가) 글을 완성했어요
            </div>
            <div className="meta" style={{ marginTop: 4 }}>
              당신이 쓰면 동시에 공개돼요
            </div>
          </div>
        </div>
      ) : (
        <>
          <h3
            className="serif"
            style={{ fontSize: 22, marginBottom: 14, lineHeight: 1.4 }}
          >
            {essay.title}
          </h3>
          <div
            className="prose"
            style={{
              maxHeight: 420,
              overflowY: "auto",
              paddingRight: 6,
              fontSize: 16,
            }}
          >
            {essay.content
              .split("\n")
              .map((p, i) => (p.trim() ? <p key={i}>{p}</p> : null))}
          </div>
        </>
      )}
    </div>
  );
}

type Props = {
  yEssay: KeywordEssay | null;
  hEssay: KeywordEssay | null;
  viewerId: string | null;
  bothDone: boolean;
};

export default function KeywordSplit({
  yEssay,
  hEssay,
  viewerId,
  bothDone,
}: Props) {
  const [mobileTab, setMobileTab] = useState<"y" | "h">("y");

  // blind: 글은 있지만 viewer가 상대(또는 비로그인)라서 봉인된 상태
  const yBlind = !bothDone && viewerId !== "Y";
  const hBlind = !bothDone && viewerId !== "H";

  return (
    <div data-keyword-mobile-tab={mobileTab}>
      <div className="essay-mobile-tabs" style={{ marginBottom: 14 }}>
        <button
          type="button"
          className={`btn btn-sm ${mobileTab === "y" ? "btn-y" : ""}`}
          onClick={() => setMobileTab("y")}
          style={{ flex: 1 }}
        >
          Y · 대영
        </button>
        <button
          type="button"
          className={`btn btn-sm ${mobileTab === "h" ? "btn-h" : ""}`}
          onClick={() => setMobileTab("h")}
          style={{ flex: 1 }}
        >
          H · 희서
        </button>
      </div>

      <div className="split keyword-split">
        <Pane essay={yEssay} user="Y" blind={yBlind} />
        <Pane essay={hEssay} user="H" blind={hBlind} />
      </div>
    </div>
  );
}
