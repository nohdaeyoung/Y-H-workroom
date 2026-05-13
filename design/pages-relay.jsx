/* global React */
const { useState: useStateP3, useMemo: useMemoP3 } = React;

// ════════════════════════════════════════════
//  이어쓰기 목록 (/relay)
// ════════════════════════════════════════════
function RelayListPage() {
  const ongoing = window.RELAYS.filter((r) => r.status === 'ongoing');
  const completed = window.RELAYS.filter((r) => r.status === 'completed');
  return (
    <div className="container fade-in" style={{ maxWidth: 880 }}>
      <div className="row-between" style={{ marginBottom: 28 }}>
        <div>
          <div className="hand" style={{ fontSize: 22, color: 'var(--ink-3)' }}>relay</div>
          <h1 className="page-title">이어쓰기</h1>
          <div className="serif" style={{ color: 'var(--ink-2)', marginTop: 4 }}>한 사람이 한 문장, 그렇게 천천히.</div>
        </div>
        {window.CURRENT_USER && (
          <a href="#/relay/new" className="btn btn-primary"><span>＋</span> 새로 시작</a>
        )}
      </div>

      <h3 className="section-title" style={{ marginBottom: 12 }}>이어지는 중</h3>
      <div className="col gap-12" style={{ marginBottom: 32 }}>
        {ongoing.map((r) => <RelayCard key={r.id} relay={r} />)}
      </div>

      <h3 className="section-title" style={{ marginBottom: 12 }}>완결된 글</h3>
      <div className="col gap-12">
        {completed.map((r) => <RelayCard key={r.id} relay={r} />)}
      </div>
    </div>
  );
}

function RelayCard({ relay }) {
  const last = relay.sentences[relay.sentences.length - 1];
  return (
    <a href={`#/relay/${relay.id}`} className="card lift">
      <div className="row-between" style={{ alignItems: 'flex-start' }}>
        <div className="flex-1">
          <div className="row gap-8" style={{ marginBottom: 8 }}>
            {relay.status === 'completed' ? (
              <span className="chip" style={{ background: 'var(--paper-ink)' }}>완결 ✓</span>
            ) : (
              <span className="chip live">이어지는 중</span>
            )}
            <span className="meta">{relay.sentences.length}문장</span>
            <span className="meta">·</span>
            <span className="meta">{relay.updatedAt}</span>
          </div>
          <h3 className="serif" style={{ fontSize: 22, marginBottom: 8 }}>{relay.title}</h3>
          <p className="serif" style={{ color: 'var(--ink-2)', fontSize: 15.5, lineHeight: 1.7 }}>
            {relay.sentences[0].text}
            {relay.sentences.length > 1 && <span style={{ color: 'var(--ink-4)' }}> … </span>}
            {relay.sentences.length > 1 && <span>{last.text}</span>}
          </p>
        </div>
      </div>
    </a>
  );
}

// ════════════════════════════════════════════
//  이어쓰기 상세 (/relay/[id])
// ════════════════════════════════════════════
function RelayDetailPage({ id }) {
  const r = window.RELAYS.find((x) => x.id === id);
  const [newText, setNewText] = useStateP3('');
  if (!r) return <div className="container narrow">찾을 수 없어요.</div>;
  const user = window.CURRENT_USER;
  const lastAuthor = r.sentences[r.sentences.length - 1]?.author;
  const blocked = user && user === lastAuthor;

  return (
    <div className="container narrow fade-in" style={{ maxWidth: 680 }}>
      <a href="#/relay" className="btn btn-ghost btn-sm" style={{ marginBottom: 20 }}>← 이어쓰기 목록</a>

      <div style={{ textAlign: 'center', padding: '12px 0 28px' }}>
        <div className="hand" style={{ fontSize: 20, color: 'var(--ink-3)' }}>relay #{r.id.split('-')[1]}</div>
        <h1 className="serif" style={{ fontSize: 30, marginTop: 4 }}>{r.title}</h1>
        <div className="row gap-8" style={{ justifyContent: 'center', marginTop: 10 }}>
          {r.status === 'completed' ? (
            <span className="chip" style={{ background: 'var(--paper-ink)' }}>완결 ✓</span>
          ) : (
            <span className="chip live">이어지는 중</span>
          )}
          <span className="meta">{r.sentences.length}문장</span>
        </div>
      </div>

      {/* 문장 타임라인 */}
      <div style={{ position: 'relative', paddingLeft: 28 }}>
        <div style={{ position: 'absolute', left: 5, top: 8, bottom: 8, width: 2, background: 'var(--line)' }} />
        {r.sentences.map((s, i) => {
          const isMine = user && user === s.author;
          const showAuthor = !!user; // 비로그인 시 ???
          const author = showAuthor ? s.author : '???';
          const authCls = showAuthor ? (s.author === 'Y' ? 'y' : 'h') : 'unknown';
          return (
            <div key={i} style={{ position: 'relative', marginBottom: 20 }}>
              <div className={`timeline-dot ${showAuthor ? (s.author === 'Y' ? 'y' : 'h') : ''}`} style={{ position: 'absolute', left: -28, top: 12 }} />
              <div
                className="card-flat"
                style={{
                  padding: '14px 18px',
                  background: showAuthor
                    ? (s.author === 'Y' ? 'oklch(0.965 0.03 82)' : 'oklch(0.96 0.018 250)')
                    : 'var(--paper-2)',
                  border: '1px solid',
                  borderColor: showAuthor
                    ? (s.author === 'Y' ? 'var(--y-line)' : 'var(--h-line)')
                    : 'var(--line)',
                  borderRadius: 'var(--r-md)',
                }}
              >
                <div className="serif" style={{ fontSize: 16, lineHeight: 1.8 }}>{s.text}</div>
                <div className="row gap-8" style={{ justifyContent: 'flex-end', marginTop: 8, fontSize: 12, color: 'var(--ink-4)' }}>
                  <span className="hand" style={{ fontSize: 15 }}>— {author}</span>
                  <span>·</span>
                  <span>{s.date}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* 이어쓰기 입력 (로그인 + 직전 작성자 아닐 때) */}
      {r.status === 'ongoing' && user && (
        <div className="card" style={{ marginTop: 24, borderColor: user === 'Y' ? 'var(--y-line)' : 'var(--h-line)' }}>
          <div className="row gap-8" style={{ marginBottom: 12 }}>
            <span className={`avatar-mini ${user.toLowerCase()}`}>{user}</span>
            <div>
              <div style={{ fontSize: 14, fontWeight: 500 }}>{window.USERS[user].name}로 이어쓰기</div>
              {blocked && <div style={{ fontSize: 12, color: 'var(--danger)' }}>직전 문장의 작성자입니다. 상대를 기다려 주세요.</div>}
            </div>
            <span className="meta" style={{ marginLeft: 'auto' }}>{newText.length}/200</span>
          </div>
          <textarea
            className="textarea"
            placeholder="한 문장을 이어 적어주세요…"
            value={newText}
            maxLength={200}
            disabled={blocked}
            onChange={(e) => setNewText(e.target.value)}
            rows={3}
          />
          <div className="row-between" style={{ marginTop: 12 }}>
            <label className="meta" style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
              <input type="checkbox" /> 이 문장으로 완결 동의
            </label>
            <button className="btn btn-primary" disabled={blocked || !newText.trim()}>이어쓰기</button>
          </div>
        </div>
      )}
      {r.status === 'ongoing' && !user && (
        <div className="card-flat" style={{ marginTop: 24, padding: 16, textAlign: 'center', background: 'var(--paper-ink)', border: '1px dashed var(--line-2)' }}>
          <span className="meta">이어쓰기는 Y/H만 가능해요 — </span>
          <a href="#/login" style={{ color: 'var(--ink)', fontWeight: 500, textDecoration: 'underline' }}>로그인</a>
        </div>
      )}

      {/* 완결 동의 상태 */}
      {r.status === 'ongoing' && (
        <div className="row-between" style={{ marginTop: 16, padding: '12px 18px', background: 'var(--paper-ink)', borderRadius: 'var(--r-md)' }}>
          <span className="meta">완결 동의</span>
          <div className="row gap-12">
            <span style={{ fontSize: 13 }}>Y {r.yAgreed ? '✅' : '⬜'}</span>
            <span style={{ fontSize: 13 }}>H {r.hAgreed ? '✅' : '⬜'}</span>
            <span className="meta">둘 다 동의 시 완결</span>
          </div>
        </div>
      )}
    </div>
  );
}

// ════════════════════════════════════════════
//  이어쓰기 시작 (/relay/new)
// ════════════════════════════════════════════
function RelayNewPage() {
  const [title, setTitle] = useStateP3('');
  const [first, setFirst] = useStateP3('');
  const user = window.CURRENT_USER || 'Y';
  return (
    <div className="container narrow fade-in" style={{ maxWidth: 600 }}>
      <a href="#/relay" className="btn btn-ghost btn-sm">← 목록</a>
      <h1 className="page-title" style={{ marginTop: 16, marginBottom: 8 }}>이어쓰기 시작</h1>
      <div className="serif" style={{ color: 'var(--ink-2)', marginBottom: 28 }}>제목과 첫 문장을 적어주세요.</div>

      <div className="card">
        <label className="label">제목</label>
        <input className="input" placeholder="비가 오는 날이면" value={title} onChange={(e) => setTitle(e.target.value)} />
        <div style={{ marginTop: 18 }}>
          <div className="row-between" style={{ marginBottom: 6 }}>
            <label className="label" style={{ marginBottom: 0 }}>첫 문장 (200자 이내)</label>
            <span className="meta">{first.length}/200</span>
          </div>
          <textarea className="textarea" rows={4} maxLength={200} value={first} onChange={(e) => setFirst(e.target.value)} placeholder="비가 오는 날이면 항상 그 골목이 생각난다." />
        </div>
        <div className="row gap-8" style={{ marginTop: 14, padding: '10px 12px', background: 'var(--paper-ink)', borderRadius: 'var(--r-md)' }}>
          <span className={`avatar-mini ${user.toLowerCase()}`}>{user}</span>
          <span className="meta">{window.USERS[user].name}로 시작합니다. 다음 문장은 상대만 적을 수 있어요.</span>
        </div>
      </div>
      <div className="row-between" style={{ marginTop: 20 }}>
        <a href="#/relay" className="btn btn-ghost">취소</a>
        <button className="btn btn-primary">시작하기</button>
      </div>
    </div>
  );
}

Object.assign(window, { RelayListPage, RelayDetailPage, RelayNewPage });
