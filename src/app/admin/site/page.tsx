import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { getSiteSettings } from "@/lib/site-settings";
import SiteSettingsForm from "./SiteSettingsForm";

export const metadata = { title: "사이트 설정 — 어드민" };
export const dynamic = "force-dynamic";

function formatDateTime(ts: number) {
  if (!ts) return null;
  const d = new Date(ts);
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, "0")}.${String(d.getDate()).padStart(2, "0")} · ${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}

export default async function AdminSitePage() {
  const session = await auth();
  const id = session?.user?.id;
  if (id !== "Y") {
    if (id === "H") redirect("/admin");
    redirect("/login?from=/admin/site");
  }

  const settings = await getSiteSettings();
  const lastEdited = formatDateTime(settings.lastEditedAt);

  return (
    <div className="container fade-in" style={{ maxWidth: 880 }}>
      <Link href="/admin" className="btn btn-ghost btn-sm" style={{ marginBottom: 16 }}>
        ← 어드민 홈
      </Link>

      <div
        className="row-between"
        style={{ marginBottom: 24, alignItems: "flex-end", flexWrap: "wrap", gap: 12 }}
      >
        <div>
          <div className="hand" style={{ fontSize: 20, color: "var(--ink-3)" }}>
            site — admin
          </div>
          <h1 className="page-title">사이트 설정</h1>
          <div className="serif" style={{ color: "var(--ink-2)", marginTop: 4 }}>
            메타태그, 분석 스크립트, 픽셀 등 사이트 전역 설정. Y 전용.
          </div>
        </div>
        {lastEdited && (
          <span className="meta">마지막 편집: {lastEdited}</span>
        )}
      </div>

      <SiteSettingsForm initial={settings} />
    </div>
  );
}
