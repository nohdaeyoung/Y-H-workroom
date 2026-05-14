import Link from "next/link";
import { auth } from "@/auth";
import { logoutAction } from "@/app/login/actions";

export default async function Header() {
  const session = await auth();
  const user = session?.user;
  const uid = user?.id;

  return (
    <header className="header">
      <div className="header-inner">
        <Link href="/" className="brand">
          <span className="b-y">영</span>
          <span className="b-h">희</span>
          <span style={{ color: "var(--ink)" }}>네 작업실</span>
        </Link>

        <nav className="nav">
          <Link href="/essay"><span className="nav-emoji">📝</span><span>에세이</span></Link>
          <Link href="/relay"><span className="nav-emoji">✍️</span><span>이어쓰기</span></Link>
          <Link href="/keyword"><span className="nav-emoji">🎲</span><span>키워드</span></Link>
          <Link href="/bookclub"><span className="nav-emoji">📖</span><span>독서모임</span></Link>
          <Link href="/photostory"><span className="nav-emoji">📷</span><span>사진+글</span></Link>
        </nav>

        <div className="header-right">
          <Link href="/about" className="btn btn-ghost btn-sm">소개</Link>
          {uid ? (
            <>
              <Link href="/admin" title="어드민" className="btn btn-ghost btn-sm">⚙</Link>
              <Link
                href="/admin/my"
                title="내 글"
                className={`avatar-mini ${uid.toLowerCase()}`}
              >
                {uid}
              </Link>
              <form action={logoutAction}>
                <button type="submit" className="btn btn-ghost btn-sm" title="로그아웃">
                  ↗
                </button>
              </form>
            </>
          ) : (
            <Link href="/login" className="btn btn-sm">로그인</Link>
          )}
        </div>
      </div>
    </header>
  );
}
