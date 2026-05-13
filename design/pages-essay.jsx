/* global React */
const { useState: useStateP2, useMemo: useMemoP2 } = React;

// ════════════════════════════════════════════
//  에세이 — 나란히 읽기 메인 (/essay)
// ════════════════════════════════════════════
function EssayListPage({ go }) {
  const pairs = window.ESSAY_PAIRS;
  const [activePair, setActivePair] = useStateP2(pairs[0].id);
  const [mobileTab, setMobileTab] = useStateP2('Y'); // 모바일 탭
  const pair = pairs.find((p) => p.id === activePair);
  const yEssay = window.ESSAYS.find((e) => e.id === pair.y);
  const hEssay = window.ESSAYS.find((e) => e.id === pair.h);
  const idx = pairs.findIndex((p) => p.id === activePair);

  return (
    <div className="container fade-in" style={{ maxWidth: 1080 }}>
      {/* 헤더 */}
      <div style={{ marginBottom: 24 }}>
        <div className="row-between" style={{ alignItems: 'flex-end' }}>
          <div>
            <div className="hand" style={{ fontSize: 22, color: 'var(--ink-3)' }}>essay</div>
            <h1 className="page-title" style={{ fontSize: 32 }}>에세이, 나란히 읽기</h1>
            <div className="serif" style={{ color: 'var(--ink-2)', marginTop: 4 }}>같은 시간, 다른 시선</div>
          </div>
          {window.CURRENT_USER && (
            <a href="#/essay/write" className="btn btn-primary">
              <span>✎</span> 새 에세이
            </a>
          )}
        </div>
      </div>

      {/* 페어 셀렉터 */}
      <div className="row gap-8" style={{ overflowX: 'auto', paddingBottom: 12, marginBottom: 20 }}>
        {pairs.map((p) => (
          <button
            key={p.id}
            onClick={() => setActivePair(p.id)}
            className={`chip ${p.id === activePair ? '' : ''}`}
            style={{
              fontSize: 13, padding: '8px 14px',
              background: p.id === activePair ? 'var(--ink)' : 'var(--paper-2)',
              color: p.id === activePair ? 'var(--paper-2)' : 'var(--ink-2)',
              borderColor: p.id === activePair ? 'var(--ink)' : 'var(--line)',
              cursor: 'pointer', whiteSpace: 'nowrap',
            }}
          >
            <span className="hand" style={{ fontSize: 16 }}>{p.date}</span>
            <span style={{ margin: '0 6px', opacity: 0.5 }}>·</span>
            <span>{p.topic}</span>
          </button>
        ))}
      </div>

      {/* 모바일 탭 */}
      <div className="row gap-4 mobile-only" style={{ marginBottom: 14, padding: 4, background: 'var(--paper-ink)', borderRadius: 'var(--r-md)', display: 'none' }}>
        <button
          className={`flex-1 btn btn-sm ${mobileTab === 'Y' ? 'btn-y' : 'btn-ghost'}`}
          onClick={() => setMobileTab('Y')}
        >Y · {yEssay.title}</button>
        <button
          className={`flex-1 btn btn-sm ${mobileTab === 'H' ? 'btn-h' : 'btn-ghost'}`}
          onClick={() => setMobileTab('H')}
        >H · {hEssay.title}</button>
      </div>

      {/* Split */}
      <div className="split essay-split">
        <div className={`split-pane y-pane ${mobileTab === 'Y' ? '' : 'pane-hidden'}`}>
          <EssayPane essay={yEssay} color="y" />
        </div>
        <div className={`split-pane h-pane ${mobileTab === 'H' ? '' : 'pane-hidden'}`}>
          <EssayPane essay={hEssay} color="h" />
        </div>
      </div>

      {/* 페어 네비 */}
      <div className="row-between" style={{ marginTop: 24 }}>
        <button
          className="btn"
          disabled={idx === pairs.length - 1}
          onClick={() => setActivePair(pairs[idx + 1]?.id || activePair)}
        >← 이전 페어</button>
        <span className="meta">{idx + 1} / {pairs.length}</span>
        <button
          className="btn"
          disabled={idx === 0}
          onClick={() => setActivePair(pairs[idx - 1]?.id || activePair)}
        >다음 페어 →</button>
      </div>

      <style>{`
        @media (max-width: 880px) {
          .mobile-only { display: flex !important; }
          .essay-split { grid-template-columns: 1fr !important; }
          .pane-hidden { display: none; }
        }
      `}</style>
    </div>
  );
}

function EssayPane({ essay, color }) {
  const auth = window.USERS[essay.author];
  const isY = color === 'y';
  return (
    <div>
      <div className="row gap-8" style={{ marginBottom: 16 }}>
        <span className={`avatar-mini ${color}`}>{essay.author}</span>
        <div>
          <div style={{ fontSize: 13, fontWeight: 500, color: isY ? 'var(--y-deep)' : 'var(--h-deep)' }}>
            {auth.name}
          </div>
          <div className="hand" style={{ fontSize: 15, color: 'var(--ink-4)' }}>{essay.date}</div>
        </div>
      </div>
      <h2 className="serif" style={{ fontSize: 24, marginBottom: 16, lineHeight: 1.4, letterSpacing: '-0.02em' }}>
        {essay.title}
      </h2>
      <div className="row gap-4" style={{ marginBottom: 16 }}>
        {essay.tags.map((t) => <span key={t} className="chip" style={{ fontSize: 11 }}>#{t}</span>)}
      </div>
      <div className="prose" style={{ maxHeight: 460, overflowY: 'auto', paddingRight: 6 }}>
        {essay.content.map((p, i) => <p key={i}>{p}</p>)}
      </div>
      <CommentArea count={essay.comments} color={color} />
    </div>
  );
}

// ════════════════════════════════════════════
//  에세이 단독 보기 (/essay/[id])
// ════════════════════════════════════════════
function EssayDetailPage({ id }) {
  const e = window.ESSAYS.find((x) => x.id === id);
  if (!e) return <div className="container narrow">에세이를 찾을 수 없어요.</div>;
  const auth = window.USERS[e.author];
  const cls = e.author === 'Y' ? 'y' : 'h';
  return (
    <div className="container narrow fade-in" style={{ maxWidth: 680 }}>
      <a href="#/essay" className="btn btn-ghost btn-sm" style={{ marginBottom: 24 }}>← 나란히 보기로</a>
      <div style={{ textAlign: 'center', padding: '20px 0 32px' }}>
        <div className="row gap-8" style={{ justifyContent: 'center', marginBottom: 16 }}>
          <span className={`avatar-mini ${cls}`}>{e.author}</span>
          <div style={{ fontSize: 14 }}>
            <span style={{ fontWeight: 500, color: e.author === 'Y' ? 'var(--y-deep)' : 'var(--h-deep)' }}>{auth.name}</span>
            <span className="meta" style={{ marginLeft: 8 }}>{e.date}</span>
          </div>
        </div>
        <h1 className="serif" style={{ fontSize: 32, letterSpacing: '-0.025em', lineHeight: 1.3 }}>{e.title}</h1>
        <div className="row gap-4" style={{ justifyContent: 'center', marginTop: 14 }}>
          {e.tags.map((t) => <span key={t} className="chip" style={{ fontSize: 11 }}>#{t}</span>)}
        </div>
      </div>
      <div className="prose" style={{ fontSize: 18 }}>
        {e.content.map((p, i) => <p key={i}>{p}</p>)}
      </div>
      <div className="divider-dot" />
      <CommentArea count={e.comments} color={cls} />
    </div>
  );
}

// ════════════════════════════════════════════
//  에세이 쓰기 (/essay/write)
// ════════════════════════════════════════════
function EssayWritePage({ go }) {
  const [title, setTitle] = useStateP2('');
  const [body, setBody] = useStateP2('');
  const [tags, setTags] = useStateP2('');
  const [pub, setPub] = useStateP2('public');
  const user = window.CURRENT_USER || 'Y';
  const cls = user === 'Y' ? 'y' : 'h';
  return (
    <div className="container narrow fade-in" style={{ maxWidth: 760 }}>
      <div className="row-between" style={{ marginBottom: 24 }}>
        <div>
          <div className="hand" style={{ fontSize: 20, color: 'var(--ink-3)' }}>new essay</div>
          <h1 className="page-title" style={{ fontSize: 26 }}>새 에세이</h1>
        </div>
        <div className="row gap-8">
          <span className={`avatar-mini ${cls}`}>{user}</span>
          <span className="hand" style={{ fontSize: 17, color: 'var(--ink-3)' }}>{window.USERS[user].name}으로 쓰기</span>
        </div>
      </div>

      <div className="card" style={{ padding: 28 }}>
        <input
          className="input"
          style={{ fontSize: 22, fontFamily: 'var(--serif)', fontWeight: 600, border: 'none', background: 'transparent', padding: '8px 0', borderBottom: '1px solid var(--line)', borderRadius: 0 }}
          placeholder="제목"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />

        {/* 툴바 (TipTap 흉내) */}
        <div className="row gap-4" style={{ marginTop: 16, marginBottom: 8, padding: '6px 4px', borderBottom: '1px dashed var(--line)' }}>
          {['B', 'I', 'U', 'H', '"', '—', '·', '📷', '🔗'].map((t, i) => (
            <button key={i} className="btn btn-ghost btn-sm" style={{ padding: '4px 8px', minWidth: 28 }}>{t}</button>
          ))}
        </div>

        <textarea
          className="textarea"
          style={{ minHeight: 280, border: 'none', background: 'transparent', padding: '12px 0', fontSize: 17 }}
          placeholder="비가 오는 날이면…"
          value={body}
          onChange={(e) => setBody(e.target.value)}
        />

        <div style={{ borderTop: '1px solid var(--line)', paddingTop: 16, marginTop: 8 }}>
          <div className="row gap-12">
            <div className="flex-1">
              <label className="label">태그 (콤마로 구분)</label>
              <input className="input" placeholder="일상, 비, 골목" value={tags} onChange={(e) => setTags(e.target.value)} />
            </div>
            <div style={{ width: 200 }}>
              <label className="label">공개 범위</label>
              <select className="select" value={pub} onChange={(e) => setPub(e.target.value)}>
                <option value="public">공개</option>
                <option value="private">비공개</option>
                <option value="draft">임시저장</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      <div className="row-between" style={{ marginTop: 20 }}>
        <a href="#/essay" className="btn btn-ghost">취소</a>
        <div className="row gap-8">
          <button className="btn">임시저장</button>
          <button className="btn btn-primary">발행하기</button>
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { EssayListPage, EssayDetailPage, EssayWritePage });
