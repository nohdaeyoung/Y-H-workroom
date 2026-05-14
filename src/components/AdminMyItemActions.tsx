"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  deleteItemAction,
  toggleVisibilityAction,
} from "@/app/admin/my/actions";

type Section = "essay" | "relay" | "keyword" | "bookclub" | "photo";

type Props = {
  section: Section;
  id: string;
  editHref?: string;
  canToggle?: boolean;
};

const REQUEST_REQUIRED: Record<Section, boolean> = {
  essay: false,
  relay: true,
  keyword: true,
  bookclub: true,
  photo: true,
};

export default function AdminMyItemActions({
  section,
  id,
  editHref,
  canToggle,
}: Props) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  async function handleDelete() {
    const needsConsent = REQUEST_REQUIRED[section];
    const confirmText = needsConsent
      ? "전체 삭제 요청을 보낼까요? 상대 승인이 있어야 실제로 삭제돼요."
      : "정말 삭제할까요? 되돌릴 수 없어요.";
    if (!confirm(confirmText)) return;
    setBusy(true);
    setMsg(null);
    const fd = new FormData();
    fd.append("section", section);
    fd.append("id", id);
    const res = await deleteItemAction(undefined, fd);
    setBusy(false);
    if (res.error) {
      setMsg(res.error);
      return;
    }
    setMsg(needsConsent ? "✓ 삭제 요청 보냄" : "✓ 삭제됨");
    router.refresh();
  }

  async function handleToggle() {
    const needsConsent = section === "bookclub";
    if (needsConsent && !confirm("상태 전환 요청을 보낼까요? 상대 승인 필요.")) return;
    setBusy(true);
    setMsg(null);
    const fd = new FormData();
    fd.append("section", section);
    fd.append("id", id);
    const res = await toggleVisibilityAction(undefined, fd);
    setBusy(false);
    if (res.error) {
      setMsg(res.error);
      return;
    }
    setMsg(needsConsent ? "✓ 전환 요청 보냄" : "✓ 전환됨");
    router.refresh();
  }

  return (
    <div className="col gap-4">
      <div className="row gap-4">
        {editHref ? (
          <Link href={editHref} className="btn btn-ghost btn-sm">
            수정
          </Link>
        ) : (
          <button type="button" className="btn btn-ghost btn-sm" disabled>
            수정
          </button>
        )}
        {canToggle && (
          <button
            type="button"
            className="btn btn-ghost btn-sm"
            onClick={handleToggle}
            disabled={busy}
          >
            공개↔비공개
          </button>
        )}
        <button
          type="button"
          className="btn btn-ghost btn-sm"
          onClick={handleDelete}
          disabled={busy}
          style={{ color: "var(--danger)" }}
        >
          {REQUEST_REQUIRED[section] ? "삭제 요청" : "삭제"}
        </button>
      </div>
      {msg && (
        <div
          className="meta"
          style={{
            color: msg.startsWith("✓") ? "var(--success)" : "var(--danger)",
            fontSize: 11,
          }}
        >
          {msg}
        </div>
      )}
    </div>
  );
}
