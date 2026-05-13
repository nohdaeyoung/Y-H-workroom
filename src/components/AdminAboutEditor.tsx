"use client";

import { useState } from "react";
import { RichEditor } from "./RichEditor";

type Section = { key: string; title: string };

const DEFAULT_BODY: Record<string, string> = {
  header: "<p>두 사람이 함께 쓰는 작은 공간</p>",
  greeting:
    "<p>여기는 영(Y)과 희(H), 두 사람만 글을 쓰는 작업실입니다.</p><p>같은 시간, 다른 시선으로 쌓아가는 글과 사진이 있어요.</p>",
  y_profile: "<p>마음에 남는 장면을 그날의 빛으로 적어둡니다.</p>",
  h_profile: "<p>지나가는 풍경에 잠깐 멈춰 서는 일을 좋아합니다.</p>",
  story: "<p>두 사람의 글이 우연히 만나는 페이지를 갖고 싶었습니다.</p>",
  contact: "<p>혹시 하고 싶은 말이 있다면 댓글로 남겨주세요.</p>",
};

export default function AdminAboutEditor({ sections }: { sections: Section[] }) {
  const [activeKey, setActiveKey] = useState(sections[0]?.key ?? "header");
  const [titleMap, setTitleMap] = useState<Record<string, string>>(() =>
    Object.fromEntries(sections.map((s) => [s.key, s.title]))
  );
  const [bodyMap, setBodyMap] = useState<Record<string, string>>(() => ({ ...DEFAULT_BODY }));
  const [saving, setSaving] = useState(false);
  const [savedMsg, setSavedMsg] = useState<string | null>(null);

  const active = sections.find((s) => s.key === activeKey) ?? sections[0];
  const isProfile = active.key === "y_profile" || active.key === "h_profile";

  function save() {
    setSaving(true);
    setSavedMsg(null);
    setTimeout(() => {
      setSaving(false);
      setSavedMsg("저장됨 (데모 — Phase 6 후반부 연결)");
      setTimeout(() => setSavedMsg(null), 2200);
    }, 600);
  }

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "220px 1fr",
        gap: 20,
      }}
      className="admin-about-grid"
    >
      <div className="card" style={{ padding: 8, alignSelf: "flex-start" }}>
        {sections.map((s) => (
          <button
            key={s.key}
            type="button"
            onClick={() => setActiveKey(s.key)}
            style={{
              display: "block",
              width: "100%",
              textAlign: "left",
              padding: "10px 12px",
              borderRadius: "var(--r-md)",
              background:
                activeKey === s.key ? "var(--paper-ink)" : "transparent",
              fontSize: 14,
              fontWeight: activeKey === s.key ? 500 : 400,
              color: activeKey === s.key ? "var(--ink)" : "var(--ink-2)",
              cursor: "pointer",
              border: "none",
            }}
          >
            <div>{s.title}</div>
            <div className="meta" style={{ fontSize: 11 }}>
              /about · {s.key}
            </div>
          </button>
        ))}
        <hr />
        <div style={{ padding: "0 12px 8px" }}>
          <a
            href="/about"
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-ghost btn-sm"
            style={{ fontSize: 12, width: "100%" }}
          >
            ↗ 공개 페이지 보기
          </a>
        </div>
      </div>

      <div className="card">
        <div className="row-between" style={{ marginBottom: 16, flexWrap: "wrap", gap: 8 }}>
          <h3 className="section-title">{active.title} 섹션 편집</h3>
          <span className="chip" style={{ fontSize: 11 }}>
            섹션 키: {active.key}
          </span>
        </div>

        <label className="label">제목</label>
        <input
          className="input"
          value={titleMap[active.key] ?? ""}
          onChange={(e) =>
            setTitleMap((m) => ({ ...m, [active.key]: e.target.value }))
          }
        />

        <label className="label" style={{ marginTop: 14 }}>본문</label>
        <RichEditor
          key={active.key}
          value={bodyMap[active.key] ?? ""}
          onChange={(html) =>
            setBodyMap((m) => ({ ...m, [active.key]: html }))
          }
          variant="full"
          minHeight={260}
        />

        {isProfile && (
          <>
            <label className="label" style={{ marginTop: 14 }}>
              프로필 이미지
            </label>
            <div className="row gap-12" style={{ alignItems: "center" }}>
              <div
                className="photo"
                style={{ width: 72, height: 72, borderRadius: "50%", fontSize: 24 }}
              >
                📷
              </div>
              <button type="button" className="btn" disabled>
                이미지 업로드 (Phase 5)
              </button>
            </div>
          </>
        )}

        {savedMsg && (
          <div
            className="meta"
            style={{
              marginTop: 14,
              color: "var(--success)",
              fontSize: 13,
            }}
          >
            ✓ {savedMsg}
          </div>
        )}

        <div className="row-between" style={{ marginTop: 24, flexWrap: "wrap", gap: 8 }}>
          <button type="button" className="btn btn-ghost" disabled>
            미리보기
          </button>
          <div className="row gap-8">
            <button type="button" className="btn" disabled>
              취소
            </button>
            <button
              type="button"
              className="btn btn-primary"
              onClick={save}
              disabled={saving}
            >
              {saving ? "저장 중…" : "저장 → 공개 반영"}
            </button>
          </div>
        </div>
      </div>

      <style jsx>{`
        @media (max-width: 768px) {
          .admin-about-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}
