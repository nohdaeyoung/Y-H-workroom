/* global React */
const { useState: useStateP6 } = React;

// ════════════════════════════════════════════
//  사진+글 갤러리 (/photostory)
// ════════════════════════════════════════════
function PhotostoryListPage() {
  const [filter, setFilter] = useStateP6('all');
  const items = window.PHOTOSTORIES.filter((p) => {
    if (filter === 'all') return true;
    if (filter === 'h2y') return p.photoAuthor === 'H' && p.textAuthor === 'Y';
    if (filter === 'y2h') return p.photoAuthor === 'Y' && p.textAuthor === 'H';
    return true;
  });

  return (
    <div className="container fade-in" style={{ maxWidth: 1080 }}>
      <div style={{ textAlign: 'center', marginBottom: 32 }}>
        <div className="hand" style={{ fontSize: 22, color: 'var(--ink-3)' }}>photo + words</div>
        <h1 className="page-title" style={{ fontSize: 32 }}>사진 + 글</h1>
        <div className="serif" style={{ color: 'var(--ink-2)', marginTop: 6, fontSize: 16 }}>
          한 사람이 찍고, 한 사람이 쓰다
        </div>
      </div>

      <div className="row-between" style={{ marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
        <div className="row gap-4" style={{ padding: 4, background: 'var(--paper-ink)', borderRadius: 'var(--r-md)' }}>
          {[
            { id: 'all', label: '전체' },
            { id: 'h2y', label: '📸H → ✍️Y' },
            { id: 'y2h', label: '📸Y → ✍️H' },
          ].map((f) => (
            <button
              key={f.id}
              onClick={() => setFilter(f.id)}
              className="btn btn-sm"
              style={{
                background: filter === f.id ? 'var(--paper-2)' : 'transparent',
                border: 'none',
                color: filter === f.id ? 'var(--ink)' : 'var(--ink-3)',
                fontWeight: filter === f.id ? 500 : 400,
                boxShadow: filter === f.id ? 'var(--shadow-sm)' : 'none',
              }}
            >{f.label}</button>
          ))}
        </div>
        {window.CURRENT_USER && (
          <button className="btn btn-primary"><span>📷</span> 사진 올리기</button>
        )}
      </div>

      {/* 갤러리 그리드 (메이슨리 느낌) */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
        gap: 20,
      }}>
        {items.map((p, idx) => <PhotoCard key={p.id} story={p} idx={idx} />)}
      </div>
    </div>
  );
}

function PhotoCard({ story, idx }) {
  const waiting = story.status === 'waiting';
  const heights = [240, 280, 220, 300, 260]; // 갤러리 변주
  const h = heights[idx % heights.length];
  return (
    <a href={`#/photostory/${story.id}`} className="lift" style={{ display: 'block', borderRadius: 'var(--r-lg)', overflow: 'hidden', background: 'var(--paper-2)', border: '1px solid var(--line)' }}>
      <div style={{ position: 'relative' }}>
        <Photo hue={story.photoHue} height={h} idx={idx} />
        {story.photoCount > 1 && (
          <div style={{ position: 'absolute', top: 10, right: 10, padding: '3px 8px', background: 'oklch(0.2 0.02 50 / 0.65)', color: 'white', fontSize: 11, borderRadius: 'var(--r-pill)' }}>
            📷 {story.photoCount}
          </div>
        )}
        {waiting && (
          <div style={{ position: 'absolute', bottom: 10, left: 10, padding: '4px 10px', background: 'oklch(0.97 0.03 80 / 0.95)', color: 'var(--ink-2)', fontSize: 11, borderRadius: 'var(--r-pill)', fontWeight: 500 }}>
            ⏳ {window.USERS[story.textAuthor].name}의 글 대기중
          </div>
        )}
      </div>
      <div style={{ padding: '14px 16px 16px' }}>
        <div className="row gap-4" style={{ fontSize: 11, color: 'var(--ink-3)', letterSpacing: '0.04em' }}>
          <span style={{ color: story.photoAuthor === 'Y' ? 'var(--y-deep)' : 'var(--h-deep)', fontWeight: 600 }}>
            📸 {story.photoAuthor}
          </span>
          <span>→</span>
          <span style={{ color: story.textAuthor === 'Y' ? 'var(--y-deep)' : 'var(--h-deep)', fontWeight: 600, opacity: waiting ? 0.4 : 1 }}>
            ✍️ {story.textAuthor}
          </span>
          <span style={{ marginLeft: 'auto' }}>{story.photoUploadedAt.slice(5)}</span>
        </div>
        <h3 className="serif" style={{ fontSize: 17, marginTop: 8, lineHeight: 1.4 }}>{story.photoTitle}</h3>
        {story.text && (
          <p className="serif" style={{ fontSize: 14, color: 'var(--ink-2)', marginTop: 8, lineHeight: 1.7, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
            {story.text.split('\n')[0]}
          </p>
        )}
      </div>
    </a>
  );
}

// ════════════════════════════════════════════
//  사진+글 상세 (/photostory/[id])
// ════════════════════════════════════════════
function PhotostoryDetailPage({ id }) {
  const p = window.PHOTOSTORIES.find((x) => x.id === id);
  const [activePhoto, setActivePhoto] = useStateP6(0);
  const [showWrite, setShowWrite] = useStateP6(false);
  if (!p) return <div className="container narrow">찾을 수 없어요.</div>;
  const user = window.CURRENT_USER;
  const canWrite = user === p.textAuthor && p.status === 'waiting';

  return (
    <div className="container narrow fade-in" style={{ maxWidth: 740 }}>
      <a href="#/photostory" className="btn btn-ghost btn-sm" style={{ marginBottom: 20 }}>← 갤러리</a>

      {/* 사진 (메인) */}
      <div style={{ marginBottom: 20 }}>
        <Photo hue={p.photoHue} height={460} idx={activePhoto} />
        {p.photoCount > 1 && (
          <div className="row gap-8" style={{ marginTop: 10, justifyContent: 'center' }}>
            {Array.from({ length: p.photoCount }).map((_, i) => (
              <button key={i} onClick={() => setActivePhoto(i)} style={{
                width: 8, height: 8, borderRadius: '50%',
                background: i === activePhoto ? 'var(--ink)' : 'var(--line-2)',
                border: 'none', cursor: 'pointer',
              }} />
            ))}
          </div>
        )}
      </div>

      {/* 사진 정보 */}
      <div className="row-between" style={{ marginBottom: 28 }}>
        <div className="row gap-8">
          <span className={`avatar-mini ${p.photoAuthor.toLowerCase()}`}>{p.photoAuthor}</span>
          <div>
            <div style={{ fontSize: 13, color: 'var(--ink-3)' }}>📸 사진</div>
            <div className="hand" style={{ fontSize: 17, color: p.photoAuthor === 'Y' ? 'var(--y-deep)' : 'var(--h-deep)' }}>
              {window.USERS[p.photoAuthor].name} · {p.photoUploadedAt}
            </div>
          </div>
        </div>
        {p.photoTitle && (
          <div className="hand" style={{ fontSize: 18, color: 'var(--ink-3)', textAlign: 'right' }}>"{p.photoTitle}"</div>
        )}
      </div>

      {/* 글 영역 */}
      {p.status === 'completed' && p.text ? (
        <div className="card" style={{ padding: '28px 28px 24px', background: p.textAuthor === 'Y' ? 'linear-gradient(180deg, var(--y-soft) 0%, var(--paper-2) 60%)' : 'linear-gradient(180deg, var(--h-soft) 0%, var(--paper-2) 60%)', borderColor: p.textAuthor === 'Y' ? 'var(--y-line)' : 'var(--h-line)' }}>
          <div className="row gap-8" style={{ marginBottom: 16 }}>
            <span className={`avatar-mini ${p.textAuthor.toLowerCase()}`}>{p.textAuthor}</span>
            <div>
              <div style={{ fontSize: 13, color: 'var(--ink-3)' }}>✍️ 글</div>
              <div className="hand" style={{ fontSize: 17, color: p.textAuthor === 'Y' ? 'var(--y-deep)' : 'var(--h-deep)' }}>
                {window.USERS[p.textAuthor].name} · {p.textWrittenAt}
              </div>
            </div>
          </div>
          <div className="prose" style={{ fontSize: 18, lineHeight: 2, whiteSpace: 'pre-line' }}>
            {p.text}
          </div>
        </div>
      ) : (
        <div className="card" style={{ padding: '40px 24px', textAlign: 'center', borderStyle: 'dashed' }}>
          <div style={{ fontSize: 36, opacity: 0.5 }}>✍️</div>
          <div className="serif" style={{ fontSize: 18, marginTop: 12 }}>
            <span style={{ color: p.textAuthor === 'Y' ? 'var(--y-deep)' : 'var(--h-deep)', fontWeight: 600 }}>{window.USERS[p.textAuthor].name}</span>의 글을 기다리고 있어요
          </div>
          <div className="meta" style={{ marginTop: 6 }}>{p.photoAuthor}가(이) 올린 사진에 어울리는 글이 채워지면 공개됩니다.</div>
          {canWrite && (
            <button className="btn btn-primary" style={{ marginTop: 16 }} onClick={() => setShowWrite(true)}>
              ✎ 글 쓰러 가기
            </button>
          )}
        </div>
      )}

      {p.status === 'completed' && <CommentArea count={p.comments} />}

      {showWrite && (
        <Modal onClose={() => setShowWrite(false)} title={`"${p.photoTitle}"에 글 쓰기`}>
          <div style={{ marginBottom: 12 }}>
            <Photo hue={p.photoHue} height={140} idx={0} />
          </div>
          <textarea className="textarea" rows={8} placeholder="사진을 보고 떠오르는 것을 자유롭게 적어주세요. 시여도, 산문이어도, 한 줄이어도 좋아요." />
          <div className="row-between" style={{ marginTop: 12 }}>
            <span className="meta">길이 제한 없음</span>
            <div className="row gap-8">
              <button className="btn" onClick={() => setShowWrite(false)}>나중에</button>
              <button className="btn btn-primary">완성 → 공개</button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

Object.assign(window, { PhotostoryListPage, PhotostoryDetailPage });
