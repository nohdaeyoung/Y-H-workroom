import Link from "next/link";
import { redirect, notFound } from "next/navigation";
import { auth } from "@/auth";
import { getBookclub } from "@/lib/bookclubs";
import BookclubReviewClient from "@/components/BookclubReviewClient";
import {
  publishAction,
  unpublishAction,
} from "@/app/bookclub/actions";

type Props = { params: { id: string } };

export const dynamic = "force-dynamic";

export default async function BookclubReviewPage({ params }: Props) {
  const session = await auth();
  const uid = session?.user?.id;
  if (uid !== "Y" && uid !== "H") redirect("/login?from=/bookclub");

  const b = await getBookclub(params.id);
  if (!b) notFound();

  return (
    <div className="container narrow fade-in" style={{ maxWidth: 720 }}>
      <Link href="/bookclub" className="btn btn-ghost btn-sm">
        ← 목록
      </Link>

      <div
        className="row-between"
        style={{ marginTop: 16, marginBottom: 24, flexWrap: "wrap", gap: 12 }}
      >
        <div>
          <div className="hand" style={{ fontSize: 20, color: "var(--ink-3)" }}>
            review
          </div>
          <h1 className="serif" style={{ fontSize: 26, marginTop: 4 }}>
            「{b.bookTitle}」 검수
          </h1>
          <div className="meta" style={{ marginTop: 4 }}>
            {b.bookAuthor} · {b.meetingDate}
          </div>
        </div>
        <div className="row gap-8">
          {b.status === "published" ? (
            <form action={unpublishAction}>
              <input type="hidden" name="id" value={b.id} />
              <button type="submit" className="btn">
                비공개로
              </button>
            </form>
          ) : (
            <form action={publishAction}>
              <input type="hidden" name="id" value={b.id} />
              <button type="submit" className="btn btn-primary">
                공개하기
              </button>
            </form>
          )}
        </div>
      </div>

      <div
        className="card-flat"
        style={{
          padding: 14,
          background: "var(--paper-ink)",
          border: "1px dashed var(--line-2)",
          marginBottom: 20,
        }}
      >
        <span className="meta">
          🎙 녹음 업로드 + Whisper 음성 인식은 다음 단계에서 붙입니다. 지금은 transcript를 직접 적거나 다듬을 수 있어요.
        </span>
      </div>

      <BookclubReviewClient
        bookclubId={b.id}
        initialTranscript={b.transcript}
      />
    </div>
  );
}
