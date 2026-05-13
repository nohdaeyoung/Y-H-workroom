"use client";

import { useEffect, useState } from "react";
import { useFormState, useFormStatus } from "react-dom";
import {
  addQuoteAction,
  deleteQuoteAction,
  updateQuoteAction,
  type BookclubActionState,
} from "@/app/bookclub/actions";
import type { BookclubQuote } from "@/types/domain";

const initial: BookclubActionState = { error: "" };

function formatDate(ts: number) {
  const d = new Date(ts);
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, "0")}.${String(d.getDate()).padStart(2, "0")}`;
}

export default function BookclubQuotes({
  bookclubId,
  quotes,
  viewer,
}: {
  bookclubId: string;
  quotes: BookclubQuote[];
  viewer: "Y" | "H" | null;
}) {
  const [filter, setFilter] = useState<"all" | "Y" | "H">("all");

  const visible = quotes.filter((q) =>
    filter === "all" ? true : q.author === filter
  );

  return (
    <>
      {viewer && <AddQuoteForm bookclubId={bookclubId} />}

      <div
        className="row-between"
        style={{ marginBottom: 14, marginTop: viewer ? 20 : 0, flexWrap: "wrap", gap: 8 }}
      >
        <h3 className="section-title">📖 인용 문장</h3>
        <div
          className="row gap-4"
          style={{
            padding: 4,
            background: "var(--paper-ink)",
            borderRadius: "var(--r-md)",
          }}
        >
          {(["all", "Y", "H"] as const).map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => setFilter(f)}
              className="btn btn-sm"
              style={{
                background: filter === f ? "var(--paper-2)" : "transparent",
                border: "none",
                color: filter === f ? "var(--ink)" : "var(--ink-3)",
                fontWeight: filter === f ? 500 : 400,
                boxShadow: filter === f ? "var(--shadow-sm)" : "none",
                padding: "4px 10px",
              }}
            >
              {f === "all" ? "전체" : f}
            </button>
          ))}
        </div>
      </div>

      <div className="col gap-12">
        {visible.length === 0 ? (
          <div
            className="card-flat center"
            style={{ padding: 36, color: "var(--ink-3)" }}
          >
            <span className="hand" style={{ fontSize: 18 }}>
              아직 모은 문장이 없어요
            </span>
          </div>
        ) : (
          visible
            .slice()
            .sort((a, b) => b.createdAt - a.createdAt)
            .map((q) => (
              <QuoteItem
                key={q.id}
                bookclubId={bookclubId}
                quote={q}
                editable={viewer === q.author}
              />
            ))
        )}
      </div>
    </>
  );
}

function AddQuoteForm({ bookclubId }: { bookclubId: string }) {
  const [state, action] = useFormState(addQuoteAction, initial);
  const [text, setText] = useState("");
  const [source, setSource] = useState("");

  useEffect(() => {
    if (state.ok) {
      setText("");
      setSource("");
    }
  }, [state.ok]);

  return (
    <form
      action={action}
      className="card-flat"
      style={{
        padding: 16,
        background: "var(--paper-2)",
        border: "1px solid var(--line)",
      }}
    >
      <input type="hidden" name="id" value={bookclubId} />
      <label className="label">문장</label>
      <textarea
        className="textarea"
        name="text"
        rows={3}
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="인상 깊었던 문장을 적어주세요"
        required
        maxLength={2000}
      />
      <label className="label" style={{ marginTop: 12 }}>
        출처 (선택)
      </label>
      <input
        className="input"
        name="source"
        value={source}
        onChange={(e) => setSource(e.target.value)}
        placeholder="예: 3장 / p. 47 / 작가의 말"
        maxLength={100}
      />
      <div className="row-between" style={{ marginTop: 12, flexWrap: "wrap", gap: 8 }}>
        {state.error && (
          <span className="meta" style={{ color: "var(--danger)" }}>
            {state.error}
          </span>
        )}
        {state.ok && (
          <span className="meta" style={{ color: "var(--success)" }}>
            ✓ 추가됨
          </span>
        )}
        <AddBtn disabled={!text.trim()} />
      </div>
    </form>
  );
}

function AddBtn({ disabled }: { disabled: boolean }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      className="btn btn-primary btn-sm"
      disabled={pending || disabled}
      style={{ marginLeft: "auto" }}
    >
      {pending ? "추가 중…" : "＋ 문장 추가"}
    </button>
  );
}

function QuoteItem({
  bookclubId,
  quote,
  editable,
}: {
  bookclubId: string;
  quote: BookclubQuote;
  editable: boolean;
}) {
  const [editing, setEditing] = useState(false);
  const cls = quote.author === "Y" ? "y" : "h";
  const bg =
    quote.author === "Y"
      ? "oklch(0.965 0.03 82)"
      : "oklch(0.96 0.018 250)";
  const border =
    quote.author === "Y" ? "var(--y-line)" : "var(--h-line)";

  return (
    <div
      className="card-flat"
      style={{
        padding: "16px 20px",
        background: bg,
        border: "1px solid",
        borderColor: border,
        borderRadius: "var(--r-md)",
      }}
    >
      {editing ? (
        <QuoteEditForm
          bookclubId={bookclubId}
          quote={quote}
          onDone={() => setEditing(false)}
        />
      ) : (
        <>
          <div className="row gap-8" style={{ marginBottom: 10 }}>
            <span className={`avatar-mini ${cls}`}>{quote.author}</span>
            <span className="meta">{formatDate(quote.createdAt)}</span>
            {editable && (
              <div className="row gap-4" style={{ marginLeft: "auto" }}>
                <button
                  type="button"
                  className="btn btn-ghost btn-sm"
                  onClick={() => setEditing(true)}
                  style={{ padding: "2px 8px" }}
                >
                  ✎
                </button>
                <form
                  action={deleteQuoteAction}
                  onSubmit={(e) => {
                    if (!confirm("이 문장을 삭제할까요?")) e.preventDefault();
                  }}
                  style={{ display: "inline" }}
                >
                  <input type="hidden" name="id" value={bookclubId} />
                  <input type="hidden" name="quoteId" value={quote.id} />
                  <button
                    type="submit"
                    className="btn btn-ghost btn-sm"
                    style={{ padding: "2px 8px", color: "var(--danger)" }}
                  >
                    ✕
                  </button>
                </form>
              </div>
            )}
          </div>
          <blockquote
            className="serif"
            style={{
              fontSize: 16,
              lineHeight: 1.85,
              color: "var(--ink)",
              whiteSpace: "pre-wrap",
            }}
          >
            “{quote.text}”
          </blockquote>
          {quote.source && (
            <div
              className="hand"
              style={{ marginTop: 8, color: "var(--ink-4)", fontSize: 15, textAlign: "right" }}
            >
              — {quote.source}
            </div>
          )}
        </>
      )}
    </div>
  );
}

function QuoteEditForm({
  bookclubId,
  quote,
  onDone,
}: {
  bookclubId: string;
  quote: BookclubQuote;
  onDone: () => void;
}) {
  const [state, action] = useFormState(updateQuoteAction, initial);
  const [text, setText] = useState(quote.text);
  const [source, setSource] = useState(quote.source);

  useEffect(() => {
    if (state.ok) onDone();
  }, [state.ok, onDone]);

  return (
    <form action={action}>
      <input type="hidden" name="id" value={bookclubId} />
      <input type="hidden" name="quoteId" value={quote.id} />
      <textarea
        className="textarea"
        name="text"
        rows={3}
        value={text}
        onChange={(e) => setText(e.target.value)}
        maxLength={2000}
        required
      />
      <input
        className="input"
        name="source"
        value={source}
        onChange={(e) => setSource(e.target.value)}
        placeholder="출처 (선택)"
        style={{ marginTop: 8 }}
        maxLength={100}
      />
      {state.error && (
        <div className="meta" style={{ color: "var(--danger)", marginTop: 6, fontSize: 12 }}>
          {state.error}
        </div>
      )}
      <div className="row" style={{ marginTop: 10, justifyContent: "flex-end", gap: 8 }}>
        <button type="button" className="btn btn-ghost btn-sm" onClick={onDone}>
          취소
        </button>
        <UpdateBtn />
      </div>
    </form>
  );
}

function UpdateBtn() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" className="btn btn-primary btn-sm" disabled={pending}>
      {pending ? "저장 중…" : "저장"}
    </button>
  );
}
