"use client";

import { suggestKeywordAction } from "@/app/keyword/actions";

type Props = {
  canRequest: boolean;
  variant?: "primary" | "ghost";
  label?: string;
};

const DISABLED_MESSAGE =
  "이전 키워드에 글을 써야 새 키워드를 받을 수 있어요.";

export default function NewKeywordButton({
  canRequest,
  variant = "ghost",
  label = "🎲 새 키워드 받기",
}: Props) {
  const cls =
    variant === "primary" ? "btn btn-primary" : "btn btn-ghost btn-sm";

  if (canRequest) {
    return (
      <form action={suggestKeywordAction}>
        <button type="submit" className={cls}>
          {label}
        </button>
      </form>
    );
  }

  return (
    <button
      type="button"
      className={cls}
      onClick={() => window.alert(DISABLED_MESSAGE)}
      style={{ opacity: 0.55, cursor: "not-allowed" }}
      aria-disabled
    >
      {label}
    </button>
  );
}
