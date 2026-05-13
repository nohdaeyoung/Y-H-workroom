import Link from "next/link";

type Activity = {
  icon: string;
  label: string;
  detail: React.ReactNode;
  when: string;
  href: string;
};

const recentActivities: Activity[] = [
  {
    icon: "📝",
    label: "에세이",
    detail: (
      <>
        <span className="text-y font-medium">Y</span>가 &ldquo;비오는 날&rdquo;을 썼습니다
      </>
    ),
    when: "2시간 전",
    href: "/essay",
  },
  {
    icon: "✍️",
    label: "이어쓰기",
    detail: (
      <>
        &ldquo;골목길&rdquo;에 <span className="text-h font-medium">H</span>가 이어 썼습니다
      </>
    ),
    when: "어제",
    href: "/relay",
  },
  {
    icon: "🎲",
    label: "키워드",
    detail: (
      <>
        &ldquo;빈 의자&rdquo; — Y <span className="text-y">✅</span>{" "}
        H <span className="text-ink-soft">⏳</span>
      </>
    ),
    when: "3일 전",
    href: "/keyword",
  },
  {
    icon: "📖",
    label: "독서모임",
    detail: <>「나는 나로 살기로 했다」</>,
    when: "1주 전",
    href: "/bookclub",
  },
  {
    icon: "📷",
    label: "사진+글",
    detail: (
      <>
        <span className="text-h font-medium">H</span>가 사진을 올렸습니다,{" "}
        <span className="text-y font-medium">Y</span>의 글 대기중
      </>
    ),
    when: "오늘",
    href: "/photostory",
  },
];

const sections = [
  { href: "/essay", icon: "📝", label: "에세이", desc: "나란히 읽기" },
  { href: "/relay", icon: "✍️", label: "이어쓰기", desc: "한 문장씩 잇기" },
  { href: "/keyword", icon: "🎲", label: "키워드", desc: "같은 단어, 다른 시선" },
  { href: "/bookclub", icon: "📖", label: "독서모임", desc: "둘의 대화" },
  { href: "/photostory", icon: "📷", label: "사진+글", desc: "찍고, 쓰다" },
];

export default function HomePage() {
  return (
    <div className="container-prose pt-12 md:pt-20">
      {/* Hero */}
      <section className="text-center">
        <h1 className="font-serif text-4xl md:text-5xl font-medium tracking-tight">
          <span className="text-y">영</span>
          <span className="text-h">희</span>
          <span className="ml-1">네 작업실</span>
        </h1>
        <p className="mt-4 text-ink-soft font-serif">
          두 사람의 글과 사진이 만나는 곳
        </p>
        <div className="mt-6 inline-block hand text-ink-soft text-lg opacity-70">
          ＿ Y &amp; H ＿
        </div>
      </section>

      {/* 최근 활동 */}
      <section className="mt-16">
        <h2 className="text-xs tracking-[0.25em] text-ink-soft text-center mb-6">
          ── 최근 활동 ──
        </h2>
        <ul className="space-y-1">
          {recentActivities.map((a, i) => (
            <li key={i}>
              <Link
                href={a.href}
                className="flex items-baseline gap-3 px-4 py-3 rounded-md hover:bg-paper-dark transition-colors"
              >
                <span className="text-base">{a.icon}</span>
                <span className="text-xs text-ink-soft w-16 shrink-0">{a.label}</span>
                <span className="font-serif text-sm flex-1">{a.detail}</span>
                <span className="text-xs text-ink-soft shrink-0">{a.when}</span>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      {/* 섹션 카드 */}
      <section className="mt-12 mb-16">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {sections.map((s) => (
            <Link
              key={s.href}
              href={s.href}
              className="card-paper hover:border-ink/30 transition-colors text-center group"
            >
              <div className="text-2xl mb-2">{s.icon}</div>
              <div className="font-serif text-sm font-medium">{s.label}</div>
              <div className="text-xs text-ink-soft mt-1">{s.desc}</div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
