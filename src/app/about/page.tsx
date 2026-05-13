export const metadata = { title: "소개 — 영희네 작업실" };

export default function AboutPage() {
  return (
    <div className="container-prose pt-16 pb-24">
      <header className="text-center mb-16">
        <h1 className="font-serif text-4xl md:text-5xl font-medium">소개</h1>
        <p className="mt-3 text-ink-soft font-serif">
          영희네 작업실 이야기
        </p>
      </header>

      <section className="prose-serif text-center mb-16">
        <p className="text-lg">
          이곳은 <span className="text-y font-medium">영</span>(Y)과{" "}
          <span className="text-h font-medium">희</span>(H), 두 사람만 글을 쓰는 작업실입니다.
        </p>
        <p className="text-lg mt-4">
          같은 시간, 다른 시선으로 쌓아가는 글과 사진.
          <br />
          누구나 들러 읽고, 한 마디 두고 갈 수 있어요.
        </p>
      </section>

      <div className="grid md:grid-cols-2 gap-6 mb-16">
        <article className="card-paper bg-y-bg border-y/20">
          <div className="text-xs tracking-[0.2em] text-y mb-3">Y · 대영</div>
          <h2 className="font-serif text-2xl mb-3">영</h2>
          <p className="prose-serif text-sm text-ink-soft">
            (소개 — 어드민에서 직접 편집 예정)
          </p>
        </article>
        <article className="card-paper bg-h-bg border-h/20">
          <div className="text-xs tracking-[0.2em] text-h mb-3">H · 희서</div>
          <h2 className="font-serif text-2xl mb-3">희</h2>
          <p className="prose-serif text-sm text-ink-soft">
            (소개 — 어드민에서 직접 편집 예정)
          </p>
        </article>
      </div>

      <section className="text-center">
        <p className="hand text-2xl text-ink-soft">
          두 동인이 함께 쌓아가는 작업실
        </p>
      </section>
    </div>
  );
}
