"use client";

import { useFormState, useFormStatus } from "react-dom";
import {
  approveRequestAction,
  cancelRequestAction,
  rejectRequestAction,
  type RequestActionState,
} from "./actions";
import type {
  ActionRequest,
  ActionRequestKind,
  ActionRequestStatus,
  UserId,
} from "@/types/domain";

const initial: RequestActionState = { error: "" };

const KIND_LABEL: Record<ActionRequestKind, string> = {
  "delete-relay": "🗑 이어쓰기 삭제",
  "delete-keyword": "🗑 키워드 전체 삭제",
  "delete-photostory": "🗑 사진+글 삭제",
  "delete-bookclub": "🗑 독서모임 삭제",
  "set-relay-status": "🔁 이어쓰기 상태 전환",
  "set-bookclub-status": "🔁 독서모임 상태 전환",
  "set-photostory-status": "🔁 사진+글 상태 전환",
};

const STATUS_LABEL: Record<ActionRequestStatus, string> = {
  pending: "대기",
  approved: "✓ 승인됨",
  rejected: "✕ 거절됨",
  cancelled: "취소됨",
};

const STATUS_COLOR: Record<ActionRequestStatus, string> = {
  pending: "var(--ink-3)",
  approved: "var(--success)",
  rejected: "var(--danger)",
  cancelled: "var(--ink-4)",
};

const NAME: Record<UserId, string> = { Y: "Y", H: "H" };

function relativeTime(ts: number) {
  const diff = Date.now() - ts;
  const m = Math.floor(diff / 60000);
  if (m < 1) return "방금";
  if (m < 60) return `${m}분 전`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}시간 전`;
  const d = Math.floor(h / 24);
  return `${d}일 전`;
}

function payloadSummary(req: ActionRequest): string {
  if (!req.payload) return "";
  const status = req.payload.status;
  if (typeof status === "string") return `상태: ${status}`;
  return JSON.stringify(req.payload);
}

function RequestCard({
  req,
  mode,
}: {
  req: ActionRequest;
  mode: "incoming" | "outgoing" | "resolved";
}) {
  const isResolved = mode === "resolved";
  return (
    <div
      className="card-flat"
      style={{
        padding: 18,
        background: isResolved ? "var(--paper-ink)" : "var(--paper-2)",
        border: "1px solid var(--line)",
        borderRadius: "var(--r-lg)",
        opacity: isResolved ? 0.85 : 1,
      }}
    >
      <div className="row gap-8" style={{ flexWrap: "wrap", marginBottom: 8 }}>
        <span className="chip">{KIND_LABEL[req.kind]}</span>
        {isResolved && (
          <span
            className="chip"
            style={{
              background: "transparent",
              borderColor: STATUS_COLOR[req.status],
              color: STATUS_COLOR[req.status],
              fontSize: 11,
            }}
          >
            {STATUS_LABEL[req.status]}
          </span>
        )}
        <span
          className={`avatar-mini ${req.requester === "Y" ? "y" : "h"}`}
          style={{ width: 22, height: 22, fontSize: 11 }}
        >
          {req.requester}
        </span>
        <span className="meta" style={{ fontSize: 12 }}>
          {NAME[req.requester]} · {relativeTime(req.createdAt)}
          {isResolved && req.resolvedAt && (
            <> · 처리: {relativeTime(req.resolvedAt)}{req.resolvedBy ? ` (${req.resolvedBy})` : ""}</>
          )}
        </span>
      </div>
      <div
        className="serif"
        style={{
          fontSize: 16,
          fontWeight: 500,
          marginBottom: 4,
          textDecoration: req.status === "approved" && req.kind.startsWith("delete-") ? "line-through" : "none",
        }}
      >
        「{req.targetLabel || req.targetId}」
      </div>
      {payloadSummary(req) && (
        <div className="meta" style={{ fontSize: 12 }}>{payloadSummary(req)}</div>
      )}
      {!isResolved && (
        <div
          className="row gap-8"
          style={{ marginTop: 14, flexWrap: "wrap", justifyContent: "flex-end" }}
        >
          {mode === "incoming" ? (
            <>
              <RejectForm id={req.id} />
              <ApproveForm id={req.id} />
            </>
          ) : (
            <CancelForm id={req.id} />
          )}
        </div>
      )}
    </div>
  );
}

function ApproveForm({ id }: { id: string }) {
  const [state, action] = useFormState(approveRequestAction, initial);
  return (
    <form action={action}>
      <input type="hidden" name="id" value={id} />
      {state.error && (
        <div className="meta" style={{ color: "var(--danger)", marginRight: 8, fontSize: 12 }}>
          {state.error}
        </div>
      )}
      <ApproveBtn />
    </form>
  );
}

function ApproveBtn() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" className="btn btn-primary btn-sm" disabled={pending}>
      {pending ? "처리 중…" : "✓ 승인"}
    </button>
  );
}

function RejectForm({ id }: { id: string }) {
  const [, action] = useFormState(rejectRequestAction, initial);
  return (
    <form action={action}>
      <input type="hidden" name="id" value={id} />
      <RejectBtn />
    </form>
  );
}

function RejectBtn() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      className="btn btn-ghost btn-sm"
      disabled={pending}
      style={{ color: "var(--danger)" }}
    >
      {pending ? "…" : "✕ 거절"}
    </button>
  );
}

function CancelForm({ id }: { id: string }) {
  const [, action] = useFormState(cancelRequestAction, initial);
  return (
    <form action={action}>
      <input type="hidden" name="id" value={id} />
      <CancelBtn />
    </form>
  );
}

function CancelBtn() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" className="btn btn-ghost btn-sm" disabled={pending}>
      {pending ? "…" : "요청 취소"}
    </button>
  );
}

export default function RequestsList({
  viewer,
  incoming,
  outgoing,
  resolvedOutgoing = [],
  hideOutgoing,
  compact,
}: {
  viewer: UserId;
  incoming: ActionRequest[];
  outgoing: ActionRequest[];
  resolvedOutgoing?: ActionRequest[];
  hideOutgoing?: boolean;
  compact?: boolean;
}) {
  if (compact) {
    if (incoming.length === 0) return null;
    return (
      <div className="col gap-12">
        {incoming.map((r) => (
          <RequestCard key={r.id} req={r} mode="incoming" />
        ))}
      </div>
    );
  }
  return (
    <div className="col gap-32">
      <section>
        <h3 className="section-title" style={{ marginBottom: 12 }}>
          🔔 상대가 보낸 요청 ({incoming.length})
        </h3>
        {incoming.length === 0 ? (
          <div
            className="card-flat center"
            style={{ padding: 24, color: "var(--ink-3)" }}
          >
            <span className="hand" style={{ fontSize: 16 }}>없어요</span>
          </div>
        ) : (
          <div className="col gap-12">
            {incoming.map((r) => (
              <RequestCard key={r.id} req={r} mode="incoming" />
            ))}
          </div>
        )}
      </section>

      {!hideOutgoing && (
        <section>
          <h3 className="section-title" style={{ marginBottom: 12 }}>
            📨 내가 보낸 요청 ({outgoing.length})
          </h3>
          {outgoing.length === 0 ? (
            <div
              className="card-flat center"
              style={{ padding: 24, color: "var(--ink-3)" }}
            >
              <span className="hand" style={{ fontSize: 16 }}>없어요</span>
            </div>
          ) : (
            <div className="col gap-12">
              {outgoing.map((r) => (
                <RequestCard key={r.id} req={r} mode="outgoing" />
              ))}
            </div>
          )}
        </section>
      )}

      {!hideOutgoing && resolvedOutgoing.length > 0 && (
        <section>
          <h3 className="section-title" style={{ marginBottom: 12 }}>
            🗂 내 요청 처리 결과 ({resolvedOutgoing.length})
          </h3>
          <div className="col gap-12">
            {resolvedOutgoing.map((r) => (
              <RequestCard key={r.id} req={r} mode="resolved" />
            ))}
          </div>
        </section>
      )}

      <div className="meta" style={{ fontSize: 12 }}>
        viewer: {viewer}
      </div>
    </div>
  );
}
