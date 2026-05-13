import Link from "next/link";

const navItems = [
  { href: "/essay", label: "에세이" },
  { href: "/relay", label: "이어쓰기" },
  { href: "/keyword", label: "키워드" },
  { href: "/bookclub", label: "독서모임" },
  { href: "/photostory", label: "사진+글" },
  { href: "/about", label: "소개" },
];

export default function Header() {
  return (
    <header className="border-b border-line bg-paper/80 backdrop-blur-sm sticky top-0 z-20">
      <div className="max-w-5xl mx-auto px-5 h-14 flex items-center justify-between">
        <Link href="/" className="font-serif text-lg tracking-tight">
          <span className="text-y">영</span>
          <span className="text-h">희</span>
          <span className="ml-1">네 작업실</span>
        </Link>

        <nav className="hidden md:flex items-center gap-6 text-sm text-ink-soft">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="hover:text-ink transition-colors"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <Link
          href="/login"
          className="text-sm text-ink-soft hover:text-ink transition-colors"
        >
          로그인
        </Link>
      </div>
    </header>
  );
}
