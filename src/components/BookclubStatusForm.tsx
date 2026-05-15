"use client";

import { useState } from "react";
import { setStatusAction } from "@/app/bookclub/actions";
import { BOOKCLUB_STATUS_LABEL, type BookclubStatus } from "@/types/domain";

const ORDER: BookclubStatus[] = ["reading", "met", "finished"];

export default function BookclubStatusForm({
  id,
  status,
}: {
  id: string;
  status: BookclubStatus;
}) {
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ text: string; ok: boolean } | null>(null);

  async function onChange(next: BookclubStatus) {
    if (next === status || busy) return;
    setBusy(true);
    setMsg(null);
    const fd = new FormData();
    fd.set("id", id);
    fd.set("status", next);
    const res = await setStatusAction(fd);
    setBusy(false);
    if (res.error) {
      setMsg({ text: res.error, ok: false });
      return;
    }
    setMsg({
      text: `✓ "${BOOKCLUB_STATUS_LABEL[next]}"로 전환 요청 보냈어요 — 상대 승인 필요`,
      ok: true,
    });
  }

  return (
    <div className="col gap-4">
      <div className="row gap-4" style={{ flexWrap: "wrap" }}>
        {ORDER.map((s) => {
          const active = s === status;
          return (
            <button
              key={s}
              type="button"
              onClick={() => onChange(s)}
              disabled={busy}
              className={active ? "btn btn-primary btn-sm" : "btn btn-sm"}
              style={{
                opacity: busy && !active ? 0.5 : 1,
                fontSize: 13,
              }}
            >
              {BOOKCLUB_STATUS_LABEL[s]}
            </button>
          );
        })}
      </div>
      {msg && (
        <div
          className="meta"
          style={{
            fontSize: 11,
            color: msg.ok ? "var(--success)" : "var(--danger)",
          }}
        >
          {msg.text}
        </div>
      )}
    </div>
  );
}
