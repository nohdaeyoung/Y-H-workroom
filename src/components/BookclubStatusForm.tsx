"use client";

import { useState, useTransition } from "react";
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
  const [pending, startTransition] = useTransition();
  const [requested, setRequested] = useState<BookclubStatus | null>(null);

  function onChange(next: BookclubStatus) {
    if (next === status || pending) return;
    const fd = new FormData();
    fd.set("id", id);
    fd.set("status", next);
    startTransition(() => {
      setStatusAction(fd);
      setRequested(next);
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
              disabled={pending}
              className={active ? "btn btn-primary btn-sm" : "btn btn-sm"}
              style={{
                opacity: pending && !active ? 0.5 : 1,
                fontSize: 13,
              }}
            >
              {BOOKCLUB_STATUS_LABEL[s]}
            </button>
          );
        })}
      </div>
      {requested && (
        <div
          className="meta"
          style={{ fontSize: 11, color: "var(--success)" }}
        >
          ✓ &quot;{BOOKCLUB_STATUS_LABEL[requested]}&quot;로 전환 요청 보냈어요 — 상대 승인 필요
        </div>
      )}
    </div>
  );
}
