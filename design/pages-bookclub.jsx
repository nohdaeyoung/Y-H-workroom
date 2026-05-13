/* global React */
const { useState: useStateP5 } = React;

// ════════════════════════════════════════════
//  독서모임 목록 (/bookclub)
// ════════════════════════════════════════════
function BookclubListPage() {
  return (
    <div className="container narrow fade-in" style={{ maxWidth: 760 }}>
      <div className="row-between" style={{ marginBottom: 28 }}>
        <div>
          <div className="hand" style={{ fontSize: 22, color: 'var(--ink-3)' }}>book club</div>
          <h1 className="page-title">독서 모임</h1>
          <div className="serif" style={{ color: 'var(--ink-2)', marginTop: 4 }}>한 권의 책, 한 시간의 대화.</div>
        </div>
        {window.CURRENT_USER && (
          <button className="btn btn-primary"><span>🎙</span> 녹음 업로드</button>
        )}
      </div>

      <div className="col gap-16">
        {window.BOOKCLUBS.map((b) => (
          <a key={b.id} href={`#/bookclub/${b.id}`} className="card lift" style={{ padding: '20px 22px' }}>
            <div className="row gap-20">
              <div style={{
                width: 80, height: 110, flexShrink: 0,
                background: `linear-gradient(135deg, oklch(0.78 0.05 ${30 + b.id.charCodeAt(2) * 20}), oklch(0.55 0.07 ${(30 + b.id.charCodeAt(2) * 20) % 360}))`,
                borderRadius: '2px 6px 6px 2px',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: '2px 2px 6px oklch(0.3 0.04 70 / 0.15)',
                position: 'relative',
                overflow: 'hidden',
              }}>
                <div style={{ position: 'absolute', left: 2, top: 0, bottom: 0, width: 4, background: 'oklch(0.3 0.05 60 / 0.3)' }} />
                <div className="serif" style={{ color: 'oklch(0.98 0.01 80)', fontSize: 11, padding: '0 8px', textAlign: 'center', fontWeight: 500, lineHeight: 1.3 }}>
                  {b.bookTitle}
                </div>
              </div>
              <div className="flex-1">
                <div className="hand" style={{ fontSize: 17, color: 'var(--ink-3)' }}>독서모임 #{b.id.split('-')[1]}</div>
                <h3 className="serif" style={{ fontSize: 20, marginTop: 2 }}>「{b.bookTitle}」</h3>
                <div className="meta" style={{ marginTop: 4 }}>{b.bookAuthor}</div>
                <div className="row gap-12" style={{ marginTop: 12 }}>
                  <span className="meta">📅 {b.meetingDate}</span>
                  <span className="meta">⏱ {b.duration}</span>
                  {b.comments > 0 && <span className="meta">💬 {b.comments}</span>}
                </div>
              </div>
            </div>
          </a>
        ))}
      </div>
    </div>
  );
}

// ════════════════════════════════════════════
//  독서모임 상세 — 대화형 (/bookclub/[id])
// ════════════════════════════════════════════
function BookclubDetailPage({ id }) {
  const b = window.BOOKCLUBS.find((x) => x.id === id);
  const [playing, setPlaying] = useStateP5(false);
  if (!b) return <div className="container narrow">찾을 수 없어요.</div>;
  const transcript = b.transcript.length ? b.transcript : window.BOOKCLUBS[0].transcript;

  return (
    <div className="container narrow fade-in" style={{ maxWidth: 720 }}>
      <a href="#/bookclub" className="btn btn-ghost btn-sm" style={{ marginBottom: 20 }}>← 독서모임 목록</a>

      {/* 책 헤더 */}
      <div className="card" style={{ padding: '24px 24px 28px', marginBottom: 16 }}>
        <div className="row gap-20">
          <div style={{
            width: 100, height: 140, flexShrink: 0,
            background: 'linear-gradient(135deg, oklch(0.62 0.10 25), oklch(0.42 0.08 30))',
            borderRadius: '2px 8px 8px 2px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '3px 3px 10px oklch(0.3 0.04 70 / 0.18)',
            position: 'relative', overflow: 'hidden',
          }}>
            <div style={{ position: 'absolute', left: 3, top: 0, bottom: 0, width: 4, background: 'oklch(0.3 0.05 60 / 0.3)' }} />
            <div className="serif" style={{ color: 'white', fontSize: 14, padding: '0 12px', textAlign: 'center', fontWeight: 600, lineHeight: 1.35 }}>
              {b.bookTitle}
            </div>
          </div>
          <div className="flex-1">
            <div className="hand" style={{ fontSize: 18, color: 'var(--ink-3)' }}>독서모임 #{b.id.split('-')[1]}</div>
            <h1 className="serif" style={{ fontSize: 26, marginTop: 4, lineHeight: 1.3 }}>「{b.bookTitle}」</h1>
            <div style={{ color: 'var(--ink-2)', marginTop: 4 }}>{b.bookAuthor}</div>
            <div className="row gap-12" style={{ marginTop: 12 }}>
              <span className="chip" style={{ fontSize: 12 }}>📅 {b.meetingDate}</span>
              <span className="chip" style={{ fontSize: 12 }}>⏱ {b.duration}</span>
            </div>
          </div>
        </div>

        {/* 오디오 플레이어 */}
        <div className="row gap-12" style={{ marginTop: 20, padding: '10px 14px', background: 'var(--paper)', borderRadius: 'var(--r-md)', border: '1px solid var(--line)' }}>
          <button className="btn btn-sm" style={{ width: 36, height: 36, padding: 0, borderRadius: '50%' }} onClick={() => setPlaying(!playing)}>
            {playing ? '⏸' : '▶'}
          </button>
          <div className="flex-1">
            <div style={{ height: 4, background: 'var(--paper-deep)', borderRadius: 2, position: 'relative' }}>
              <div style={{ position: 'absolute', left: 0, top: 0, height: '100%', width: '32%', background: 'var(--ink)', borderRadius: 2 }} />
            </div>
            <div className="row-between" style={{ marginTop: 4 }}>
              <span className="meta">26:43</span>
              <span className="meta">{b.duration}</span>
            </div>
          </div>
          <span className="meta">🎧 녹음 듣기</span>
        </div>
      </div>

      {/* 대화 (메신저 스타일) */}
      <div className="card-flat" style={{ padding: '24px 16px 28px', background: 'var(--paper-2)', border: '1px solid var(--line)', borderRadius: 'var(--r-lg)' }}>
        <div className="hand" style={{ textAlign: 'center', fontSize: 18, color: 'var(--ink-4)', marginBottom: 18 }}>— 대화 시작 —</div>
        <div className="col gap-12">
          {transcript.map((t, i) => {
            const isY = t.speaker === 'Y';
            const sameSpeaker = i > 0 && transcript[i - 1].speaker === t.speaker;
            return (
              <div key={i} style={{ display: 'flex', justifyContent: isY ? 'flex-start' : 'flex-end', gap: 8 }}>
                {isY && (
                  <span className="avatar-mini y" style={{ visibility: sameSpeaker ? 'hidden' : 'visible', alignSelf: 'flex-end' }}>Y</span>
                )}
                <div style={{ maxWidth: '78%', display: 'flex', flexDirection: 'column', alignItems: isY ? 'flex-start' : 'flex-end' }}>
                  {!sameSpeaker && (
                    <div style={{ fontSize: 12, color: isY ? 'var(--y-deep)' : 'var(--h-deep)', fontWeight: 500, marginBottom: 4, padding: '0 6px' }}>
                      {window.USERS[t.speaker].name}
                    </div>
                  )}
                  <div
                    className="serif"
                    style={{
                      padding: '12px 16px',
                      background: isY ? 'oklch(0.95 0.045 82)' : 'oklch(0.95 0.025 250)',
                      borderRadius: isY ? '4px 14px 14px 14px' : '14px 4px 14px 14px',
                      border: '1px solid',
                      borderColor: isY ? 'var(--y-line)' : 'var(--h-line)',
                      fontSize: 15.5,
                      lineHeight: 1.7,
                      color: 'var(--ink)',
                    }}
                  >
                    {t.text}
                  </div>
                </div>
                {!isY && (
                  <span className="avatar-mini h" style={{ visibility: sameSpeaker ? 'hidden' : 'visible', alignSelf: 'flex-end' }}>H</span>
                )}
              </div>
            );
          })}
        </div>
        <div className="hand" style={{ textAlign: 'center', fontSize: 18, color: 'var(--ink-4)', marginTop: 18 }}>— 대화 끝 —</div>
      </div>

      <CommentArea count={b.comments} />
    </div>
  );
}

Object.assign(window, { BookclubListPage, BookclubDetailPage });
