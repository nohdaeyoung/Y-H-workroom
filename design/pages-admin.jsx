/* global React */
const { useState: useStateP7 } = React;

// ════════════════════════════════════════════
//  어드민 홈 (/admin)
// ════════════════════════════════════════════
function AdminHomePage() {
  const user = window.CURRENT_USER || 'Y';
  const counts = window.ADMIN_STATS.myCounts[user];
  const todos = window.ADMIN_STATS.todos;
  const cls = user === 'Y' ? 'y' : 'h';
  return (
    <div className="container narrow fade-in" style={{ maxWidth: 880, background: 'var(--paper-deep)', padding: '24px 0', borderRadius: 'var(--r-lg)' }}>
      <div style={{ padding: '0 24px' }}>
        {/* 어드민 뱃지 라인 */}
        <div className="row gap-8" style={{ marginBottom: 24 }}>
          <span className="chip" style={{ background: 'var(--ink)', color: 'var(--paper-2)', borderColor: 'var(--ink)' }}>관리자</span>
          <span className="meta">/admin</span>
          <span className="meta" style={{ marginLeft: 'auto' }}>마지막 로그인 어제 23:14</span>
        </div>

        {/* 인사 */}
        <div style={{ marginBottom: 32 }}>
          <div className="hand" style={{ fontSize: 22, color: 'var(--ink-3)' }}>hello,</div>
          <h1 className="serif" style={{ fontSize: 34, marginTop: 4 }}>
            환영해요, <span className={cls === 'y' ? 'text-y' : 'text-h'}>{window.USERS[user].name}</span>
          </h1>
          <div className="meta" style={{ marginTop: 6 }}>2026.05.13 · 화요일</div>
        </div>

        {/* 빠른 통계 */}
        <h3 className="section-title" style={{ marginBottom: 12 }}>내가 쓴 글</h3>
        <div className="card" style={{ marginBottom: 24, padding: '20px 24px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 12 }}>
            {[
              { icon: '📝', label: '에세이', n: counts.essay, link: '#/admin/my/essay' },
              { icon: '✍️', label: '이어쓰기', n: counts.relay, link: '#/admin/my/relay' },
              { icon: '🎲', label: '키워드', n: counts.keyword, link: '#/admin/my/keyword' },
              { icon: '📖', label: '독서모임', n: counts.bookclub, link: '#/admin/my/bookclub' },
              { icon: '📷', label: '사진+글', n: counts.photo, link: '#/admin/my/photo' },
            ].map((s) => (
              <a key={s.label} href={s.link} className="lift" style={{ padding: 14, textAlign: 'center', borderRadius: 'var(--r-md)' }}>
                <div style={{ fontSize: 22 }}>{s.icon}</div>
                <div className="serif" style={{ fontSize: 22, fontWeight: 600, marginTop: 4 }}>{s.n}</div>
                <div className="meta">{s.label}</div>
              </a>
            ))}
          </div>
        </div>

        {/* 해야 할 일 */}
        <h3 className="section-title" style={{ marginBottom: 12 }}>해야 할 일</h3>
        <div className="card" style={{ marginBottom: 24, padding: '8px 0' }}>
          {todos.map((t, i) => (
            <a key={i} href={t.link} className="row gap-12" style={{ padding: '14px 20px', borderBottom: i < todos.length - 1 ? '1px solid var(--line)' : 'none', alignItems: 'center' }}>
              <span style={{ fontSize: 20 }}>{t.icon}</span>
              <span className="serif" style={{ fontSize: 15, flex: 1 }}>{t.text}</span>
              <span className="meta">→</span>
            </a>
          ))}
        </div>

        {/* 빠른 링크 */}
        <h3 className="section-title" style={{ marginBottom: 12 }}>설정</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12 }}>
          {[
            { href: '#/admin/my', icon: '📚', label: '내 글 모아보기', desc: '발행 / 임시저장 관리' },
            { href: '#/admin/about', icon: '📄', label: '소개 관리', desc: 'About 페이지 편집' },
            { href: '#/admin/account', icon: '⚙️', label: '계정 설정', desc: '비밀번호 · 구글 연동' },
          ].map((q) => (
            <a key={q.href} href={q.href} className="card lift" style={{ padding: 18 }}>
              <div style={{ fontSize: 22 }}>{q.icon}</div>
              <div className="serif" style={{ fontSize: 16, fontWeight: 600, marginTop: 6 }}>{q.label}</div>
              <div className="meta" style={{ marginTop: 2 }}>{q.desc}</div>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}

// ════════════════════════════════════════════
//  내 글 모아보기 (/admin/my, /admin/my/[section])
// ════════════════════════════════════════════
function AdminMyPage({ section = 'essay' }) {
  const user = window.CURRENT_USER || 'Y';
  const tabs = [
    { id: 'essay', label: '📝 에세이' },
    { id: 'relay', label: '✍️ 이어쓰기' },
    { id: 'keyword', label: '🎲 키워드' },
    { id: 'bookclub', label: '📖 독서모임' },
    { id: 'photo', label: '📷 사진+글' },
  ];
  const [status, setStatus] = useStateP7('all');

  // 데이터 매핑 (간단히)
  let items = [];
  if (section === 'essay') items = window.ESSAYS.filter((e) => e.author === user);
  else if (section === 'relay') items = window.RELAYS;
  else if (section === 'keyword') items = window.KEYWORDS.filter((k) => (user === 'Y' ? k.yEssay : k.hEssay));
  else if (section === 'bookclub') items = window.BOOKCLUBS;
  else if (section === 'photo') items = window.PHOTOSTORIES.filter((p) => p.photoAuthor === user || p.textAuthor === user);

  return (
    <div className="container fade-in" style={{ maxWidth: 980 }}>
      <a href="#/admin" className="btn btn-ghost btn-sm" style={{ marginBottom: 16 }}>← 어드민 홈</a>
      <div className="row gap-12" style={{ marginBottom: 24, alignItems: 'flex-end' }}>
        <div>
          <div className="hand" style={{ fontSize: 20, color: 'var(--ink-3)' }}>my posts</div>
          <h1 className="page-title">내 글 모아보기</h1>
        </div>
        <span className={`avatar-mini ${user.toLowerCase()}`} style={{ marginLeft: 'auto' }}>{user}</span>
        <span className="hand" style={{ fontSize: 17, color: 'var(--ink-3)' }}>{window.USERS[user].name}의 글</span>
      </div>

      {/* 탭 */}
      <div className="row gap-4" style={{ borderBottom: '1px solid var(--line)', marginBottom: 24, overflowX: 'auto' }}>
        {tabs.map((t) => (
          <a
            key={t.id}
            href={`#/admin/my/${t.id}`}
            className="btn btn-ghost btn-sm"
            style={{
              borderRadius: '6px 6px 0 0',
              borderBottom: section === t.id ? '2px solid var(--ink)' : '2px solid transparent',
              color: section === t.id ? 'var(--ink)' : 'var(--ink-3)',
              fontWeight: section === t.id ? 500 : 400,
              padding: '10px 14px', marginBottom: -1,
              whiteSpace: 'nowrap',
            }}
          >{t.label}</a>
        ))}
      </div>

      {/* 상태 필터 */}
      <div className="row gap-8" style={{ marginBottom: 16, flexWrap: 'wrap' }}>
        {['all', 'published', 'draft', 'private'].map((s) => (
          <button
            key={s}
            onClick={() => setStatus(s)}
            className={`chip ${status === s ? '' : ''}`}
            style={{
              cursor: 'pointer',
              background: status === s ? 'var(--ink)' : 'var(--paper-2)',
              color: status === s ? 'var(--paper-2)' : 'var(--ink-2)',
              borderColor: status === s ? 'var(--ink)' : 'var(--line)',
            }}
          >{{ all: '전체', published: '발행됨', draft: '임시저장', private: '비공개' }[s]}</button>
        ))}
        <select className="select" style={{ width: 'auto', marginLeft: 'auto' }}>
          <option>최신순</option>
          <option>댓글 많은 순</option>
        </select>
      </div>

      {/* 리스트 */}
      <div className="col gap-8">
        {items.map((item, i) => (
          <div key={i} className="card" style={{ padding: '16px 20px' }}>
            <div className="row-between">
              <div className="flex-1">
                <div className="row gap-8" style={{ marginBottom: 4 }}>
                  <span className="chip" style={{ fontSize: 11 }}>발행됨</span>
                  <span className="meta">{item.date || item.updatedAt || item.suggestedAt || item.meetingDate || item.photoUploadedAt}</span>
                  {item.comments > 0 && <span className="meta">💬 {item.comments}</span>}
                </div>
                <div className="serif" style={{ fontSize: 17, fontWeight: 600 }}>
                  {item.title || item.keyword || item.bookTitle || item.photoTitle}
                </div>
                {(item.excerpt || item.text) && (
                  <p className="serif" style={{ fontSize: 14, color: 'var(--ink-3)', marginTop: 4, display: '-webkit-box', WebkitLineClamp: 1, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                    {item.excerpt || item.text?.split('\n')[0]}
                  </p>
                )}
              </div>
              <div className="row gap-4">
                <button className="btn btn-ghost btn-sm">수정</button>
                <button className="btn btn-ghost btn-sm">공개↔비공개</button>
                <button className="btn btn-ghost btn-sm" style={{ color: 'var(--danger)' }}>삭제</button>
              </div>
            </div>
          </div>
        ))}
        {items.length === 0 && (
          <div className="card" style={{ padding: 40, textAlign: 'center' }}>
            <div className="hand" style={{ fontSize: 22, color: 'var(--ink-3)' }}>아직 글이 없어요</div>
          </div>
        )}
      </div>
    </div>
  );
}

// ════════════════════════════════════════════
//  소개 페이지 콘텐츠 관리 (/admin/about)
// ════════════════════════════════════════════
function AdminAboutPage() {
  const [active, setActive] = useStateP7('greeting');
  const section = window.ABOUT_SECTIONS.find((s) => s.key === active);
  return (
    <div className="container fade-in" style={{ maxWidth: 1080 }}>
      <a href="#/admin" className="btn btn-ghost btn-sm" style={{ marginBottom: 16 }}>← 어드민 홈</a>
      <div className="row-between" style={{ marginBottom: 20, alignItems: 'flex-end' }}>
        <div>
          <div className="hand" style={{ fontSize: 20, color: 'var(--ink-3)' }}>about — admin</div>
          <h1 className="page-title">소개 페이지 관리</h1>
        </div>
        <div className="row gap-8">
          <span className="meta">마지막 편집:</span>
          <span className="avatar-mini h">H</span>
          <span className="meta">2026.05.10 · 23:14</span>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '220px 1fr', gap: 20 }}>
        {/* 섹션 리스트 */}
        <div className="card" style={{ padding: 8, alignSelf: 'flex-start' }}>
          {window.ABOUT_SECTIONS.map((s) => (
            <button
              key={s.key}
              onClick={() => setActive(s.key)}
              style={{
                display: 'block', width: '100%', textAlign: 'left',
                padding: '10px 12px', borderRadius: 'var(--r-md)',
                background: active === s.key ? 'var(--paper-ink)' : 'transparent',
                fontSize: 14, fontWeight: active === s.key ? 500 : 400,
                color: active === s.key ? 'var(--ink)' : 'var(--ink-2)',
                cursor: 'pointer',
              }}
            >
              <div>{s.title}</div>
              <div className="meta" style={{ fontSize: 11 }}>/about · {s.key}</div>
            </button>
          ))}
          <hr />
          <div style={{ padding: '0 12px 8px' }}>
            <a href="#/about" target="_blank" className="btn btn-ghost btn-sm" style={{ fontSize: 12, width: '100%' }}>
              ↗ 공개 페이지 보기
            </a>
          </div>
        </div>

        {/* 편집 영역 */}
        <div className="card">
          <div className="row-between" style={{ marginBottom: 16 }}>
            <h3 className="section-title">{section?.title} 섹션 편집</h3>
            <span className="chip" style={{ fontSize: 11 }}>섹션 키: {section?.key}</span>
          </div>
          <label className="label">제목</label>
          <input className="input" defaultValue={section?.title} />
          <label className="label" style={{ marginTop: 14 }}>본문</label>
          {/* 툴바 */}
          <div className="row gap-4" style={{ marginBottom: 6, padding: '4px 0', borderBottom: '1px dashed var(--line)' }}>
            {['B', 'I', 'U', 'H', '"', '—', '·', '📷', '🔗'].map((t, i) => (
              <button key={i} className="btn btn-ghost btn-sm" style={{ padding: '4px 8px', minWidth: 28 }}>{t}</button>
            ))}
          </div>
          <textarea className="textarea" rows={10} defaultValue={section?.body} />
          {(section?.key === 'y_profile' || section?.key === 'h_profile') && (
            <>
              <label className="label" style={{ marginTop: 14 }}>프로필 이미지</label>
              <div className="row gap-12" style={{ alignItems: 'center' }}>
                <div className="photo" style={{ width: 72, height: 72, borderRadius: '50%', fontSize: 24 }}>📷</div>
                <button className="btn">이미지 업로드</button>
              </div>
            </>
          )}
          <div className="row-between" style={{ marginTop: 24 }}>
            <button className="btn btn-ghost">미리보기</button>
            <div className="row gap-8">
              <button className="btn">취소</button>
              <button className="btn btn-primary">저장 → 공개 반영</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ════════════════════════════════════════════
//  계정 설정 (/admin/account)
// ════════════════════════════════════════════
function AdminAccountPage() {
  const user = window.CURRENT_USER || 'Y';
  const cls = user.toLowerCase();
  const [linked, setLinked] = useStateP7(false);
  return (
    <div className="container narrow fade-in" style={{ maxWidth: 680 }}>
      <a href="#/admin" className="btn btn-ghost btn-sm" style={{ marginBottom: 16 }}>← 어드민 홈</a>
      <div style={{ marginBottom: 24 }}>
        <div className="hand" style={{ fontSize: 20, color: 'var(--ink-3)' }}>account</div>
        <h1 className="page-title">계정 설정</h1>
      </div>

      {/* 프로필 */}
      <div className="card mb-16">
        <h3 className="section-title" style={{ marginBottom: 16 }}>프로필</h3>
        <div className="row gap-16" style={{ alignItems: 'center' }}>
          <span className={`avatar-mini ${cls}`} style={{ width: 64, height: 64, fontSize: 22 }}>{user}</span>
          <div className="flex-1">
            <label className="label">표시 이름</label>
            <input className="input" defaultValue={window.USERS[user].name} />
          </div>
          <button className="btn">이미지 변경</button>
        </div>
        <div style={{ marginTop: 16 }}>
          <label className="label">한 줄 설명</label>
          <input className="input" defaultValue={window.USERS[user].desc} placeholder="작업실 안에서 보일 짧은 소개" />
        </div>
        <div className="row" style={{ justifyContent: 'flex-end', marginTop: 16 }}>
          <button className="btn btn-primary">프로필 저장</button>
        </div>
      </div>

      {/* 비밀번호 */}
      <div className="card mb-16">
        <h3 className="section-title" style={{ marginBottom: 16 }}>비밀번호</h3>
        <div className="col gap-12">
          <div>
            <label className="label">현재 비밀번호</label>
            <input className="input" type="password" />
          </div>
          <div className="row gap-12">
            <div className="flex-1">
              <label className="label">새 비밀번호</label>
              <input className="input" type="password" />
            </div>
            <div className="flex-1">
              <label className="label">새 비밀번호 확인</label>
              <input className="input" type="password" />
            </div>
          </div>
        </div>
        <div className="row" style={{ justifyContent: 'flex-end', marginTop: 16 }}>
          <button className="btn btn-primary">비밀번호 변경</button>
        </div>
      </div>

      {/* 구글 연동 */}
      <div className="card mb-16">
        <h3 className="section-title" style={{ marginBottom: 8 }}>구글 계정 연동</h3>
        <div className="meta" style={{ marginBottom: 16 }}>
          연동 후에는 구글 로그인도 사용할 수 있어요. 사전 등록된 Y/H의 이메일만 허용됩니다.
        </div>
        {linked ? (
          <div className="card-flat" style={{ padding: 14, background: 'var(--paper)', border: '1px solid var(--line)' }}>
            <div className="row-between">
              <div className="row gap-12">
                <svg width="20" height="20" viewBox="0 0 48 48"><path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3a12 12 0 0 1-11.3 8 12 12 0 1 1 7.9-21l5.7-5.7A20 20 0 1 0 44 24c0-1.2-.1-2.4-.4-3.5z"/><path fill="#FF3D00" d="M6.3 14.7l6.6 4.8A12 12 0 0 1 24 12c3 0 5.8 1.1 7.9 3l5.7-5.7A20 20 0 0 0 6.3 14.7z"/><path fill="#4CAF50" d="M24 44a20 20 0 0 0 13.4-5.2l-6.2-5.2A12 12 0 0 1 12.7 28.4l-6.5 5A20 20 0 0 0 24 44z"/><path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3a12 12 0 0 1-4.1 5.6l6.2 5.2c-.4.4 6.6-4.8 6.6-14.8 0-1.2-.1-2.4-.4-3.5z"/></svg>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 500 }}>yh.{user.toLowerCase()}@gmail.com</div>
                  <div className="meta">2026.04.20 연동</div>
                </div>
              </div>
              <button className="btn btn-sm" onClick={() => setLinked(false)}>연동 해제</button>
            </div>
          </div>
        ) : (
          <button className="btn" style={{ width: '100%' }} onClick={() => setLinked(true)}>
            <svg width="16" height="16" viewBox="0 0 48 48" style={{ marginRight: 6 }}><path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3a12 12 0 0 1-11.3 8 12 12 0 1 1 7.9-21l5.7-5.7A20 20 0 1 0 44 24c0-1.2-.1-2.4-.4-3.5z"/><path fill="#FF3D00" d="M6.3 14.7l6.6 4.8A12 12 0 0 1 24 12c3 0 5.8 1.1 7.9 3l5.7-5.7A20 20 0 0 0 6.3 14.7z"/><path fill="#4CAF50" d="M24 44a20 20 0 0 0 13.4-5.2l-6.2-5.2A12 12 0 0 1 12.7 28.4l-6.5 5A20 20 0 0 0 24 44z"/><path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3a12 12 0 0 1-4.1 5.6l6.2 5.2c-.4.4 6.6-4.8 6.6-14.8 0-1.2-.1-2.4-.4-3.5z"/></svg>
            구글 계정 연동하기
          </button>
        )}
      </div>

      {/* 로그아웃 */}
      <div className="card">
        <div className="row-between">
          <div>
            <h3 className="section-title">로그아웃</h3>
            <div className="meta" style={{ marginTop: 4 }}>이 기기에서 작업실 세션을 종료합니다.</div>
          </div>
          <button className="btn">로그아웃</button>
        </div>
      </div>
    </div>
  );
}

// ════════════════════════════════════════════
//  사용자 전환 (개발용 작은 토글)
// ════════════════════════════════════════════
function UserSwitcher() {
  const [, setT] = useStateP7(0);
  const [open, setOpen] = useStateP7(false);
  const current = window.CURRENT_USER;
  const set = (u) => { window.CURRENT_USER = u; setT((x) => x + 1); window.dispatchEvent(new Event('user-changed')); };
  return (
    <div style={{ position: 'fixed', right: 16, bottom: 80, zIndex: 60 }}>
      {open && (
        <div className="card" style={{ position: 'absolute', right: 0, bottom: 50, padding: 12, minWidth: 200, boxShadow: 'var(--shadow-lg)' }}>
          <div className="meta" style={{ marginBottom: 8 }}>프로토타입 — 로그인 상태 전환</div>
          <div className="col gap-4">
            {['Y', 'H', null].map((u) => (
              <button
                key={u || 'guest'}
                className="btn btn-sm"
                style={{ justifyContent: 'flex-start', background: current === u ? 'var(--paper-ink)' : 'transparent', borderColor: current === u ? 'var(--line-2)' : 'var(--line)' }}
                onClick={() => set(u)}
              >
                {u ? <span className={`avatar-mini ${u.toLowerCase()}`} style={{ width: 22, height: 22, fontSize: 11 }}>{u}</span> : <span style={{ width: 22, height: 22, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', border: '1px dashed var(--line-2)', borderRadius: '50%', fontSize: 12, color: 'var(--ink-3)' }}>?</span>}
                <span>{u ? window.USERS[u].name : '비로그인 방문자'}</span>
                {current === u && <span style={{ marginLeft: 'auto' }}>✓</span>}
              </button>
            ))}
          </div>
        </div>
      )}
      <button
        className="btn"
        style={{ borderRadius: 'var(--r-pill)', padding: '8px 14px', background: 'var(--ink)', color: 'var(--paper-2)', borderColor: 'var(--ink)', boxShadow: 'var(--shadow-lg)' }}
        onClick={() => setOpen(!open)}
      >
        {current ? <><span className={`avatar-mini ${current.toLowerCase()}`} style={{ width: 22, height: 22, fontSize: 11 }}>{current}</span><span>{window.USERS[current].name}으로 보는 중</span></> : '비로그인으로 보는 중'}
        <span>▾</span>
      </button>
    </div>
  );
}

Object.assign(window, { AdminHomePage, AdminMyPage, AdminAboutPage, AdminAccountPage, UserSwitcher });
