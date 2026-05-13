/* global React */
const { useState: useStateP4 } = React;

// ════════════════════════════════════════════
//  키워드 목록 (/keyword)
// ════════════════════════════════════════════
function KeywordListPage() {
  const current = window.KEYWORDS[0];
  const past = window.KEYWORDS.slice(1);
  return (
    <div className="container narrow fade-in" style={{ maxWidth: 760 }}>
      <div style={{ textAlign: 'center', marginBottom: 28 }}>
        <div className="hand" style={{ fontSize: 22, color: 'var(--ink-3)' }}>AI keyword</div>
        <h1 className="page-title" style={{ fontSize: 30 }}>이번 주의 키워드</h1>
        <div className="serif" style={{ color: 'var(--ink-2)', marginTop: 6 }}>AI가 던진 단어로, 각자의 글을 씁니다.</div>
      </div>

      {/* 현재 키워드 카드 (큼직하게) */}
      <CurrentKeywordCard k={current} />

      <h3 className="section-title" style={{ marginTop: 40, marginBottom: 12 }}>지난 키워드</h3>
      <div className="col gap-12">
        {past.map((k) => (
          <a key={k.id} href={`#/keyword/${k.id}`} className="card lift" style={{ padding: '16px 20px' }}>
            <div className="row-between">
              <div className="row gap-12">
                <span style={{ fontSize: 24 }}>🎲</span>
                <div>
                  <div className="serif" style={{ fontSize: 18, fontWeight: 600 }}>"{k.keyword}"</div>
                  <div className="meta" style={{ marginTop: 2 }}>{k.suggestedAt}</div>
                </div>
              </div>
              <div className="row gap-12">
                <span style={{ fontSize: 13 }}>Y {k.yEssay ? '✅' : '⏳'}</span>
                <span style={{ fontSize: 13 }}>H {k.hEssay ? '✅' : '⏳'}</span>
                {k.comments > 0 && <span className="meta">💬 {k.comments}</span>}
              </div>
            </div>
          </a>
        ))}
      </div>
    </div>
  );
}

function CurrentKeywordCard({ k }) {
  return (
    <a href={`#/keyword/${k.id}`} className="card lift" style={{ padding: '40px 28px', background: 'linear-gradient(180deg, oklch(0.95 0.03 80) 0%, var(--paper-2) 100%)', borderColor: 'var(--y-line)' }}>
      <div style={{ textAlign: 'center', marginBottom: 24 }}>
        <div style={{ fontSize: 40, marginBottom: 8 }}>🎲</div>
        <div className="hand" style={{ fontSize: 22, color: 'var(--ink-3)' }}>이번 주의 키워드</div>
        <div className="serif" style={{ fontSize: 44, fontWeight: 600, letterSpacing: '-0.03em', marginTop: 8 }}>
          "{k.keyword}"
        </div>
        <div className="meta" style={{ marginTop: 8 }}>{k.suggestedAt} · AI가 골라준 단어</div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        {['Y', 'H'].map((u) => {
          const essay = u === 'Y' ? k.yEssay : k.hEssay;
          const cls = u === 'Y' ? 'y' : 'h';
          return (
            <div
              key={u}
              className="card-flat"
              style={{
                padding: 18,
                background: essay ? (u === 'Y' ? 'var(--y-soft)' : 'var(--h-soft)') : 'var(--paper)',
                border: '1px solid',
                borderColor: essay ? (u === 'Y' ? 'var(--y-line)' : 'var(--h-line)') : 'var(--line)',
                textAlign: 'center',
              }}
            >
              <span className={`avatar-mini ${cls}`} style={{ width: 36, height: 36, fontSize: 14, margin: '0 auto', display: 'flex' }}>{u}</span>
              <div className="serif" style={{ fontSize: 14, fontWeight: 600, marginTop: 8 }}>{window.USERS[u].name}</div>
              {essay ? (
                <>
                  <div className="hand" style={{ fontSize: 18, color: u === 'Y' ? 'var(--y-deep)' : 'var(--h-deep)', marginTop: 4 }}>✍️ 작성 완료</div>
                  <div style={{ fontSize: 12, color: 'var(--ink-3)', marginTop: 4 }}>둘 다 완성 시 공개</div>
                </>
              ) : (
                <>
                  <div className="hand" style={{ fontSize: 18, color: 'var(--ink-3)', marginTop: 4 }}>⏳ 작성 대기</div>
                  <div style={{ fontSize: 12, color: 'var(--ink-3)', marginTop: 4 }}>1,000자 이내</div>
                </>
              )}
            </div>
          );
        })}
      </div>
    </a>
  );
}

// ════════════════════════════════════════════
//  키워드 상세 (/keyword/[id])
// ════════════════════════════════════════════
function KeywordDetailPage({ id }) {
  const k = window.KEYWORDS.find((x) => x.id === id);
  const [mobileTab, setMobileTab] = useStateP4('Y');
  const [showWriteModal, setShowWriteModal] = useStateP4(false);
  if (!k) return <div className="container narrow">찾을 수 없어요.</div>;

  const user = window.CURRENT_USER;
  const myEssay = user === 'Y' ? k.yEssay : (user === 'H' ? k.hEssay : null);
  const myMissing = user && !myEssay;
  const bothDone = k.yEssay && k.hEssay;

  return (
    <div className="container fade-in" style={{ maxWidth: 1080 }}>
      <a href="#/keyword" className="btn btn-ghost btn-sm" style={{ marginBottom: 20 }}>← 키워드 목록</a>

      {/* 키워드 헤더 */}
      <div className="card" style={{ padding: '36px 28px', marginBottom: 24, background: 'linear-gradient(180deg, oklch(0.95 0.03 80) 0%, var(--paper-2) 100%)', textAlign: 'center' }}>
        <div style={{ fontSize: 32, marginBottom: 4 }}>🎲</div>
        <div className="hand" style={{ fontSize: 20, color: 'var(--ink-3)' }}>키워드</div>
        <div className="serif" style={{ fontSize: 40, fontWeight: 600, letterSpacing: '-0.03em', marginTop: 6 }}>"{k.keyword}"</div>
        <div className="meta" style={{ marginTop: 8 }}>{k.suggestedAt}</div>
      </div>

      {/* 내가 안 썼다면 — 작성 안내 */}
      {myMissing && (
        <div className="card y" style={{ marginBottom: 20, padding: 18, background: user === 'Y' ? 'var(--y-soft)' : 'var(--h-soft)', borderColor: user === 'Y' ? 'var(--y-line)' : 'var(--h-line)' }}>
          <div className="row-between">
            <div className="row gap-12">
              <span className={`avatar-mini ${user.toLowerCase()}`}>{user}</span>
              <div>
                <div style={{ fontSize: 14, fontWeight: 500 }}>아직 글을 쓰지 않으셨어요.</div>
                <div className="meta">상대방의 글은 당신이 완성해야 보입니다.</div>
              </div>
            </div>
            <button className="btn btn-primary" onClick={() => setShowWriteModal(true)}>✎ 지금 쓰기</button>
          </div>
        </div>
      )}

      {/* 모바일 탭 */}
      <div className="row gap-4 kw-mobile-tab" style={{ marginBottom: 14, padding: 4, background: 'var(--paper-ink)', borderRadius: 'var(--r-md)', display: 'none' }}>
        <button className={`flex-1 btn btn-sm ${mobileTab === 'Y' ? 'btn-y' : 'btn-ghost'}`} onClick={() => setMobileTab('Y')}>Y · 대영</button>
        <button className={`flex-1 btn btn-sm ${mobileTab === 'H' ? 'btn-h' : 'btn-ghost'}`} onClick={() => setMobileTab('H')}>H · 희서</button>
      </div>

      {/* Split */}
      <div className="split kw-split">
        <KeywordPane essay={k.yEssay} user="Y" blind={!bothDone && user !== 'Y'} hidden={mobileTab !== 'Y'} />
        <KeywordPane essay={k.hEssay} user="H" blind={!bothDone && user !== 'H'} hidden={mobileTab !== 'H'} />
      </div>

      {!bothDone && (
        <div className="card-flat" style={{ marginTop: 16, padding: 14, background: 'var(--paper-ink)', textAlign: 'center', border: '1px dashed var(--line-2)' }}>
          <span className="meta">둘 다 완성하면 동시에 공개됩니다. 그때까지는 서로의 글이 보이지 않아요.</span>
        </div>
      )}

      {bothDone && <CommentArea count={k.comments} />}

      {showWriteModal && (
        <Modal onClose={() => setShowWriteModal(false)} title={`"${k.keyword}" — ${window.USERS[user].name}의 글`}>
          <div className="row-between" style={{ marginBottom: 8 }}>
            <span className="meta">상대방은 당신의 글이 끝날 때까지 기다립니다.</span>
            <span className="meta">0/1000</span>
          </div>
          <textarea className="textarea" rows={10} placeholder={`"${k.keyword}"에 대한 글을 적어주세요…`} />
          <div className="row-between" style={{ marginTop: 12 }}>
            <button className="btn" onClick={() => setShowWriteModal(false)}>나중에</button>
            <div className="row gap-8">
              <button className="btn">임시저장</button>
              <button className="btn btn-primary">완성 · 봉인</button>
            </div>
          </div>
        </Modal>
      )}

      <style>{`
        @media (max-width: 880px) {
          .kw-mobile-tab { display: flex !important; }
          .kw-split { grid-template-columns: 1fr !important; }
          .kw-pane-hidden { display: none; }
        }
      `}</style>
    </div>
  );
}

function KeywordPane({ essay, user, blind, hidden }) {
  const cls = user === 'Y' ? 'y' : 'h';
  return (
    <div className={`split-pane ${cls}-pane ${hidden ? 'kw-pane-hidden' : ''}`}>
      <div className="row gap-8" style={{ marginBottom: 16 }}>
        <span className={`avatar-mini ${cls}`}>{user}</span>
        <div>
          <div style={{ fontSize: 13, fontWeight: 500, color: user === 'Y' ? 'var(--y-deep)' : 'var(--h-deep)' }}>
            {window.USERS[user].name}
          </div>
          <div className="hand" style={{ fontSize: 15, color: 'var(--ink-4)' }}>
            {essay ? `${essay.writtenAt} 작성 완료` : '대기 중'}
          </div>
        </div>
      </div>

      {!essay ? (
        // 미작성
        <div style={{ padding: '60px 12px', textAlign: 'center', background: 'oklch(0.97 0.015 80 / 0.5)', borderRadius: 'var(--r-md)', border: '1px dashed var(--line)' }}>
          <div style={{ fontSize: 32, opacity: 0.4 }}>⏳</div>
          <div className="hand" style={{ fontSize: 22, color: 'var(--ink-3)', marginTop: 8 }}>아직 쓰지 않았어요</div>
          <div className="meta" style={{ marginTop: 8 }}>{window.USERS[user].name}을(를) 기다리고 있어요</div>
        </div>
      ) : blind ? (
        // 블라인드 (작성은 했지만 상대가 안 써서 가려진 상태)
        <div style={{ padding: '60px 12px', textAlign: 'center', background: 'oklch(0.97 0.015 80 / 0.6)', borderRadius: 'var(--r-md)', border: '1px solid var(--line)', position: 'relative', overflow: 'hidden' }}>
          <div style={{
            position: 'absolute', inset: 0,
            backgroundImage: 'repeating-linear-gradient(45deg, oklch(0.92 0.02 80) 0 8px, transparent 8px 16px)',
            opacity: 0.7,
          }} />
          <div style={{ position: 'relative' }}>
            <div style={{ fontSize: 32, opacity: 0.5 }}>🔒</div>
            <div className="hand" style={{ fontSize: 22, color: 'var(--ink-3)', marginTop: 8 }}>봉인됨</div>
            <div className="meta" style={{ marginTop: 8 }}>{window.USERS[user].name}이(가) 글을 완성했어요</div>
            <div className="meta" style={{ marginTop: 4 }}>당신이 쓰면 동시에 공개돼요</div>
          </div>
        </div>
      ) : (
        // 공개됨
        <>
          <h3 className="serif" style={{ fontSize: 22, marginBottom: 14, lineHeight: 1.4 }}>{essay.title}</h3>
          <div className="prose" style={{ maxHeight: 420, overflowY: 'auto', paddingRight: 6, fontSize: 16 }}>
            {essay.content.split('\n').map((p, i) => p.trim() ? <p key={i}>{p}</p> : null)}
          </div>
        </>
      )}
    </div>
  );
}

Object.assign(window, { KeywordListPage, KeywordDetailPage });
