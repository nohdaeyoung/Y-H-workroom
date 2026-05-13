import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import AdminAboutEditor from "@/components/AdminAboutEditor";

export const metadata = { title: "소개 관리 — 어드민" };

const ABOUT_SECTIONS = [
  { key: "header", title: "헤더" },
  { key: "greeting", title: "인삿말" },
  { key: "y_profile", title: "Y 프로필" },
  { key: "h_profile", title: "H 프로필" },
  { key: "story", title: "이야기" },
  { key: "contact", title: "연락처" },
];

export default async function AdminAboutPage() {
  const session = await auth();
  const id = session?.user?.id;
  if (id !== "Y" && id !== "H") redirect("/login?from=/admin/about");

  return (
    <div className="container fade-in" style={{ maxWidth: 1080 }}>
      <Link
        href="/admin"
        className="btn btn-ghost btn-sm"
        style={{ marginBottom: 16 }}
      >
        ← 어드민 홈
      </Link>

      <div
        className="row-between"
        style={{ marginBottom: 20, alignItems: "flex-end", flexWrap: "wrap", gap: 12 }}
      >
        <div>
          <div className="hand" style={{ fontSize: 20, color: "var(--ink-3)" }}>
            about — admin
          </div>
          <h1 className="page-title">소개 페이지 관리</h1>
        </div>
        <div className="row gap-8">
          <span className="meta">마지막 편집:</span>
          <span className="avatar-mini h">H</span>
          <span className="meta">2026.05.10 · 23:14</span>
        </div>
      </div>

      <AdminAboutEditor sections={ABOUT_SECTIONS} />
    </div>
  );
}
