import Link from "next/link";

export const metadata = { title: "로그인 — 영희네 작업실" };

export default function LoginPage() {
  return (
    <div className="container-prose pt-20 pb-24">
      <div className="max-w-sm mx-auto card-paper">
        <div className="text-center mb-8">
          <div className="font-serif text-2xl">
            <span className="text-y">영</span>
            <span className="text-h">희</span>
            <span className="ml-1">네 작업실</span>
          </div>
          <p className="mt-2 text-sm text-ink-soft">
            Y &amp; H 둘만의 공간
          </p>
        </div>

        <form className="space-y-4 opacity-60 pointer-events-none">
          <div>
            <label className="block text-xs text-ink-soft mb-1.5 tracking-wide">아이디</label>
            <input
              type="text"
              placeholder="Y 또는 H"
              className="w-full px-3 py-2 rounded border border-line bg-paper focus:outline-none focus:border-ink/40 text-sm"
              disabled
            />
          </div>
          <div>
            <label className="block text-xs text-ink-soft mb-1.5 tracking-wide">비밀번호</label>
            <input
              type="password"
              placeholder="••••••••"
              className="w-full px-3 py-2 rounded border border-line bg-paper focus:outline-none focus:border-ink/40 text-sm"
              disabled
            />
          </div>
          <button
            type="button"
            className="btn w-full py-2.5 cursor-not-allowed"
            disabled
          >
            로그인
          </button>
        </form>

        <div className="mt-6 text-center text-xs text-ink-soft">
          <p className="hand text-base text-ink-soft/70">
            ＿ 인증 시스템 Phase 1 후반부 ＿
          </p>
        </div>
      </div>

      <div className="text-center mt-8">
        <Link href="/" className="text-sm text-ink-soft hover:text-ink">
          ← 홈으로
        </Link>
      </div>
    </div>
  );
}
