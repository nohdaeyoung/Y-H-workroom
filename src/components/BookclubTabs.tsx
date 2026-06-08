"use client";

import { useState } from "react";

const TABS = [
  { id: "impressions", label: "소감", icon: "📝" },
  { id: "quotes", label: "나만의 문장", icon: "📖" },
] as const;

type TabId = (typeof TABS)[number]["id"];

export default function BookclubTabs({
  record: _record,
  impressions,
  quotes,
}: {
  record: React.ReactNode;
  impressions: React.ReactNode;
  quotes: React.ReactNode;
}) {
  const [active, setActive] = useState<TabId>("impressions");

  return (
    <>
      <div
        className="row gap-4"
        style={{
          padding: 4,
          background: "var(--paper-ink)",
          borderRadius: "var(--r-md)",
          marginBottom: 20,
          display: "inline-flex",
          flexWrap: "wrap",
        }}
      >
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setActive(t.id)}
            className="btn btn-sm"
            style={{
              background:
                active === t.id ? "var(--paper-2)" : "transparent",
              border: "none",
              color: active === t.id ? "var(--ink)" : "var(--ink-3)",
              fontWeight: active === t.id ? 500 : 400,
              boxShadow: active === t.id ? "var(--shadow-sm)" : "none",
            }}
          >
            <span style={{ marginRight: 4 }}>{t.icon}</span>
            {t.label}
          </button>
        ))}
      </div>

      <div style={{ display: active === "impressions" ? "block" : "none" }}>
        {impressions}
      </div>
      <div style={{ display: active === "quotes" ? "block" : "none" }}>
        {quotes}
      </div>
    </>
  );
}
