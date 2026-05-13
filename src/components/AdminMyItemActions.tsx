"use client";

import Link from "next/link";
import {
  deleteItemAction,
  toggleVisibilityAction,
} from "@/app/admin/my/actions";

type Props = {
  section: "essay" | "relay" | "keyword" | "bookclub" | "photo";
  id: string;
  editHref?: string; // 있으면 '수정' 버튼 활성
  canToggle?: boolean; // 있으면 '공개↔비공개' 버튼 활성
};

export default function AdminMyItemActions({
  section,
  id,
  editHref,
  canToggle,
}: Props) {
  return (
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
        <form action={toggleVisibilityAction} style={{ display: "inline" }}>
          <input type="hidden" name="section" value={section} />
          <input type="hidden" name="id" value={id} />
          <button type="submit" className="btn btn-ghost btn-sm">
            공개↔비공개
          </button>
        </form>
      )}
      <form
        action={deleteItemAction}
        onSubmit={(e) => {
          if (!confirm("정말 삭제할까요? 되돌릴 수 없어요.")) e.preventDefault();
        }}
        style={{ display: "inline" }}
      >
        <input type="hidden" name="section" value={section} />
        <input type="hidden" name="id" value={id} />
        <button
          type="submit"
          className="btn btn-ghost btn-sm"
          style={{ color: "var(--danger)" }}
        >
          삭제
        </button>
      </form>
    </div>
  );
}
