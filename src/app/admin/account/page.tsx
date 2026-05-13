import Link from "next/link";
import { redirect } from "next/navigation";
import { auth, isGoogleEnabled } from "@/auth";
import { logoutAction } from "@/app/login/actions";
import { getUserProfile } from "@/lib/user-profile";
import AdminAccountClient from "@/components/AdminAccountClient";

export const dynamic = "force-dynamic";

export const metadata = { title: "계정 설정 — 어드민" };

export default async function AdminAccountPage() {
  const session = await auth();
  const id = session?.user?.id;
  if (id !== "Y" && id !== "H") redirect("/login?from=/admin/account");

  const name = id === "Y" ? "대영" : "희서";
  const cls = id === "Y" ? "y" : "h";
  const profile = await getUserProfile(id);

  return (
    <div className="container narrow fade-in" style={{ maxWidth: 680 }}>
      <Link
        href="/admin"
        className="btn btn-ghost btn-sm"
        style={{ marginBottom: 16 }}
      >
        ← 어드민 홈
      </Link>

      <div style={{ marginBottom: 24 }}>
        <div className="hand" style={{ fontSize: 20, color: "var(--ink-3)" }}>
          account
        </div>
        <h1 className="page-title">계정 설정</h1>
      </div>

      <AdminAccountClient
        userId={id}
        userName={profile.displayName || name}
        userDesc={profile.desc}
        userCls={cls}
        googleEnabled={isGoogleEnabled()}
        userEmail={session?.user?.email ?? ""}
      />

      {/* 로그아웃 */}
      <div className="card">
        <div className="row-between" style={{ flexWrap: "wrap", gap: 12 }}>
          <div>
            <h3 className="section-title">로그아웃</h3>
            <div className="meta" style={{ marginTop: 4 }}>
              이 기기에서 작업실 세션을 종료합니다.
            </div>
          </div>
          <form action={logoutAction}>
            <button type="submit" className="btn">
              로그아웃
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
