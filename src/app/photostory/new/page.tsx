import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import PhotostoryNewForm from "./PhotostoryNewForm";

export const metadata = { title: "사진 올리기 — 영희네 작업실" };

export default async function PhotostoryNewPage() {
  const session = await auth();
  const id = session?.user?.id;
  if (id !== "Y" && id !== "H") redirect("/login?from=/photostory/new");
  const name = id === "Y" ? "대영" : "희서";
  const partner = id === "Y" ? "H" : "Y";
  const partnerName = partner === "Y" ? "대영" : "희서";

  return (
    <div className="container narrow fade-in" style={{ maxWidth: 720 }}>
      <Link href="/photostory" className="btn btn-ghost btn-sm">
        ← 갤러리
      </Link>
      <div style={{ marginTop: 16, marginBottom: 28 }}>
        <div className="hand" style={{ fontSize: 20, color: "var(--ink-3)" }}>
          new photo
        </div>
        <h1 className="page-title">사진 올리기</h1>
        <div className="serif" style={{ color: "var(--ink-2)", marginTop: 6 }}>
          {name}가 사진을 올리면, {partnerName}이(가) 그 사진에 어울리는 글을 적을 차례예요.
        </div>
      </div>

      <PhotostoryNewForm author={id} />
    </div>
  );
}
