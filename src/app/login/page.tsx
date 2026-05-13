import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
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
    <div className="container-prose pt-20 pb-24">
      <div className="max-w-sm mx-auto card-paper">
        <div className="text-center mb-8">
          <div className="font-serif text-2xl">
            <span className="text-y">영</span>
            <span className="text-h">희</span>
            <span className="ml-1">네 작업실</span>
          </div>
          <p className="mt-2 text-sm text-ink-soft">Y &amp; H 둘만의 공간</p>
        </div>

        <LoginForm from={searchParams?.from} />

        <div className="mt-6 text-center text-xs text-ink-soft hand text-base opacity-70">
          ＿ 둘만 들어오는 작업실 ＿
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
