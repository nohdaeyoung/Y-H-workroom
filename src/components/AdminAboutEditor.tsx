"use client";

import { useState } from "react";
import { useFormState, useFormStatus } from "react-dom";
import { RichEditor } from "./RichEditor";
import {
  saveAboutAction,
  type AboutActionState,
} from "@/app/admin/about/actions";
import type { AboutSection } from "@/types/domain";

const initial: AboutActionState = { error: "" };

type Props = {
  sections: AboutSection[];
  sectionTitles: Record<string, string>;
  defaultKeys: string[]; // 좌측 리스트 순서
};

export default function AdminAboutEditor({
  sections: initialSections,
  sectionTitles,
  defaultKeys,
}: Props) {
  const [sections, setSections] = useState<AboutSection[]>(() => {
    // defaultKeys 순서로 정렬, initialSections에 있는 값 우선 사용
    return defaultKeys.map((key) => {
      const existing = initialSections.find((s) => s.key === key);
      return (
        existing ?? {
          key,
          title: sectionTitles[key] || key,
          body: "",
        }
      );
    });
  });
  const [activeKey, setActiveKey] = useState(defaultKeys[0]);
  const [state, action] = useFormState(saveAboutAction, initial);

  const active =
    sections.find((s) => s.key === activeKey) ?? sections[0];
  const isProfile = active.key === "y_profile" || active.key === "h_profile";

  function updateActive(patch: Partial<AboutSection>) {
    setSections((prev) =>
      prev.map((s) => (s.key === activeKey ? { ...s, ...patch } : s))
    );
  }

  return (
    <form action={action}>
      <input
        type="hidden"
        name="sections"
        value={JSON.stringify(sections)}
      />
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "220px 1fr",
          gap: 20,
        }}
        className="admin-about-grid"
      >
        <div className="card" style={{ padding: 8, alignSelf: "flex-start" }}>
          {defaultKeys.map((key) => {
            const label = sectionTitles[key] || key;
            return (
              <button
                key={key}
                type="button"
                onClick={() => setActiveKey(key)}
                style={{
                  display: "block",
                  width: "100%",
                  textAlign: "left",
                  padding: "10px 12px",
                  borderRadius: "var(--r-md)",
                  background:
                    activeKey === key ? "var(--paper-ink)" : "transparent",
                  fontSize: 14,
                  fontWeight: activeKey === key ? 500 : 400,
                  color:
                    activeKey === key ? "var(--ink)" : "var(--ink-2)",
                  cursor: "pointer",
                  border: "none",
                }}
              >
                <div>{label}</div>
                <div className="meta" style={{ fontSize: 11 }}>
                  /about · {key}
                </div>
              </button>
            );
          })}
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
          <div
            className="row-between"
            style={{ marginBottom: 16, flexWrap: "wrap", gap: 8 }}
          >
            <h3 className="section-title">
              {sectionTitles[active.key] || active.key} 섹션 편집
            </h3>
            <span className="chip" style={{ fontSize: 11 }}>
              섹션 키: {active.key}
            </span>
          </div>

          <label className="label">제목</label>
          <input
            className="input"
            value={active.title}
            onChange={(e) => updateActive({ title: e.target.value })}
          />

          <label className="label" style={{ marginTop: 14 }}>
            본문
          </label>
          <RichEditor
            key={active.key}
            value={active.body}
            onChange={(html) => updateActive({ body: html })}
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
                  style={{
                    width: 72,
                    height: 72,
                    borderRadius: "50%",
                    fontSize: 24,
                    overflow: "hidden",
                  }}
                >
                  {active.imageUrl ? (
                    <img
                      src={active.imageUrl}
                      alt=""
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                      }}
                    />
                  ) : (
                    "📷"
                  )}
                </div>
                <button type="button" className="btn" disabled>
                  이미지 업로드 (Phase 5에서 R2 연결 예정)
                </button>
              </div>
            </>
          )}

          {state.error && (
            <div
              className="meta"
              style={{
                marginTop: 14,
                color: "var(--danger)",
                fontSize: 13,
              }}
            >
              {state.error}
            </div>
          )}
          {state.ok && (
            <div
              className="meta"
              style={{
                marginTop: 14,
                color: "var(--success)",
                fontSize: 13,
              }}
            >
              ✓ 저장됨 — /about 페이지에 반영됐어요
            </div>
          )}

          <div
            className="row-between"
            style={{ marginTop: 24, flexWrap: "wrap", gap: 8 }}
          >
            <a
              href="/about"
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-ghost"
            >
              미리보기
            </a>
            <SaveBtn />
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
    </form>
  );
}

function SaveBtn() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" className="btn btn-primary" disabled={pending}>
      {pending ? "저장 중…" : "저장 → 공개 반영"}
    </button>
  );
}
