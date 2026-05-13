import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import BookclubNewForm from "./BookclubNewForm";

export const metadata = { title: "새 독서모임 — 어드민" };

export default async function BookclubNewPage() {
  const session = await auth();
  const id = session?.user?.id;
  if (id !== "Y" && id !== "H") redirect("/login?from=/bookclub/new");

  return (
    <div className="container narrow fade-in" style={{ maxWidth: 600 }}>
      <Link href="/bookclub" className="btn btn-ghost btn-sm">
        ← 목록
      </Link>
      <div style={{ marginTop: 16, marginBottom: 28 }}>
        <div className="hand" style={{ fontSize: 20, color: "var(--ink-3)" }}>
          new book club
        </div>
        <h1 className="page-title" style={{ marginTop: 4 }}>
          새 독서모임
        </h1>
        <div className="serif" style={{ color: "var(--ink-2)", marginTop: 6 }}>
          책 정보와 모임 날짜만 적으면 검수 단계로 넘어가요. 녹음/음성 변환은 다음에 붙여드릴게요.
        </div>
      </div>

      <BookclubNewForm />
    </div>
  );
}
