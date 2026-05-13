import Link from "next/link";
import { redirect } from "next/navigation";
import { auth, isGoogleEnabled } from "@/auth";
import { googleSignInAction } from "./actions";
import LoginForm from "./LoginForm";

export const metadata = { title: "로그인 — 영희네 작업실" };

type Props = {
  searchParams?: { from?: string };
};

export default async function LoginPage({ searchParams }: Props) {
  const session = await auth();
  if (session?.user?.id) {
    redirect(searchParams?.from || "/");
  }

  return (
    <div
      className="container narrow fade-in"
      style={{ maxWidth: 440 }}
    >
      <div style={{ padding: "40px 0 24px", textAlign: "center" }}>
        <div className="hand" style={{ fontSize: 22, color: "var(--ink-3)" }}>
          welcome back
        </div>
        <h1 className="serif" style={{ fontSize: 32, marginTop: 4 }}>
          <span style={{ color: "var(--y-deep)" }}>영</span>
          <span style={{ color: "var(--ink-3)" }}> · </span>
          <span style={{ color: "var(--h-deep)" }}>희</span>
          <span>의 자리로</span>
        </h1>
        <div
          className="serif"
          style={{ color: "var(--ink-2)", marginTop: 8 }}
        >
          둘 만의 작업실입니다.
        </div>
      </div>

      <div className="card" style={{ padding: 28 }}>
        <LoginForm from={searchParams?.from} />

        <div
          className="row gap-12"
          style={{ margin: "24px 0 16px", alignItems: "center" }}
        >
          <div style={{ flex: 1, height: 1, background: "var(--line)" }} />
          <span className="meta">또는</span>
          <div style={{ flex: 1, height: 1, background: "var(--line)" }} />
        </div>

        {isGoogleEnabled() ? (
          <form action={googleSignInAction}>
            <input
              type="hidden"
              name="callbackUrl"
              value={searchParams?.from || "/"}
            />
            <button
              type="submit"
              className="btn"
              style={{ width: "100%" }}
            >
              <svg width="16" height="16" viewBox="0 0 48 48" style={{ marginRight: 4 }}>
                <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3a12 12 0 0 1-11.3 8 12 12 0 1 1 7.9-21l5.7-5.7A20 20 0 1 0 44 24c0-1.2-.1-2.4-.4-3.5z" />
                <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8A12 12 0 0 1 24 12c3 0 5.8 1.1 7.9 3l5.7-5.7A20 20 0 0 0 6.3 14.7z" />
                <path fill="#4CAF50" d="M24 44a20 20 0 0 0 13.4-5.2l-6.2-5.2A12 12 0 0 1 12.7 28.4l-6.5 5A20 20 0 0 0 24 44z" />
                <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3a12 12 0 0 1-4.1 5.6l6.2 5.2c-.4.4 6.6-4.8 6.6-14.8 0-1.2-.1-2.4-.4-3.5z" />
              </svg>
              구글로 계속
            </button>
          </form>
        ) : (
          <button
            type="button"
            className="btn"
            style={{ width: "100%", opacity: 0.5, cursor: "not-allowed" }}
            disabled
            title="GOOGLE_CLIENT_ID/SECRET 환경변수가 설정돼야 활성화됩니다"
          >
            <svg width="16" height="16" viewBox="0 0 48 48" style={{ marginRight: 4 }}>
              <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3a12 12 0 0 1-11.3 8 12 12 0 1 1 7.9-21l5.7-5.7A20 20 0 1 0 44 24c0-1.2-.1-2.4-.4-3.5z" />
              <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8A12 12 0 0 1 24 12c3 0 5.8 1.1 7.9 3l5.7-5.7A20 20 0 0 0 6.3 14.7z" />
              <path fill="#4CAF50" d="M24 44a20 20 0 0 0 13.4-5.2l-6.2-5.2A12 12 0 0 1 12.7 28.4l-6.5 5A20 20 0 0 0 24 44z" />
              <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3a12 12 0 0 1-4.1 5.6l6.2 5.2c-.4.4 6.6-4.8 6.6-14.8 0-1.2-.1-2.4-.4-3.5z" />
            </svg>
            구글로 계속 (연동 후)
          </button>
        )}

        <div
          className="meta"
          style={{ display: "block", textAlign: "center", marginTop: 14 }}
        >
          방문자는 로그인 없이도 모든 글을 읽을 수 있어요.
        </div>
      </div>

      <div className="row" style={{ justifyContent: "center", marginTop: 16 }}>
        <Link href="/" className="btn btn-ghost btn-sm">
          ← 작업실 둘러보기
        </Link>
      </div>
    </div>
  );
}
