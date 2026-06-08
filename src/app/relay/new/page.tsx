import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import RelayNewForm from "./RelayNewForm";

export const metadata = { title: "새 이어쓰기 — 영이네 작업실" };

export default async function RelayNewPage() {
  const session = await auth();
  const id = session?.user?.id;
  if (id !== "Y" && id !== "H") {
    redirect("/login?from=/relay/new");
  }
  const name = id === "Y" ? "대영" : "희서";

  return (
    <div className="container narrow fade-in" style={{ maxWidth: 680 }}>
      <Link
        href="/relay"
        className="btn btn-ghost btn-sm"
        style={{ marginBottom: 16 }}
      >
        ← 이어쓰기 목록
      </Link>

      <div style={{ textAlign: "center", padding: "16px 0 28px" }}>
        <div className="hand" style={{ fontSize: 22, color: "var(--ink-3)" }}>
          new relay
        </div>
        <h1 className="page-title">새 이어쓰기 시작</h1>
        <div className="serif" style={{ color: "var(--ink-2)", marginTop: 6 }}>
          제목과 첫 문장만 있으면 시작할 수 있어요.
        </div>
      </div>

      <RelayNewForm author={id} displayName={name} />
    </div>
  );
}
