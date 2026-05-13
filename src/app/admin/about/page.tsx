import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { getAboutContent, SECTION_TITLES } from "@/lib/about";
import AdminAboutEditor from "@/components/AdminAboutEditor";

export const metadata = { title: "소개 관리 — 어드민" };
export const dynamic = "force-dynamic";

const SECTION_KEYS = [
  "header",
  "greeting",
  "y_profile",
  "h_profile",
  "story",
  "contact",
];

function formatDateTime(ts: number) {
  if (!ts) return null;
  const d = new Date(ts);
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, "0")}.${String(d.getDate()).padStart(2, "0")} · ${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}

export default async function AdminAboutPage() {
  const session = await auth();
  const id = session?.user?.id;
  if (id !== "Y" && id !== "H") redirect("/login?from=/admin/about");

  const content = await getAboutContent();
  const lastEdited = formatDateTime(content.lastEditedAt);

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
        style={{
          marginBottom: 20,
          alignItems: "flex-end",
          flexWrap: "wrap",
          gap: 12,
        }}
      >
        <div>
          <div className="hand" style={{ fontSize: 20, color: "var(--ink-3)" }}>
            about — admin
          </div>
          <h1 className="page-title">소개 페이지 관리</h1>
        </div>
        {content.lastEditedBy && lastEdited && (
          <div className="row gap-8">
            <span className="meta">마지막 편집:</span>
            <span className={`avatar-mini ${content.lastEditedBy.toLowerCase()}`}>
              {content.lastEditedBy}
            </span>
            <span className="meta">{lastEdited}</span>
          </div>
        )}
      </div>

      <AdminAboutEditor
        sections={content.sections}
        sectionTitles={SECTION_TITLES}
        defaultKeys={SECTION_KEYS}
      />
    </div>
  );
}
