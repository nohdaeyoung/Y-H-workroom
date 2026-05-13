/* global React */
const { useState: useStateP1, useMemo: useMemoP1 } = React;

// ════════════════════════════════════════════
//  홈 (/)
// ════════════════════════════════════════════
function HomePage() {
  const sections = [
    { icon: '📝', label: '에세이', href: '#/essay', desc: '나란히 읽기', count: window.ESSAYS.length },
    { icon: '✍️', label: '이어쓰기', href: '#/relay', desc: '한 문장씩 번갈아', count: window.RELAYS.length },
    { icon: '🎲', label: '키워드', href: '#/keyword', desc: 'AI가 던지는 단어', count: window.KEYWORDS.length },
    { icon: '📖', label: '독서모임', href: '#/bookclub', desc: '둘의 대화', count: window.BOOKCLUBS.length },
    { icon: '📷', label: '사진+글', href: '#/photostory', desc: '한 사람의 사진, 한 사람의 글', count: window.PHOTOSTORIES.length },
  ];
  return (
    <div className="container narrow fade-in">
      {/* Hero */}
      <div style={{ padding: '60px 0 40px', textAlign: 'center' }}>
        <div className="hand" style={{ fontSize: 22, color: 'var(--ink-3)' }}>welcome to</div>
        <h1 className="serif" style={{ fontSize: 42, letterSpacing: '-0.03em', marginTop: 8, lineHeight: 1.15 }}>
          <span style={{ color: 'var(--y-deep)' }}>영</span>
          <span style={{ color: 'var(--ink-3)', fontWeight: 300 }}> · </span>
          <span style={{ color: 'var(--h-deep)' }}>희</span>
          <span>네 작업실</span>
        </h1>
        <div className="serif" style={{ marginTop: 16, fontSize: 17, color: 'var(--ink-2)' }}>
          두 사람의 글과 사진이 만나는 곳
        </div>
        <div className="hand" style={{ marginTop: 24, fontSize: 20, color: 'var(--ink-4)' }}>2026.05.13 · 화요일 · 흐림</div>
      </div>

      <div className="divider-dot" />

      {/* 최근 활동 */}
      <h2 className="serif" style={{ fontSize: 22, marginBottom: 16 }}>오늘의 작업실</h2>
      <ul className="col gap-8">
        {window.RECENT_ACTIVITY.map((a, i) => (
          <li key={i}>
            <a href={a.link} className="card lift" style={{ display: 'flex', gap: 16, padding: '14px 18px', alignItems: 'center' }}>
              <span style={{ fontSize: 22, lineHeight: 1 }}>{a.icon}</span>
              <div className="flex-1">
                <div style={{ fontSize: 12, color: 'var(--ink-4)', letterSpacing: '0.05em' }}>{a.kind.toUpperCase()}</div>
                <div className="serif" style={{ fontSize: 16, color: 'var(--ink)', marginTop: 2 }}>{a.text}</div>
              </div>
              <span className="meta">{a.when}</span>
            </a>
          </li>
        ))}
      </ul>

      <div className="divider-dot" />

      {/* 둘러보기 */}
      <h2 className="serif" style={{ fontSize: 22, marginBottom: 16 }}>둘러보기</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 12 }}>
        {sections.map((s) => (
          <a key={s.href} href={s.href} className="card lift" style={{ padding: '18px 16px', textAlign: 'center' }}>
            <div style={{ fontSize: 28 }}>{s.icon}</div>
            <div className="serif" style={{ fontSize: 16, fontWeight: 600, marginTop: 8 }}>{s.label}</div>
            <div style={{ fontSize: 12, color: 'var(--ink-3)', marginTop: 2 }}>{s.desc}</div>
            <div className="hand" style={{ fontSize: 16, color: 'var(--ink-4)', marginTop: 6 }}>{s.count}편</div>
          </a>
        ))}
      </div>

      <div style={{ marginTop: 48, textAlign: 'center', color: 'var(--ink-4)' }} className="hand">
        한 페이지에 두 사람의 시간을 모아두는 곳
      </div>
    </div>
  );
}

// ════════════════════════════════════════════
//  로그인 (/login)
// ════════════════════════════════════════════
function LoginPage({ go }) {
  const [id, setId] = useStateP1('');
  const [pw, setPw] = useStateP1('');
  return (
    <div className="container narrow fade-in" style={{ maxWidth: 440 }}>
      <div style={{ padding: '40px 0 24px', textAlign: 'center' }}>
        <div className="hand" style={{ fontSize: 22, color: 'var(--ink-3)' }}>welcome back</div>
        <h1 className="serif" style={{ fontSize: 32, marginTop: 4 }}>
          <span style={{ color: 'var(--y-deep)' }}>영</span>
          <span style={{ color: 'var(--ink-3)' }}> · </span>
          <span style={{ color: 'var(--h-deep)' }}>희</span>
          <span>의 자리로</span>
        </h1>
        <div className="serif" style={{ color: 'var(--ink-2)', marginTop: 8 }}>둘 만의 작업실입니다.</div>
      </div>
      <div className="card" style={{ padding: 28 }}>
        <div className="row gap-12" style={{ marginBottom: 20 }}>
          <button className={`btn flex-1 ${id === 'Y' ? 'btn-y' : ''}`} onClick={() => setId('Y')}>
            <span style={{ fontSize: 16 }}>🌾</span> &nbsp;Y · 대영
          </button>
          <button className={`btn flex-1 ${id === 'H' ? 'btn-h' : ''}`} onClick={() => setId('H')}>
            <span style={{ fontSize: 16 }}>🌙</span> &nbsp;H · 희서
          </button>
        </div>
        <label className="label">비밀번호</label>
        <input className="input" type="password" value={pw} onChange={(e) => setPw(e.target.value)} placeholder="••••••••" />
        <button className="btn btn-primary btn-lg" style={{ width: '100%', marginTop: 16 }} onClick={() => { window.CURRENT_USER = id || 'Y'; go('/'); }}>
          작업실로 들어가기
        </button>

        <div className="row gap-12" style={{ margin: '24px 0 16px', alignItems: 'center' }}>
          <div style={{ flex: 1, height: 1, background: 'var(--line)' }} />
          <span className="meta">또는</span>
          <div style={{ flex: 1, height: 1, background: 'var(--line)' }} />
        </div>
        <button className="btn" style={{ width: '100%' }}>
          <svg width="16" height="16" viewBox="0 0 48 48" style={{ marginRight: 4 }}><path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3a12 12 0 0 1-11.3 8 12 12 0 1 1 7.9-21l5.7-5.7A20 20 0 1 0 44 24c0-1.2-.1-2.4-.4-3.5z"/><path fill="#FF3D00" d="M6.3 14.7l6.6 4.8A12 12 0 0 1 24 12c3 0 5.8 1.1 7.9 3l5.7-5.7A20 20 0 0 0 6.3 14.7z"/><path fill="#4CAF50" d="M24 44a20 20 0 0 0 13.4-5.2l-6.2-5.2A12 12 0 0 1 12.7 28.4l-6.5 5A20 20 0 0 0 24 44z"/><path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3a12 12 0 0 1-4.1 5.6l6.2 5.2c-.4.4 6.6-4.8 6.6-14.8 0-1.2-.1-2.4-.4-3.5z"/></svg>
          구글로 계속 (연동한 경우)
        </button>
        <div className="meta" style={{ display: 'block', textAlign: 'center', marginTop: 14 }}>
          방문자는 로그인 없이도 모든 글을 읽을 수 있어요.
        </div>
      </div>
      <div className="row" style={{ justifyContent: 'center', marginTop: 16 }}>
        <a href="#/" className="btn btn-ghost btn-sm">← 작업실 둘러보기</a>
      </div>
    </div>
  );
}

// ════════════════════════════════════════════
//  소개 (/about)
// ════════════════════════════════════════════
function AboutPage() {
  const s = (key) => window.ABOUT_SECTIONS.find((x) => x.key === key);
  return (
    <div className="container narrow fade-in">
      <div style={{ padding: '40px 0 32px', textAlign: 'center' }}>
        <div className="hand" style={{ fontSize: 22, color: 'var(--ink-3)' }}>about</div>
        <h1 className="serif" style={{ fontSize: 36, marginTop: 4 }}>{s('header')?.title}</h1>
        <div className="serif" style={{ color: 'var(--ink-2)', marginTop: 8 }}>{s('header')?.body}</div>
      </div>

      <div className="divider-dot" />

      <div className="prose" style={{ marginBottom: 40 }}>
        <h3 className="serif" style={{ fontSize: 22, marginBottom: 12 }}>{s('greeting')?.title}</h3>
        {s('greeting')?.body.split('\n').map((p, i) => <p key={i}>{p}</p>)}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 40 }}>
        <div className="card y" style={{ background: 'linear-gradient(180deg, var(--y-soft) 0%, var(--paper-2) 80px)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
            <span className="avatar-mini y" style={{ width: 40, height: 40, fontSize: 16 }}>Y</span>
            <div>
              <div className="serif" style={{ fontSize: 18, fontWeight: 600 }}>{s('y_profile')?.title}</div>
              <div className="hand" style={{ fontSize: 17, color: 'var(--y-deep)' }}>{window.USERS.Y.desc}</div>
            </div>
          </div>
          <div className="serif" style={{ fontSize: 14.5, lineHeight: 1.8, color: 'var(--ink-2)' }}>{s('y_profile')?.body}</div>
        </div>
        <div className="card h" style={{ background: 'linear-gradient(180deg, var(--h-soft) 0%, var(--paper-2) 80px)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
            <span className="avatar-mini h" style={{ width: 40, height: 40, fontSize: 16 }}>H</span>
            <div>
              <div className="serif" style={{ fontSize: 18, fontWeight: 600 }}>{s('h_profile')?.title}</div>
              <div className="hand" style={{ fontSize: 17, color: 'var(--h-deep)' }}>{window.USERS.H.desc}</div>
            </div>
          </div>
          <div className="serif" style={{ fontSize: 14.5, lineHeight: 1.8, color: 'var(--ink-2)' }}>{s('h_profile')?.body}</div>
        </div>
      </div>

      <div className="prose" style={{ marginBottom: 40 }}>
        <h3 className="serif" style={{ fontSize: 22, marginBottom: 12 }}>{s('story')?.title}</h3>
        <p>{s('story')?.body}</p>
      </div>

      <div className="card-flat" style={{ background: 'var(--paper-ink)', padding: 20, textAlign: 'center' }}>
        <div className="hand" style={{ fontSize: 18, color: 'var(--ink-3)' }}>{s('contact')?.title}</div>
        <div className="serif" style={{ fontSize: 18, marginTop: 4 }}>{s('contact')?.body}</div>
      </div>
    </div>
  );
}

Object.assign(window, { HomePage, LoginPage, AboutPage });
