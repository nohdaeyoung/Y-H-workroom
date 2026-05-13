"use client";

import Link from "next/link";
import { useFormState, useFormStatus } from "react-dom";
import {
  createDraftAction,
  type BookclubActionState,
} from "@/app/bookclub/actions";

const initial: BookclubActionState = { error: "" };

export default function BookclubNewForm() {
  const [state, action] = useFormState(createDraftAction, initial);
  return (
    <form action={action} className="card">
      <label className="label">책 제목</label>
      <input
        className="input"
        name="bookTitle"
        placeholder="예: 나는 나로 살기로 했다"
        required
      />

      <label className="label" style={{ marginTop: 14 }}>
        저자
      </label>
      <input
        className="input"
        name="bookAuthor"
        placeholder="예: 김수현"
        required
      />

      <div className="row gap-12" style={{ marginTop: 14, flexWrap: "wrap" }}>
        <div className="flex-1" style={{ minWidth: 160 }}>
          <label className="label">모임 날짜</label>
          <input
            className="input"
            name="meetingDate"
            placeholder="2026.05.13"
            required
          />
        </div>
        <div className="flex-1" style={{ minWidth: 160 }}>
          <label className="label">길이 (선택)</label>
          <input
            className="input"
            name="duration"
            placeholder="1시간 23분"
          />
        </div>
      </div>

      {state.error && (
        <div
          className="meta"
          style={{ color: "var(--danger)", marginTop: 12, fontSize: 13 }}
        >
          {state.error}
        </div>
      )}

      <div className="row-between" style={{ marginTop: 20 }}>
        <Link href="/bookclub" className="btn btn-ghost">
          취소
        </Link>
        <SubmitBtn />
      </div>
    </form>
  );
}

function SubmitBtn() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" className="btn btn-primary" disabled={pending}>
      {pending ? "만드는 중…" : "검수로 이동"}
    </button>
  );
}
