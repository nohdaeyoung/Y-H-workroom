import Link from "next/link";

const tabs = [
  { href: "/", label: "홈", icon: "🏠" },
  { href: "/essay", label: "에세이", icon: "📝" },
  { href: "/relay", label: "이어쓰기", icon: "✍️" },
  { href: "/keyword", label: "키워드", icon: "🎲" },
  { href: "/photostory", label: "사진+글", icon: "📷" },
  { href: "/bookclub", label: "독서모임", icon: "📖" },
];

export default function MobileTabBar() {
  return (
    <nav className="tabbar">
      <div className="tabbar-inner">
        {tabs.map((tab) => (
          <Link key={tab.href} href={tab.href}>
            <span>{tab.icon}</span>
            <span>{tab.label}</span>
          </Link>
        ))}
      </div>
    </nav>
  );
}
