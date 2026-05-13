import Link from "next/link";

const tabs = [
  { href: "/", label: "홈", icon: "🏠" },
  { href: "/essay", label: "에세이", icon: "📝" },
  { href: "/keyword", label: "키워드", icon: "🎲" },
  { href: "/photostory", label: "사진+글", icon: "📷" },
  { href: "/admin", label: "어드민", icon: "⚙️" },
];

export default function MobileTabBar() {
  return (
    <nav className="md:hidden fixed bottom-0 inset-x-0 border-t border-line bg-paper/95 backdrop-blur-sm z-20 pb-safe">
      <div className="grid grid-cols-5 text-xs">
        {tabs.map((tab) => (
          <Link
            key={tab.href}
            href={tab.href}
            className="py-2.5 flex flex-col items-center gap-1 text-ink-soft active:bg-paper-dark"
          >
            <span className="text-base leading-none">{tab.icon}</span>
            <span>{tab.label}</span>
          </Link>
        ))}
      </div>
    </nav>
  );
}
