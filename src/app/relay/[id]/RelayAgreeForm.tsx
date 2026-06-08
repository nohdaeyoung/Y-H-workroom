"use client";

import { toggleAgreeAction } from "@/app/relay/actions";

export default function RelayAgreeForm({
  relayId,
  yAgreed,
  hAgreed: _hAgreed,
  viewer,
}: {
  relayId: string;
  yAgreed: boolean;
  hAgreed: boolean;
  viewer: "Y" | "H" | null;
}) {
  // 솔로 모드: Y의 동의 하나로 완결 토글.
  const editable = viewer === "Y";
  const agreed = yAgreed;

  return (
    <div
      className="row-between"
      style={{
        marginTop: 16,
        padding: "12px 18px",
        background: "var(--paper-ink)",
        borderRadius: "var(--r-md)",
        flexWrap: "wrap",
        gap: 12,
      }}
    >
      <span className="meta">완결 표시</span>
      {editable ? (
        <form action={toggleAgreeAction} style={{ display: "inline" }}>
          <input type="hidden" name="relayId" value={relayId} />
          <input type="hidden" name="agreed" value={agreed ? "" : "on"} />
          <button
            type="submit"
            className="btn btn-ghost btn-sm"
            style={{ padding: "4px 12px", fontSize: 13 }}
            title={agreed ? "완결 해제" : "완결로 표시"}
          >
            {agreed ? "✅ 완결됨 (해제)" : "⬜ 완결로 표시"}
          </button>
        </form>
      ) : (
        <span style={{ fontSize: 13 }}>
          {agreed ? "✅ 완결" : "⬜ 진행중"}
        </span>
      )}
    </div>
  );
}
