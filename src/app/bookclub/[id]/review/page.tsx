import Link from "next/link";
import { redirect, notFound } from "next/navigation";
import { auth } from "@/auth";
import { getBookclub } from "@/lib/bookclubs";
import BookclubReviewClient from "@/components/BookclubReviewClient";
import BookclubAudioUploader from "@/components/BookclubAudioUploader";
import BookclubMetaForm from "@/components/BookclubMetaForm";
import BookclubStatusForm from "@/components/BookclubStatusForm";

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
        <BookclubStatusForm id={b.id} status={b.status} />
      </div>

      <BookclubMetaForm
        id={b.id}
        bookTitle={b.bookTitle}
        bookAuthor={b.bookAuthor}
        meetingDate={b.meetingDate}
        duration={b.duration}
        initialCoverUrl={b.coverUrl}
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
