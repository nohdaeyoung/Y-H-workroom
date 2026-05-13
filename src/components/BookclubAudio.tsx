"use client";

import { useState } from "react";

export default function BookclubAudio({ duration }: { duration: string }) {
  const [playing, setPlaying] = useState(false);
  return (
    <div
      className="row gap-12"
      style={{
        marginTop: 20,
        padding: "10px 14px",
        background: "var(--paper)",
        borderRadius: "var(--r-md)",
        border: "1px solid var(--line)",
      }}
    >
      <button
        type="button"
        className="btn btn-sm"
        style={{ width: 36, height: 36, padding: 0, borderRadius: "50%" }}
        onClick={() => setPlaying((p) => !p)}
        aria-label={playing ? "일시정지" : "재생"}
      >
        {playing ? "⏸" : "▶"}
      </button>
      <div className="flex-1">
        <div
          style={{
            height: 4,
            background: "var(--paper-deep)",
            borderRadius: 2,
            position: "relative",
          }}
        >
          <div
            style={{
              position: "absolute",
              left: 0,
              top: 0,
              height: "100%",
              width: playing ? "32%" : "0%",
              background: "var(--ink)",
              borderRadius: 2,
              transition: "width 0.4s",
            }}
          />
        </div>
        <div className="row-between" style={{ marginTop: 4 }}>
          <span className="meta">26:43</span>
          <span className="meta">{duration}</span>
        </div>
      </div>
      <span className="meta">🎧 녹음 듣기</span>
    </div>
  );
}
