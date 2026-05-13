import Link from "next/link";
import { redirect, notFound } from "next/navigation";
import { auth } from "@/auth";
import { getBookclub } from "@/lib/bookclubs";
import BookclubReviewClient from "@/components/BookclubReviewClient";
import BookclubAudioUploader from "@/components/BookclubAudioUploader";
import BookclubCoverUploader from "@/components/BookclubCoverUploader";
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

      <BookclubCoverUploader
        bookclubId={b.id}
        initialCoverUrl={b.coverUrl}
        bookTitle={b.bookTitle}
      />

      <BookclubAudioUploader
        bookclubId={b.id}
        initialAudioUrl={b.audioUrl}
      />

      <BookclubReviewClient
        bookclubId={b.id}
        initialTranscript={b.transcript}
      />
    </div>
  );
}
