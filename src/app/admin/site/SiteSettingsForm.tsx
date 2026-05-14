"use client";

import { useState } from "react";
import { useFormState, useFormStatus } from "react-dom";
import { saveSiteAction, type SiteActionState } from "./actions";
import type { SiteSettings } from "@/types/domain";

const initial: SiteActionState = { error: "" };

const TEXTAREA_STYLE: React.CSSProperties = {
  width: "100%",
  minHeight: 140,
  padding: 12,
  background: "var(--paper-2)",
  border: "1px solid var(--line)",
  borderRadius: "var(--r-md)",
  fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
  fontSize: 12.5,
  lineHeight: 1.55,
  color: "var(--ink)",
  resize: "vertical",
};

export default function SiteSettingsForm({ initial: data }: { initial: SiteSettings }) {
  const [state, action] = useFormState(saveSiteAction, initial);
  const [metaTitle, setMetaTitle] = useState(data.metaTitle);
  const [metaDescription, setMetaDescription] = useState(data.metaDescription);
  const [ogImageUrl, setOgImageUrl] = useState(data.ogImageUrl);
  const [headHtml, setHeadHtml] = useState(data.headHtml);
  const [bodyStartHtml, setBodyStartHtml] = useState(data.bodyStartHtml);
  const [bodyEndHtml, setBodyEndHtml] = useState(data.bodyEndHtml);

  return (
    <form action={action} className="col gap-24">
      <section className="card" style={{ padding: 24 }}>
        <h3 className="section-title" style={{ marginBottom: 4 }}>📛 메타 태그</h3>
        <div className="meta" style={{ marginBottom: 16, fontSize: 12 }}>
          검색 결과와 SNS 공유 카드에 노출돼요.
        </div>

        <label className="label">사이트 제목 (title)</label>
        <input
          className="input"
          name="metaTitle"
          value={metaTitle}
          onChange={(e) => setMetaTitle(e.target.value)}
          placeholder="영희네 작업실"
          maxLength={200}
        />

        <label className="label" style={{ marginTop: 14 }}>설명 (description)</label>
        <input
          className="input"
          name="metaDescription"
          value={metaDescription}
          onChange={(e) => setMetaDescription(e.target.value)}
          placeholder="두 사람의 글과 사진이 만나는 곳"
          maxLength={500}
        />

        <label className="label" style={{ marginTop: 14 }}>OG 이미지 URL (1200×630 권장)</label>
        <input
          className="input"
          name="ogImageUrl"
          value={ogImageUrl}
          onChange={(e) => setOgImageUrl(e.target.value)}
          placeholder="https://..."
          maxLength={500}
        />
      </section>

      <section className="card" style={{ padding: 24 }}>
        <h3 className="section-title" style={{ marginBottom: 4 }}>📊 &lt;head&gt; 스크립트</h3>
        <div className="meta" style={{ marginBottom: 16, fontSize: 12 }}>
          GA, 메타태그, GTM head 영역 등. raw HTML 그대로 삽입돼요.
          <span style={{ color: "var(--danger)" }}> · Y 본인 책임 (sanitize 안 함)</span>
        </div>
        <textarea
          name="headHtml"
          value={headHtml}
          onChange={(e) => setHeadHtml(e.target.value)}
          style={TEXTAREA_STYLE}
          placeholder={`<!-- Google Analytics 예시 -->\n<script async src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXX"></script>\n<script>\n  window.dataLayer = window.dataLayer || [];\n  function gtag(){dataLayer.push(arguments);}\n  gtag('js', new Date());\n  gtag('config', 'G-XXXXXXX');\n</script>`}
          maxLength={50000}
        />
      </section>

      <section className="card" style={{ padding: 24 }}>
        <h3 className="section-title" style={{ marginBottom: 4 }}>🚀 &lt;body&gt; 시작 직후</h3>
        <div className="meta" style={{ marginBottom: 16, fontSize: 12 }}>
          GTM noscript iframe 등.
        </div>
        <textarea
          name="bodyStartHtml"
          value={bodyStartHtml}
          onChange={(e) => setBodyStartHtml(e.target.value)}
          style={TEXTAREA_STYLE}
          placeholder={`<!-- GTM noscript 예시 -->\n<noscript><iframe src="https://www.googletagmanager.com/ns.html?id=GTM-XXXXX" height="0" width="0" style="display:none;visibility:hidden"></iframe></noscript>`}
          maxLength={50000}
        />
      </section>

      <section className="card" style={{ padding: 24 }}>
        <h3 className="section-title" style={{ marginBottom: 4 }}>🏁 &lt;/body&gt; 직전</h3>
        <div className="meta" style={{ marginBottom: 16, fontSize: 12 }}>
          페이지 끝에 로드돼야 하는 추적 픽셀, chat 위젯 등.
        </div>
        <textarea
          name="bodyEndHtml"
          value={bodyEndHtml}
          onChange={(e) => setBodyEndHtml(e.target.value)}
          style={TEXTAREA_STYLE}
          placeholder={`<!-- Meta Pixel, 채널톡 위젯, 등등 -->`}
          maxLength={50000}
        />
      </section>

      <div className="row-between" style={{ flexWrap: "wrap", gap: 8 }}>
        <div className="meta" style={{ fontSize: 12 }}>
          {state.error && <span style={{ color: "var(--danger)" }}>{state.error}</span>}
          {state.ok && <span style={{ color: "var(--success)" }}>✓ 저장됨 — 공개 페이지에 반영됐어요</span>}
        </div>
        <SaveBtn />
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
