# CLAUDE.md — 영희네 작업실 작업 가이드

> Y(대영) · H(희서) 두 사람의 글·사진·대화 아카이브.
> 이 문서는 Claude Code가 이 프로젝트에서 작업할 때 따르는 규칙과 컨벤션 모음이야.

---

## 0. 기본 운영 규칙

- **언어**: 모든 응답·커밋·UI 문구는 한국어. 반말, 친구 톤.
- **배포 규칙**: 로컬 적용까지만. `npm run build`, `git commit`, `git push`, vercel 배포는 **사용자가 명시적으로 지시할 때만**. "Phase 완료", "빌드 통과" 같은 자동 트리거 금지.
- **dev 서버 포트**: 3324 (디노블로그와 충돌 방지).
- **dev 켠 채 빌드 금지**: `npm run build`가 `.next` 디렉토리를 production 빌드로 덮어쓰면서 dev webpack 청크가 깨짐(`Cannot find module './1682.js'`). 빌드는 dev 서버 끄고 돌릴 것.
- **시크릿**: `.env.local`은 gitignore. `.env.example`만 커밋. 채팅에 키 노출되면 즉시 회전 권장.

---

## 1. 프로젝트 정보

| 항목 | 값 |
|------|-----|
| 경로 | `/Volumes/Dev/Y&H workroom` |
| 라이브 | https://yh-workroom.vercel.app (vercel auto-deploy on push) |
| GitHub | github.com/dynoworld/yh-workroom |
| 도메인 후보 | `yh.324.ing` (미적용) |

### 사용자 / 권한
- **Y(대영)** — 작성자/관리자. 로그인 alias `daeyoung` 또는 이메일 `dynoworld@gmail.com`.
- **H(희서)** — 작성자/관리자. 로그인 alias `heeseo`. 이메일 미정.
- **방문자** — 비로그인. 읽기 + 닉네임 댓글만 가능.

---

## 2. 기술 스택

| 영역 | 선택 |
|------|------|
| 프레임워크 | Next.js 14.2 (App Router) |
| 언어 | TypeScript (strict) |
| 스타일 | 전역 CSS + 인라인 style (Tailwind 미사용) |
| 인증 | Auth.js v5 (`next-auth@beta`) — split config (edge용 `auth.config.ts` + node용 `auth.ts`) |
| DB | Firebase Admin SDK + Firestore (`yh-workroom-firebase-adminsdk`) |
| 비밀번호 | bcryptjs. env에는 **base64 인코딩**된 hash 저장 (dotenv-expand `$` 충돌 회피) |
| 스토리지 | Cloudflare R2 (dynoblog와 동일 버킷 공유, prefix `yh/`) |
| 업로드 | presign URL → 브라우저 직접 PUT (CORS 설정 완료) |
| 에디터 | TipTap (Markdown 확장, dynoblog와 동일 패턴) |
| HTML 살균 | DOMPurify(isomorphic) + html-react-parser (security hook이 raw HTML 주입 차단) |
| 음성 → 글 | OpenAI Whisper (transcribe) + Anthropic Claude (화자 분리) |
| 배포 | Vercel (main 푸시 시 자동 배포) |

---

## 3. 디렉토리

```
src/
  app/
    layout.tsx              루트 레이아웃 (헤더/푸터/폰트)
    page.tsx                홈 (오늘의 작업실, 통계 카드)
    globals.css             ⭐ 디자인 시스템 (oklch 토큰)
    about/                  소개
    admin/                  Y/H 전용
      about/                소개 콘텐츠 편집
      account/              비밀번호/구글 연동
      my/[section]/         내 글 모아보기
    essay/                  에세이 (나란히 읽기 Y|H)
    relay/                  이어쓰기 (한 문장씩 번갈아)
    keyword/                AI 키워드 (둘이 같은 주제로 따로 씀)
    bookclub/               독서모임 (책 + 음성+텍스트 + 소감 + 인용)
    photostory/             사진+글 (사진 author + 글 author 분리)
    login/
    api/                    auth, upload sign, bookclub audio/transcribe, comments
  components/                ⭐ 모든 client component
  lib/                       Firestore wrappers, R2, users, normalize
  types/domain.ts            ⭐ 도메인 타입 (Essay, Relay, Keyword, Bookclub, Photostory…)
  auth.config.ts             edge-safe (middleware용)
  auth.ts                    node 전용 (Credentials + bcrypt)
  middleware.ts              public 경로 화이트리스트
design/                      디자인 데모(JSX 프로토타입, 우하단 Y/H/방문자 토글은 데모 전용)
PLAN.md                      기획서 v2 (Phase 1~6)
CLAUDE.md                    ⭐ 이 파일
DESIGN.md                    ⭐ 디자인 시스템 레퍼런스
```

---

## 4. 코드 컨벤션

### 4-1 페이지 / 라우트
- **모든 페이지에 `export const dynamic = "force-dynamic"` 기본**. Firestore SSR 매번 새로.
- params는 동기 (Next 14, `{ params: { id: string } }`).
- **상세 페이지 폭**: 880 기본 (relay, admin, bookclub). 좁은 폼은 600~720.
  - `/essay/[id]`: 680
  - `/photostory/[id]`: 740
  - `/keyword/[id]`: 1080
  - `/bookclub/[id]`: 880
  - 새로 만드는 상세 페이지는 컨텐츠 양에 맞춰 680~1080 사이에서 선택.

### 4-2 데이터 (Firestore)
- 컬렉션: `essays`, `relays`, `keywords`, `bookclubs`, `photostories`, `comments`, `users`, `about`.
- **복합 인덱스 회피**: orderBy는 단일 필드(`createdAt desc`)로만 잡고 status 필터는 코드에서 적용. (`listEssays`, `listBookclubs` 모두 이 패턴.)
- **undefined 거부 회피**: `firebase-admin.ts`에서 `db.settings({ ignoreUndefinedProperties: true })` 켜둠.
- 자주 변경되는 상태는 normalize 함수로 legacy 호환 유지 (`normalizeBookclubStatus` 참조).

### 4-3 액션 / 폼
- Server Action(`"use server"`)으로 모든 mutation.
- 사용자 인증: 액션 시작부에 `const uid = (await auth())?.user?.id; if (uid !== "Y" && uid !== "H") return ...`.
- HTML 본문은 반드시 `DOMPurify.sanitize(html, { USE_PROFILES: { html: true } })`.
- `useFormState(action, initial)` 패턴으로 에러/저장 상태 표시.
- 액션 끝에 `revalidatePath` 누락 금지.

### 4-4 컴포넌트
- 클라이언트 컴포넌트는 `"use client"` 첫 줄 + `useFormState` / `useTransition` 적극 활용.
- 인라인 스타일이 기본 (CSS 변수 `var(--paper)`, `var(--ink-3)` 등 사용).
- 폰트 클래스: `.serif`(Noto Serif KR), `.hand`(Gaegu, 손글씨), 기본은 Pretendard.
- 색: Y(`var(--y-deep)` 골드), H(`var(--h-deep)` 인디고), 본문(`var(--ink)`).
- 자세한 토큰은 `DESIGN.md` 참고.

### 4-5 보안
- security hook이 raw HTML 주입(`dangerously...InnerHTML` 류)을 차단함 → 본문 렌더는 항상 `html-react-parser` 사용.
- `.env.local`의 hash는 base64 (`SEED_Y_PASSWORD_HASH_B64`), `lib/users.ts`에서 디코드.
- 이미지/오디오 업로드는 presign 통한 브라우저 직접 PUT. 서버 메모리에 안 올림.

---

## 5. 도메인 모델 (요약)

자세한 타입은 `src/types/domain.ts`.

| 컬렉션 | 상태(status) | 비고 |
|--------|--------------|------|
| Essay | `draft` / `published` / `private` | author 단독 |
| Relay | `ongoing` / `completed` | 둘 다 동의해야 completed |
| Keyword | `waiting` / `y_done` / `h_done` / `both_done` | AI 키워드, 둘 다 쓰면 both_done |
| **Bookclub** | `reading` / `met` / `finished` | reading = 독서중(Y/H에만 보임), met=모임 완료, finished=완독. legacy `review/processing→reading`, `published→met` 자동 normalize |
| Photostory | `waiting` / `completed` | 사진 author와 글 author 분리. 다른 사람이 글 채우면 완료 |
| Comment | parentType + parentId로 모든 컬렉션에 연결 | 닉네임 댓글, secret 옵션 |

---

## 6. 알려진 함정

- **dev 켠 채 build → webpack chunk 깨짐.** 빌드 전 dev 종료.
- **bcrypt hash의 `$`** dotenv-expand가 변수 확장으로 오해 → base64 인코딩으로 우회.
- **Edge Runtime bcrypt 불가** → auth.config(edge)에서 Credentials/bcrypt 제외, auth.ts(node)에서만 사용.
- **Firestore 복합 인덱스** 미생성 시 쿼리 실패 → 코드 필터로 회피.
- **next-pwa 미사용**이지만 dev는 webpack(Turbopack 안 씀).
- **Y&H workroom 디렉토리명에 공백/`&`** 포함 → 쉘에서 `cd "/Volumes/Dev/Y&H workroom"`처럼 항상 따옴표.
- **prod 도메인 미연결**: 아직 `g.324.ing` 같은 도메인 없이 vercel preview URL로 사용 중.

---

## 7. 최근 작업 로그 (2026-05-13~14)

| 날짜 | 변경 |
|------|------|
| 05-13 | Phase 1~6 통합 완료, vercel 배포, R2 dynoblog 버킷 공유, OG/PWA 미적용. 우하단 Y/H/방문자 토글은 디자인 데모 전용(실제 앱엔 없음). |
| 05-13 | 어드민 계정 페이지: 프로필 저장 + 비밀번호 변경 실연결 (Firestore `users`). |
| 05-13 | 모든 상세 페이지 상단에 본인용 ✎ 수정 링크 추가. |
| 05-13 | 독서모임: 책 커버 업로드(new + review), edit 기능 (relay/keyword/photostory/bookclub). |
| 05-13 | 독서모임 상세에 탭 메뉴 (소감 / 나만의 문장 / 모임 기록). 기본 활성 = 소감. |
| 05-14 | 독서모임 상태 모델 reading/met/finished 재설계. `BookclubStatusForm` 추가. new + review 페이지에서 상태 선택 가능. legacy normalize 함수로 기존 데이터 호환. |
| 05-14 | reading 상태도 Y/H 로그인 시 상세 페이지 진입 가능 (소감/문장 입력). 방문자는 여전히 비공개. |
| 05-14 | 독서모임 상세 페이지 폭 720 → 880 (relay/admin과 통일). |
| 05-14 | 책 커버 업로드 UI를 `BookclubMetaForm` 안으로 통합. `BookclubCoverUploader.tsx`는 사용 안 됨(삭제 보류). |

---

## 8. 자주 묻는 작업 동선

- **새 페이지 추가**: `src/app/<route>/page.tsx`에 `export const dynamic = "force-dynamic"`, container 폭 결정, 데이터는 `src/lib/<collection>.ts` wrapper로.
- **새 액션 추가**: `src/app/<route>/actions.ts`에 `"use server"`, auth 가드, `useFormState` 패턴, 마지막에 `revalidatePath`.
- **새 상태 값 추가**: `src/types/domain.ts`에 타입 + 라벨 맵 + normalize 함수 → 모든 페이지의 status 필터 갱신 → 빌드 → 로컬 검증.
- **이미지 업로드**: `/api/upload/sign`으로 presign → 브라우저 직접 PUT → 결과 publicUrl을 액션으로 저장.
- **새 컴포넌트는 client인가?** 데이터 패칭 안 하고 인터랙션만 있으면 client. 그 외는 server.
