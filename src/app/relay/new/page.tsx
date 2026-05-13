import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import RelayNewForm from "./RelayNewForm";

export const metadata = { title: "이어쓰기 시작 — 영희네 작업실" };

export default async function RelayNewPage() {
  const session = await auth();
  const id = session?.user?.id;
  if (id !== "Y" && id !== "H") {
    redirect("/login?from=/relay/new");
  }

  return (
    <div className="container narrow fade-in" style={{ maxWidth: 600 }}>
      <Link href="/relay" className="btn btn-ghost btn-sm">
        ← 목록
      </Link>
      <h1 className="page-title" style={{ marginTop: 16, marginBottom: 8 }}>
        이어쓰기 시작
      </h1>
      <div className="serif" style={{ color: "var(--ink-2)", marginBottom: 28 }}>
        제목과 첫 문장을 적어주세요.
      </div>

      <RelayNewForm
        author={id}
        displayName={id === "Y" ? "대영" : "희서"}
      />
    </div>
  );
}
