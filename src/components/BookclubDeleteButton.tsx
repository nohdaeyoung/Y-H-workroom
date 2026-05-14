"use client";

import { useState } from "react";
import { deleteBookclubAction } from "@/app/bookclub/actions";

export default function BookclubDeleteButton({ id }: { id: string }) {
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  async function requestDelete() {
    if (!confirm("독서모임 전체 삭제를 요청할까요? 상대 승인 필요.")) return;
    setSaving(true);
    setMsg(null);
    const fd = new FormData();
    fd.append("id", id);
    const res = await deleteBookclubAction(fd);
    setSaving(false);
    setMsg(res.error || "✓ 삭제 요청을 보냈어요 — 상대 승인 대기");
  }

  return (
    <div
      className="card-flat"
      style={{
        marginTop: 24,
        padding: 16,
        background: "var(--paper-ink)",
        border: "1px dashed var(--line-2)",
      }}
    >
      <div className="row-between" style={{ flexWrap: "wrap", gap: 8 }}>
        <div>
          <div style={{ fontSize: 14, fontWeight: 500 }}>독서모임 전체 삭제</div>
          <div className="meta">소감/문장/transcript 모두 사라져요. 상대 동의 필요.</div>
        </div>
        <button
          type="button"
          className="btn"
          onClick={requestDelete}
          disabled={saving}
          style={{ color: "var(--danger)" }}
        >
          {saving ? "요청 보내는 중…" : "🗑 삭제 요청"}
        </button>
      </div>
      {msg && (
        <div
          className="meta"
          style={{
            marginTop: 10,
            color: msg.startsWith("✓") ? "var(--success)" : "var(--danger)",
            fontSize: 12,
          }}
        >
          {msg}
        </div>
      )}
    </div>
  );
}
