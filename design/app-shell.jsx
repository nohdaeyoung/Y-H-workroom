/* global React, ReactDOM */
const { useState, useEffect, useMemo, useCallback, Fragment } = React;

// ───── 해시 라우터 훅 ──────────────────────
function useRoute() {
  const [hash, setHash] = useState(window.location.hash || '#/');
  useEffect(() => {
    const fn = () => setHash(window.location.hash || '#/');
    window.addEventListener('hashchange', fn);
    return () => window.removeEventListener('hashchange', fn);
  }, []);
  const path = hash.replace(/^#/, '') || '/';
  const segments = path.split('/').filter(Boolean);
  return { hash, path, segments, go: (p) => { window.location.hash = p; } };
}

// ───── 헤더 ─────────────────────────────
function Header({ path }) {
  const navItems = [
    { href: '#/', label: '홈', emoji: '🏠', match: (p) => p === '/' },
    { href: '#/essay', label: '에세이', emoji: '📝', match: (p) => p.startsWith('/essay') },
    { href: '#/relay', label: '이어쓰기', emoji: '✍️', match: (p) => p.startsWith('/relay') },
    { href: '#/keyword', label: '키워드', emoji: '🎲', match: (p) => p.startsWith('/keyword') },
    { href: '#/bookclub', label: '독서모임', emoji: '📖', match: (p) => p.startsWith('/bookclub') },
    { href: '#/photostory', label: '사진+글', emoji: '📷', match: (p) => p.startsWith('/photostory') },
  ];
  const user = window.CURRENT_USER;
  return (
    <header className="header">
      <div className="header-inner">
        <a href="#/" className="brand">
          <span className="b-y">영</span>
          <span style={{ color: 'var(--ink-3)', fontSize: '14px' }}>·</span>
          <span className="b-h">희</span>
          <span style={{ color: 'var(--ink)' }}>네 작업실</span>
        </a>
        <nav className="nav">
          {navItems.map((n) => (
            <a key={n.href} href={n.href} className={n.match(path) ? 'active' : ''}>
              <span className="nav-emoji">{n.emoji}</span>
              <span>{n.label}</span>
            </a>
          ))}
        </nav>
        <div className="header-right">
          <a href="#/about" className="btn btn-ghost btn-sm" style={{ display: 'inline-flex' }}>소개</a>
          {user ? (
            <>
              <a href="#/admin" title="어드민" className="btn btn-ghost btn-sm">⚙</a>
              <a href="#/admin/my" title="내 글" className={`avatar-mini ${user.toLowerCase()}`}>{user}</a>
            </>
          ) : (
            <a href="#/login" className="btn btn-sm">로그인</a>
          )}
        </div>
      </div>
    </header>
  );
}

// ───── 모바일 하단 탭바 ────────────────────
function Tabbar({ path }) {
  const items = [
    { href: '#/', label: '홈', icon: '🏠', match: (p) => p === '/' },
    { href: '#/essay', label: '에세이', icon: '📝', match: (p) => p.startsWith('/essay') },
    { href: '#/relay', label: '이어쓰기', icon: '✍️', match: (p) => p.startsWith('/relay') },
    { href: '#/keyword', label: '키워드', icon: '🎲', match: (p) => p.startsWith('/keyword') },
    { href: '#/photostory', label: '사진+글', icon: '📷', match: (p) => p.startsWith('/photostory') },
    { href: '#/bookclub', label: '독서모임', icon: '📖', match: (p) => p.startsWith('/bookclub') },
  ];
  return (
    <nav className="tabbar">
      <div className="tabbar-inner">
        {items.map((i) => (
          <a key={i.href} href={i.href} className={i.match(path) ? 'active' : ''}>
            <span>{i.icon}</span>
            <span>{i.label}</span>
          </a>
        ))}
      </div>
    </nav>
  );
}

// ───── 공용 UI 헬퍼 ───────────────────────
function AuthorMark({ author, size = 'sm' }) {
  if (!author || author === '???') {
    return (
      <span className="author-mark unknown">
        <span className="name">???</span>
      </span>
    );
  }
  const cls = author === 'Y' ? 'y' : 'h';
  const name = window.USERS[author]?.name || author;
  return (
    <span className={`author-mark ${cls}`}>
      <span className={`avatar-mini ${cls}`} style={{ width: size === 'sm' ? 22 : 30, height: size === 'sm' ? 22 : 30, fontSize: size === 'sm' ? 12 : 14 }}>{author}</span>
      <span className="name">{name}</span>
    </span>
  );
}

function Photo({ hue = 60, label = '사진', height = 220, count = 1, idx = 0 }) {
  // 그라데이션 기반 사진 플레이스홀더
  const base = `oklch(0.85 0.05 ${hue})`;
  const accent = `oklch(0.72 0.07 ${(hue + 30) % 360})`;
  const deep = `oklch(0.55 0.06 ${(hue + 60) % 360})`;
  // 살짝 변주
  const variant = (idx * 37) % 100;
  return (
    <div
      className="photo"
      style={{
        height,
        background: `linear-gradient(${135 + variant}deg, ${base} 0%, ${accent} 55%, ${deep} 100%)`,
      }}
    >
      <svg viewBox="0 0 100 100" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: 0.25 }}>
        <circle cx={20 + variant / 5} cy={30} r={8} fill="oklch(1 0 0 / 0.5)" />
        <path d={`M0,${70 + (idx % 3) * 4} Q30,${55 + (idx % 4) * 3} 60,${65} T100,${60}`} stroke="oklch(0.3 0.05 ${hue} / 0.5)" strokeWidth="1.5" fill="none" />
        <path d={`M0,${85} Q40,${75 + (idx % 3) * 2} 100,${82}`} stroke="oklch(0.3 0.05 ${hue} / 0.3)" strokeWidth="1" fill="none" />
      </svg>
      <span style={{ position: 'relative', zIndex: 1, opacity: 0.6 }}>📷</span>
    </div>
  );
}

// 모달 헬퍼
function Modal({ children, onClose, title }) {
  useEffect(() => {
    const fn = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', fn);
    return () => window.removeEventListener('keydown', fn);
  }, [onClose]);
  return (
    <div className="modal-back" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        {title && <h3 className="serif" style={{ fontSize: 20, marginBottom: 14 }}>{title}</h3>}
        {children}
      </div>
    </div>
  );
}

// 댓글 영역
function CommentArea({ count = 0, color }) {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ marginTop: 24, paddingTop: 20, borderTop: '1px dashed var(--line)' }}>
      <div className="row-between" style={{ marginBottom: 12 }}>
        <div className="section-title" style={{ fontSize: 15 }}>
          💬 댓글 <span style={{ color: 'var(--ink-3)', fontWeight: 400 }}>{count}</span>
        </div>
        <button className="btn btn-ghost btn-sm" onClick={() => setOpen(!open)}>{open ? '접기' : '쓰기'}</button>
      </div>
      {open && (
        <div className="card-flat fade-in" style={{ padding: 14, background: 'var(--paper)', border: '1px solid var(--line)' }}>
          <div className="row gap-8" style={{ marginBottom: 8 }}>
            <input className="input" placeholder="닉네임" style={{ maxWidth: 140 }} />
            <input className="input" placeholder="비밀번호 (선택)" style={{ maxWidth: 140 }} />
            <label className="meta" style={{ marginLeft: 'auto' }}>
              <input type="checkbox" /> &nbsp;비밀 댓글
            </label>
          </div>
          <textarea className="textarea" rows={2} placeholder="댓글을 남겨주세요…" />
          <div className="row" style={{ justifyContent: 'flex-end', marginTop: 8 }}>
            <button className="btn btn-primary btn-sm">남기기</button>
          </div>
        </div>
      )}
      {count > 0 && (
        <ul className="col gap-12" style={{ marginTop: 12 }}>
          {window.SAMPLE_COMMENTS.slice(0, Math.min(count, 3)).map((c, i) => (
            <li key={i} style={{ padding: '10px 12px', background: 'var(--paper)', borderRadius: 'var(--r-md)', border: '1px solid var(--line)' }}>
              <div className="row-between" style={{ marginBottom: 2 }}>
                <span style={{ fontSize: 13, fontWeight: 500 }}>{c.nickname}</span>
                <span className="meta">{c.date}</span>
              </div>
              <div style={{ fontSize: 14, color: 'var(--ink-2)' }}>{c.text}</div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

Object.assign(window, { useRoute, Header, Tabbar, AuthorMark, Photo, Modal, CommentArea });
