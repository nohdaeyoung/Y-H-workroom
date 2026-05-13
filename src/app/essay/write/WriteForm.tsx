"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { RichEditor } from "@/components/RichEditor";

type Props = {
  authorId: "Y" | "H";
  displayName: string;
};

export default function WriteForm({ authorId, displayName }: Props) {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(status: "draft" | "published") {
    if (!title.trim()) {
      setError("제목을 적어주세요");
      return;
    }
    setSubmitting(true);
    setError(null);

    const res = await fetch("/api/essays", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: title.trim(), content, status }),
    });

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error || "저장 중 문제가 생겼어요");
      setSubmitting(false);
      return;
    }

    const data = await res.json();
    router.push(`/essay/${data.essay.id}`);
  }

  const colorClass = authorId === "Y" ? "text-y" : "text-h";

  return (
    <div className="max-w-2xl mx-auto px-5 pt-10 pb-24">
      <div className={`text-xs tracking-[0.2em] ${colorClass} mb-3 font-medium`}>
        {authorId} · {displayName}
      </div>

      <input
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="제목"
        className="w-full font-serif text-3xl md:text-4xl font-medium bg-transparent border-b border-line focus:outline-none focus:border-ink/40 pb-3 mb-6"
      />

      <RichEditor
        value={content}
        onChange={setContent}
        placeholder="오늘의 이야기를 들려주세요…"
        variant="full"
        minHeight={360}
      />

      {error && (
        <p className="text-sm text-red-700 bg-red-50 border border-red-200 rounded px-3 py-2 mt-4">
          {error}
        </p>
      )}

      <div className="flex justify-between items-center mt-8">
        <button
          type="button"
          onClick={() => submit("draft")}
          disabled={submitting}
          className="btn disabled:opacity-50"
        >
          임시저장
        </button>
        <button
          type="button"
          onClick={() => submit("published")}
          disabled={submitting}
          className={`btn ${authorId === "Y" ? "btn-y" : "btn-h"} disabled:opacity-50`}
        >
          {submitting ? "올리는 중…" : "올리기"}
        </button>
      </div>
    </div>
  );
}
