# DESIGN.md — 영희네 작업실 디자인 시스템

> 톤앤매너: **따뜻한 손편지 + 종이책**. oklch 컬러 + 세리프 + 손글씨로 구성된 정적인 아카이브 무드.
> 모든 토큰의 원본은 [src/app/globals.css](src/app/globals.css). 이 문서는 사용 가이드.

---

## 1. 컬러 토큰

### 1-1 종이 (배경)
| 토큰 | 값 | 용도 |
|------|-----|------|
| `--paper` | `oklch(0.965 0.018 82)` | 페이지 베이스 (크림) |
| `--paper-2` | `oklch(0.985 0.012 82)` | 카드 내부 (밝은 종이) |
| `--paper-deep` | `oklch(0.93 0.022 78)` | 강조 영역 |
| `--paper-ink` | `oklch(0.91 0.025 75)` | 호버/입력 배경 |

### 1-2 잉크 (텍스트)
| 토큰 | 값 | 용도 |
|------|-----|------|
| `--ink` | `oklch(0.24 0.018 50)` | 본문 |
| `--ink-2` | `oklch(0.38 0.018 50)` | 보조 텍스트 |
| `--ink-3` | `oklch(0.55 0.025 60)` | 메타/라벨 |
| `--ink-4` | `oklch(0.72 0.022 65)` | 가장 옅은 (placeholder 톤) |

### 1-3 선
| 토큰 | 값 | 용도 |
|------|-----|------|
| `--line` | `oklch(0.86 0.022 75)` | 카드/입력 border |
| `--line-2` | `oklch(0.80 0.028 72)` | hover 시 진한 border |

### 1-4 Y/H 시그니처 (사람 색)
| 토큰 | 값 | 용도 |
|------|-----|------|
| `--y` (골드) | `oklch(0.62 0.13 70)` | Y(대영) 기본 |
| `--y-deep` | `oklch(0.48 0.115 65)` | Y 진하게 (이름/버튼) |
| `--y-soft` | `oklch(0.93 0.045 82)` | Y 배경 (말풍선) |
| `--y-line` | `oklch(0.78 0.10 78)` | Y border |
| `--y-ink` | `oklch(0.36 0.10 65)` | Y 텍스트 (chip 안) |
| `--h` (인디고) | `oklch(0.50 0.10 262)` | H(희서) 기본 |
| `--h-deep` | `oklch(0.38 0.095 265)` | H 진하게 |
| `--h-soft` | `oklch(0.93 0.025 250)` | H 배경 |
| `--h-line` | `oklch(0.75 0.06 262)` | H border |
| `--h-ink` | `oklch(0.32 0.08 263)` | H 텍스트 |

### 1-5 상태
| 토큰 | 용도 |
|------|------|
| `--danger` | 삭제/오류 (`oklch(0.55 0.16 30)`, 빨강) |
| `--success` | 저장됨 (`oklch(0.55 0.13 145)`, 초록) |

### 1-6 그림자
- `--shadow-sm`: 살짝 떠있는 느낌 (카드 기본).
- `--shadow`: hover / 강조 카드.
- `--shadow-lg`: 모달/오버레이.

---

## 2. 타이포그래피

| 클래스 | 폰트 | 용도 |
|--------|------|------|
| (기본) | Pretendard Variable | UI, 본문, 버튼 |
| `.serif` | Noto Serif KR (`--font-noto-serif`) | 글 본문, 책 제목, 큰 헤딩 |
| `.hand` | Gaegu (`--font-gaegu`) | 손글씨 강조 (페이지 sub, 인용, 따뜻한 라벨) |

**프리셋 클래스**
- `.page-title` — 28px serif, 600, letter-spacing -0.025em
- `.page-sub` — 18px hand
- `.section-title` — 18px serif, 600
- `.meta` — 12.5px, `--ink-4`
- `.label` — 13px, 500, `--ink-2` (폼 라벨)

---

## 3. 레이아웃 / 폭

### 3-1 컨테이너 토큰
- `--w-narrow: 640px`
- `--w-medium: 860px`
- `--w-wide: 1180px`

### 3-2 페이지별 max-width 가이드
| 페이지 유형 | 폭 | 예시 |
|-------------|-----|------|
| 입력 폼 (write/new) | 600~720 | `/relay/new` 600, `/essay/write` 760 |
| 단독 상세 (글 위주) | 680 | `/essay/[id]`, `/relay/[id]` |
| 사진/책 포함 상세 | 740~880 | `/photostory/[id]` 740, **`/bookclub/[id]` 880** |
| 나란히 보기 (Y\|H 2단) | 1080 | `/keyword/[id]`, `/essay` 목록 |
| 어드민/대시보드 | 880~1080 | `/admin/my/[section]` 980, `/admin/about` 1080 |

> 모든 페이지는 `<div className="container narrow fade-in" style={{ maxWidth: NNN }}>`로 시작.

### 3-3 라운드
- `--r-sm: 4px` — 작은 요소
- `--r-md: 8px` — 입력/버튼
- `--r-lg: 14px` — 카드
- `--r-pill: 999px` — chip, 아바타

---

## 4. 컴포넌트 유틸 클래스

### 4-1 버튼
- `.btn` — 기본 (paper-ink 배경, `--ink` 텍스트)
- `.btn-primary` — 검은 잉크 배경
- `.btn-y` — Y 골드 채움 (Y 액션)
- `.btn-h` — H 인디고 채움 (H 액션)
- `.btn-ghost` — 투명 (취소/링크)
- `.btn-sm` — 13px / padding 6×12
- `.btn-lg` — 16px / padding 14×24
- 비활성: `disabled` 속성 시 opacity 0.45

### 4-2 카드
- `.card` — 떠있는 카드 (paper-2 + shadow-sm + border)
- `.card.y` / `.card.h` — Y/H 시그니처 border
- `.card-flat` — 그림자 없는 평평한 카드 (review/meta 폼 등)
- `.lift` — hover 시 1.5px 위로 + 그림자 강화 (목록 카드용)

### 4-3 입력
- `.input`, `.textarea`, `.select` — 동일 스타일
- `.label` — 입력 위 라벨

### 4-4 칩 (상태 배지)
- `.chip` — 기본
- `.chip.y` / `.chip.h` — Y/H 색
- `.chip.live` — 진행 중 (초록)
- `.chip.wait` — 대기 (옅은 노랑)
- (`.chip.done`은 globals.css에 없으면 추후 추가 후보)

### 4-5 메타
- `.meta` — 작은 회색 텍스트, gap 8px, inline-flex
- `.meta .dot` — 작은 구분점

### 4-6 레이아웃
- `.row` / `.row-between` / `.col` — flex 단축
- `.gap-4`~`.gap-32` — gap 토큰
- `.flex-1`, `.center`, `.fade-in`

### 4-7 아바타
- `.avatar-mini.y` / `.avatar-mini.h` — 동그란 미니 아바타 (Y/H 채팅 말풍선 옆)

---

## 5. 자주 쓰는 패턴

### 5-1 페이지 헤더
```tsx
<div className="row-between" style={{ marginBottom: 28, flexWrap: "wrap", gap: 12 }}>
  <div>
    <div className="hand" style={{ fontSize: 22, color: "var(--ink-3)" }}>
      book club
    </div>
    <h1 className="page-title">독서 모임</h1>
    <div className="serif" style={{ color: "var(--ink-2)", marginTop: 4 }}>
      한 권의 책, 한 시간의 대화.
    </div>
  </div>
  {/* 우측 액션 버튼 */}
</div>
```

### 5-2 Y/H 채팅 말풍선 (bookclub transcript)
- Y: 왼쪽 정렬, `--y-soft` 배경, `--y-line` border, `4px 14px 14px 14px` radius
- H: 오른쪽 정렬, `--h-soft` 배경, `--h-line` border, `14px 4px 14px 14px` radius
- 같은 화자 연속 발화면 아바타 `visibility: hidden`으로 공간만 유지
- 말풍선 max-width 78%

### 5-3 책 표지 (스파인)
- 100×140 (상세), 80×110 (목록 카드)
- 표지 없으면 hue 기반 그라데이션 + 책 제목 가운데
- `borderRadius: "2px 6px 6px 2px"` 좌측은 책등처럼 평평

### 5-4 카드 그리드 (목록)
```tsx
<Link className="card lift" style={{ padding: "20px 22px" }}>
  <div className="row gap-20" style={{ flexWrap: "wrap" }}>
    {/* 책 표지 / 사진 */}
    <div className="flex-1">{/* 제목 + 메타 */}</div>
  </div>
</Link>
```

### 5-5 폼 카드 (edit/review)
```tsx
<form
  className="card-flat"
  style={{
    padding: 16,
    background: "var(--paper-2)",
    border: "1px solid var(--line)",
    marginBottom: 16,
  }}
>
  <h3 className="section-title" style={{ marginBottom: 12 }}>📚 책 정보</h3>
  {/* 필드들 */}
  <div className="row-between" style={{ marginTop: 14 }}>
    <SaveBtn />
  </div>
</form>
```

### 5-6 상태 토글 (BookclubStatusForm 패턴)
- 3개 이상 상태는 버튼 그룹으로 (radio 대신 클릭 시 server action 즉시 호출)
- 활성: `btn btn-primary btn-sm`
- 비활성: `btn btn-sm`
- pending 중엔 다른 버튼 `opacity: 0.5`

---

## 6. 인터랙션 / 모션

- 페이지 진입: `.fade-in` (0.22s ease-out)
- 카드 hover: `.lift` (-2px translateY + shadow)
- 버튼 active: 1px translateY
- 폼 저장 후: ✓ 저장됨 텍스트 `--success` 색으로 짧게 표시
- transcript 발화: `gap: 12`로 자연스러운 호흡

---

## 7. 아이콘 / 이모지

- 텍스트 기반 이모지로 통일. SVG 아이콘 라이브러리 미사용.
- 섹션 헤더: 📚(책), 📕(커버), 📝(소감), 📖(인용), 🎙(녹음), 📷(사진), ✍️(이어쓰기)
- 상태: 📅(날짜), ⏱(길이), 💬(댓글/대사 수), 📍(위치), ❤️(좋아요는 아직 없음)
- 버튼: ＋(추가), ✎(수정), ←(뒤로)

---

## 8. 반응형

- 모든 row에 `flexWrap: "wrap"` 기본.
- 좌우 2단(책 표지 + 정보)은 minWidth 240px 정도 잡고 자동 줄바꿈.
- 모바일 탭바 컴포넌트는 `MobileTabBar.tsx` (현재 사용처 적음).
- 미디어 쿼리는 globals.css 안에 직접. 별도 SCSS 안 씀.

---

## 9. 디자인 데모 (`design/` 디렉토리)

- `design/styles.css`, `design/pages-*.jsx`는 초기 프로토타입.
- 실제 앱은 `src/app/globals.css` 기준이지만, 새로운 컴포넌트 모양 잡을 때 참고용.
- 데모의 **우하단 Y/H/방문자 토글은 데모 전용**이라 실제 앱에 만들지 않음.

---

## 10. 변경 시 체크리스트

- [ ] 새 색을 쓸 거면 oklch로 추가. RGB/HEX 사용 자제.
- [ ] 새 페이지는 폭을 위 표(3-2)에서 선택.
- [ ] 새 컴포넌트 max-width 깨지지 않게 minWidth 잡고 wrap 허용.
- [ ] 폰트 클래스(.serif/.hand)는 의미에 맞게 (손편지 톤 어울리는 곳에만 .hand).
- [ ] 상태 칩 색은 wait/live/y/h 4개 우선 재활용. 없으면 새로 추가.
- [ ] Y/H 동시 노출 영역은 양쪽 색이 균형 있게 (한쪽 강조 금지).
