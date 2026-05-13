"use client";

import { toggleAgreeAction } from "@/app/relay/actions";

export default function RelayAgreeForm({
  relayId,
  yAgreed,
  hAgreed,
  viewer,
}: {
  relayId: string;
  yAgreed: boolean;
  hAgreed: boolean;
  viewer: "Y" | "H" | null;
}) {
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
      <span className="meta">완결 동의</span>
      <div className="row gap-12">
        <AgreeToggle
          relayId={relayId}
          author="Y"
          agreed={yAgreed}
          editable={viewer === "Y"}
        />
        <AgreeToggle
          relayId={relayId}
          author="H"
          agreed={hAgreed}
          editable={viewer === "H"}
        />
        <span className="meta">둘 다 동의 시 완결</span>
      </div>
    </div>
  );
}

function AgreeToggle({
  relayId,
  author,
  agreed,
  editable,
}: {
  relayId: string;
  author: "Y" | "H";
  agreed: boolean;
  editable: boolean;
}) {
  if (!editable) {
    return (
      <span style={{ fontSize: 13 }}>
        {author} {agreed ? "✅" : "⬜"}
      </span>
    );
  }
  return (
    <form action={toggleAgreeAction} style={{ display: "inline" }}>
      <input type="hidden" name="relayId" value={relayId} />
      <input type="hidden" name="agreed" value={agreed ? "" : "on"} />
      <button
        type="submit"
        className="btn btn-ghost btn-sm"
        style={{ padding: "2px 8px", fontSize: 13 }}
        title={agreed ? "동의 해제" : "완결 동의"}
      >
        {author} {agreed ? "✅" : "⬜"}
      </button>
    </form>
  );
}
