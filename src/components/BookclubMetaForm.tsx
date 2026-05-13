"use client";

import { useFormState, useFormStatus } from "react-dom";
import {
  updateMetaAction,
  type BookclubActionState,
} from "@/app/bookclub/actions";

const initial: BookclubActionState = { error: "" };

export default function BookclubMetaForm({
  id,
  bookTitle,
  bookAuthor,
  meetingDate,
  duration,
}: {
  id: string;
  bookTitle: string;
  bookAuthor: string;
  meetingDate: string;
  duration: string;
}) {
  const [state, action] = useFormState(updateMetaAction, initial);
  return (
    <form
      action={action}
      className="card-flat"
      style={{
        padding: 16,
        background: "var(--paper-2)",
        border: "1px solid var(--line)",
        marginBottom: 16,
      }}
    >
      <input type="hidden" name="id" value={id} />
      <h3 className="section-title" style={{ marginBottom: 12 }}>
        📚 책 정보
      </h3>
      <label className="label">책 제목</label>
      <input
        className="input"
        name="bookTitle"
        defaultValue={bookTitle}
        required
      />
      <label className="label" style={{ marginTop: 12 }}>
        저자
      </label>
      <input
        className="input"
        name="bookAuthor"
        defaultValue={bookAuthor}
        required
      />
      <div
        className="row gap-12"
        style={{ marginTop: 12, flexWrap: "wrap" }}
      >
        <div className="flex-1" style={{ minWidth: 160 }}>
          <label className="label">모임 날짜</label>
          <input
            className="input"
            name="meetingDate"
            defaultValue={meetingDate}
            required
          />
        </div>
        <div className="flex-1" style={{ minWidth: 160 }}>
          <label className="label">길이</label>
          <input
            className="input"
            name="duration"
            defaultValue={duration}
            placeholder="1시간 23분"
          />
        </div>
      </div>
      <div className="row-between" style={{ marginTop: 14, flexWrap: "wrap", gap: 8 }}>
        {state.error && (
          <span className="meta" style={{ color: "var(--danger)" }}>
            {state.error}
          </span>
        )}
        {state.ok && (
          <span className="meta" style={{ color: "var(--success)" }}>
            ✓ 저장됨
          </span>
        )}
        <SaveBtn />
      </div>
    </form>
  );
}

function SaveBtn() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      className="btn btn-primary btn-sm"
      disabled={pending}
      style={{ marginLeft: "auto" }}
    >
      {pending ? "저장 중…" : "책 정보 저장"}
    </button>
  );
}
