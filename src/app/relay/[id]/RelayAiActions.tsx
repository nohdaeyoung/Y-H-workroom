"use client";

import { useFormState, useFormStatus } from "react-dom";
import {
  regenerateLastAiAction,
  requestAiOnlyAction,
  type RelayActionState,
} from "@/app/relay/actions";

const initial: RelayActionState = { error: "" };

export function RegenerateAiButton({ relayId }: { relayId: string }) {
  const [state, action] = useFormState(regenerateLastAiAction, initial);

  return (
    <form action={action} style={{ display: "inline" }}>
      <input type="hidden" name="relayId" value={relayId} />
      <RegenBtn />
      {state.error && (
        <span
          className="meta"
          style={{
            marginLeft: 8,
            color: "var(--danger)",
            fontSize: 12,
          }}
        >
          {state.error}
        </span>
      )}
    </form>
  );
}

function RegenBtn() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      className="btn btn-ghost btn-sm"
      style={{ fontSize: 12, padding: "4px 10px" }}
      disabled={pending}
      title="이 AI 문장을 마음에 들지 않으면 다시 받기"
    >
      {pending ? "다시 받는 중…" : "↻ AI 다시"}
    </button>
  );
}

export function RequestAiButton({ relayId }: { relayId: string }) {
  const [state, action] = useFormState(requestAiOnlyAction, initial);

  return (
    <form action={action}>
      <input type="hidden" name="relayId" value={relayId} />
      <RequestBtn />
      {state.error && (
        <div
          className="meta"
          style={{
            marginTop: 6,
            color: "var(--danger)",
            fontSize: 12,
          }}
        >
          {state.error}
        </div>
      )}
    </form>
  );
}

function RequestBtn() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      className="btn"
      style={{ width: "100%" }}
      disabled={pending}
    >
      {pending ? "AI에게 받는 중…" : "✨ AI에게 다음 문장 받기"}
    </button>
  );
}
