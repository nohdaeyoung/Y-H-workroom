/* ============================================
   영희네 작업실 — 목 데이터
   ============================================ */

// 현재 로그인 상태 (Y, H, null)
window.CURRENT_USER = 'Y';

window.USERS = {
  Y: { id: 'Y', name: '대영', emoji: '🌾', desc: '바람, 도시, 골목길' },
  H: { id: 'H', name: '희서', emoji: '🌙', desc: '책, 비, 새벽 세 시' },
};

// ─── 에세이 ──────────────────────────────
window.ESSAYS = [
  {
    id: 'e-12',
    pair: 'p-6',
    author: 'Y',
    title: '비 오는 날의 골목',
    date: '2026.05.13',
    tags: ['일상', '비'],
    excerpt: '비가 오는 날이면 항상 그 골목이 생각난다. 좁은 인도, 깨진 가로등, 그리고 너의 우산.',
    content: [
      '비가 오는 날이면 항상 그 골목이 생각난다. 좁은 인도, 깨진 가로등, 그리고 너의 우산.',
      '우리는 그날 별 말이 없었다. 그저 빗소리만이 길게 이어졌고, 우산 끝에서 떨어지는 물방울 소리가 가끔 그 사이를 메웠다.',
      '돌이켜보면 그 침묵은 어색한 것이 아니었다. 무언가를 확인하는 시간이었다. 굳이 말하지 않아도 안다는 것 — 그건 우리가 처음으로 가져본 종류의 안심이었다.',
      '비는 그치지 않았고, 우리는 결국 골목 끝 작은 카페로 들어갔다. 따뜻한 차 한 잔이 두 손에 닿았을 때, 너는 비로소 한 마디 했다. "오늘 좋다."',
      '나는 그 말을 오래 기억한다.',
    ],
    comments: 3,
  },
  {
    id: 'e-13',
    pair: 'p-6',
    author: 'H',
    title: '우산 하나',
    date: '2026.05.12',
    tags: ['일상', '비'],
    excerpt: '우산이 하나밖에 없는 날이면 오히려 비를 맞고 싶어진다.',
    content: [
      '우산이 하나밖에 없는 날이면 오히려 비를 맞고 싶어진다.',
      '둘 중 한 명은 어차피 젖을 텐데, 그럴 바엔 같이 젖는 편이 낫지 않나. 그런 생각이 들 때가 있다.',
      '그날도 그랬다. 우산 하나를 두고 우리는 한참을 어색하게 서 있었고, 결국 나는 말했다. "그냥 같이 쓰자." 너는 웃었다.',
      '같이 쓰는 우산 아래에서는 발이 자꾸 부딪힌다. 어깨도. 어쩌면 그게 같이 걷는다는 것의 본래 의미인지도 모르겠다 — 서로의 보폭을 맞추기 위해 잠시 부딪치는 일.',
      '집에 도착했을 때, 우리는 둘 다 한쪽 어깨가 푹 젖어 있었다. 그게 그날의 농담이 되었다.',
    ],
    comments: 1,
  },
  {
    id: 'e-10',
    pair: 'p-5',
    author: 'Y',
    title: '새벽 두 시의 부엌',
    date: '2026.05.06',
    tags: ['새벽', '음식'],
    excerpt: '잠이 오지 않는 밤에는 부엌으로 간다. 라면을 끓이기 위해서가 아니라, 그저 불을 켜기 위해서.',
    content: [
      '잠이 오지 않는 밤에는 부엌으로 간다. 라면을 끓이기 위해서가 아니라, 그저 불을 켜기 위해서.',
      '냉장고 문을 열면 차가운 빛이 새어 나오고, 그 안에는 어제의 김밥과 반쯤 남은 두유, 그리고 너무 오래된 잼이 있다. 나는 아무것도 꺼내지 않고 문을 닫는다.',
      '부엌의 어둠은 거실의 어둠과 다르다. 무언가 조리되기를 기다리는 어둠이다. 시간이 흘러도 그 자리에 있을 것 같은 어둠.',
    ],
    comments: 2,
  },
  {
    id: 'e-11',
    pair: 'p-5',
    author: 'H',
    title: '같은 시간 다른 방',
    date: '2026.05.05',
    tags: ['새벽'],
    excerpt: '새벽 두 시에 깨어 있는 사람이 어딘가에 한 명쯤은 더 있을 거라는 생각.',
    content: [
      '새벽 두 시에 깨어 있는 사람이 어딘가에 한 명쯤은 더 있을 거라는 생각.',
      '그 생각 하나만으로도 외롭지 않을 때가 있다. 같이 있지 않아도, 같은 시간에 깨어 있다는 사실만으로.',
      '나는 책을 펼치지만 글자를 읽지는 않는다. 그저 종이 위에 활자가 있다는 것이 좋다.',
    ],
    comments: 0,
  },
  {
    id: 'e-08',
    pair: 'p-4',
    author: 'Y',
    title: '첫 직장의 점심시간',
    date: '2026.04.29',
    tags: ['일', '추억'],
    excerpt: '점심시간이 가장 무서운 시기가 있다.',
    content: [
      '점심시간이 가장 무서운 시기가 있다. 누구랑 먹을지, 어디서 먹을지, 그게 하루의 가장 큰 고민이 되는 시기.',
      '나는 한동안 매일 같은 김밥집에 갔다. 메뉴가 늘 정해져 있다는 것이 일종의 위안이 됐다.',
    ],
    comments: 1,
  },
  {
    id: 'e-09',
    pair: 'p-4',
    author: 'H',
    title: '그 사람의 마지막 메모',
    date: '2026.04.28',
    tags: ['일', '사람'],
    excerpt: '책상 서랍 정리를 하다가 작은 포스트잇 한 장을 발견했다.',
    content: [
      '책상 서랍 정리를 하다가 작은 포스트잇 한 장을 발견했다. "내일 회의 자료 인쇄해주셔서 감사합니다."',
      '그 사람은 이미 1년 전에 회사를 떠났다. 그 포스트잇이 왜 거기 남아 있었는지는 모른다. 다만 그걸 들고 한참을 서 있었다.',
    ],
    comments: 4,
  },
];

// 에세이 페어링 (같은 날/같은 주제)
window.ESSAY_PAIRS = [
  { id: 'p-6', date: '2026.05.13', y: 'e-12', h: 'e-13', topic: '비, 우산' },
  { id: 'p-5', date: '2026.05.06', y: 'e-10', h: 'e-11', topic: '새벽 두 시' },
  { id: 'p-4', date: '2026.04.29', y: 'e-08', h: 'e-09', topic: '일터' },
];

// ─── 이어쓰기 ────────────────────────────
window.RELAYS = [
  {
    id: 'r-3',
    title: '비가 오는 날이면',
    status: 'ongoing',
    yAgreed: false,
    hAgreed: false,
    updatedAt: '2026.05.13',
    sentences: [
      { order: 1, text: '비가 오는 날이면 항상 그 골목이 생각난다.', author: 'Y', date: '5/13' },
      { order: 2, text: '골목 끝 빨간 우체통 앞에서 우산을 접던 너.', author: 'H', date: '5/13' },
      { order: 3, text: '편지 한 통을 꺼냈을 때, 봉투가 살짝 젖어 있던 것을 기억한다.', author: 'Y', date: '5/13' },
      { order: 4, text: '그 편지는 결국 부치지 못했다.', author: 'H', date: '5/14' },
    ],
  },
  {
    id: 'r-2',
    title: '12월의 어느 도서관',
    status: 'completed',
    yAgreed: true,
    hAgreed: true,
    updatedAt: '2026.04.20',
    sentences: [
      { order: 1, text: '12월의 도서관은 평소보다 따뜻하고 조용했다.', author: 'H', date: '4/15' },
      { order: 2, text: '난방의 소음과 페이지 넘기는 소리가 묘하게 어울렸다.', author: 'Y', date: '4/16' },
      { order: 3, text: '나는 읽지도 않을 책을 펴 두고, 창밖만 보고 있었다.', author: 'H', date: '4/17' },
      { order: 4, text: '눈이 내릴 것 같던 그 잿빛 하늘.', author: 'Y', date: '4/18' },
      { order: 5, text: '결국 눈은 오지 않았고, 나는 그게 다행이라고 생각했다.', author: 'H', date: '4/20' },
    ],
  },
  {
    id: 'r-1',
    title: '오래된 카세트테이프',
    status: 'completed',
    yAgreed: true,
    hAgreed: true,
    updatedAt: '2026.03.10',
    sentences: [
      { order: 1, text: '서랍 깊은 곳에서 오래된 카세트테이프 하나를 찾았다.', author: 'Y', date: '3/5' },
      { order: 2, text: '라벨이 거의 지워져 있어서 무슨 곡인지 알 수 없었다.', author: 'H', date: '3/6' },
      { order: 3, text: '재생기는 없었지만, 그래도 한참을 손에 쥐고 있었다.', author: 'Y', date: '3/10' },
    ],
  },
];

// ─── 키워드 에세이 ───────────────────────
window.KEYWORDS = [
  {
    id: 'k-4',
    keyword: '빈 의자',
    suggestedAt: '2026.05.13',
    status: 'y_done', // y_done | h_done | both_done | waiting
    yEssay: {
      title: '카페 구석의 의자',
      content: '카페 구석 빈 의자 하나가 나를 부른다. 그곳에 앉으면 카페 전체가 보인다. 사람들의 등이 보이고, 그들의 어깨가 어떻게 굽었는지, 누가 누구를 더 사랑하는지가 보인다. 나는 그 의자를 좋아한다.\n\n빈 의자 앞에 앉아 본 적이 있는 사람은 안다. 그 의자가 비어 있는 게 아니라는 것을. 거기에는 누군가가 떠난 자리의 온도가 남아 있다.',
      writtenAt: '2026.05.14',
    },
    hEssay: null,
    comments: 0,
  },
  {
    id: 'k-3',
    keyword: '새벽 세 시',
    suggestedAt: '2026.05.06',
    status: 'both_done',
    yEssay: {
      title: '시간을 잊은 시간',
      content: '새벽 세 시는 어제도 오늘도 아닌 시간이다. 사람들이 모두 잠든 사이, 잠시 세상이 비어 있는 시간. 그 비어 있음이 때로는 따뜻하다.\n\n나는 그 시간에 책을 펴지 않는다. 음악도 듣지 않는다. 그냥 앉아서 천천히 호흡을 센다. 하나, 둘, 셋. 그러면 어느새 네 시가 된다.',
      writtenAt: '2026.05.07',
    },
    hEssay: {
      title: '깨어 있는 사람들',
      content: '새벽 세 시에 깨어 있는 사람들에게는 어떤 동지 의식이 있다. 만난 적은 없지만, 어딘가에서 같은 시간을 흘려보내고 있다는 것 — 그것만으로도 조금 덜 외로워진다.\n\n나는 그 시간에 자주 차를 끓인다. 마실 것은 아니다. 그저 주전자에서 김이 오르는 것을 보고 싶을 뿐이다. 김은 천천히 사라진다. 새벽도 그렇게 사라진다.',
      writtenAt: '2026.05.07',
    },
    comments: 4,
  },
  {
    id: 'k-2',
    keyword: '첫 직장',
    suggestedAt: '2026.04.29',
    status: 'both_done',
    yEssay: { title: '엘리베이터 7층', content: '...', writtenAt: '2026.04.30' },
    hEssay: { title: '신입의 책상', content: '...', writtenAt: '2026.04.30' },
    comments: 2,
  },
  {
    id: 'k-1',
    keyword: '잃어버린 것',
    suggestedAt: '2026.04.22',
    status: 'h_done',
    yEssay: null,
    hEssay: { title: '버스에 두고 온 것들', content: '...', writtenAt: '2026.04.23' },
    comments: 1,
  },
];

// ─── 독서 모임 ────────────────────────────
window.BOOKCLUBS = [
  {
    id: 'b-3',
    bookTitle: '나는 나로 살기로 했다',
    bookAuthor: '김수현',
    meetingDate: '2026.05.10',
    duration: '1시간 23분',
    status: 'published',
    transcript: [
      { speaker: 'Y', text: '이 책에서 가장 인상 깊었던 부분이 어디였어?' },
      { speaker: 'H', text: '나는 3장에서 "완벽하지 않아도 괜찮다"는 문장이 마음에 남았어. 요즘 내가 딱 그런 상태거든.' },
      { speaker: 'Y', text: '맞아. 나도 비슷한 부분이 와닿았는데, 특히 작가가 말한 "비교를 멈추는 순간"이라는 표현이… 너무 적확하더라.' },
      { speaker: 'H', text: '그치. 비교를 멈춘다는 게 사실 제일 어려운 일이잖아. 우리는 늘 누구랑 비교하면서 살아왔으니까.' },
      { speaker: 'Y', text: '나는 사실 그게 SNS 때문이라고만 생각했는데, 이 책 읽으면서 그건 좀 핑계였다는 생각도 들었어. SNS가 없어도 우린 비교했을 거야.' },
      { speaker: 'H', text: '맞아. 그건 매체의 문제가 아니라 우리 안의 문제지. 그래서 더 무섭더라.' },
      { speaker: 'Y', text: '그래도 책에서 위로받은 부분도 있었어. "지금 이 자리에 있는 것만으로도 충분하다"는 문장.' },
      { speaker: 'H', text: '응. 그 문장을 읽고 한참 멈춰 있었던 기억이 나.' },
    ],
    comments: 2,
  },
  {
    id: 'b-2',
    bookTitle: '대도시의 사랑법',
    bookAuthor: '박상영',
    meetingDate: '2026.04.20',
    duration: '58분',
    status: 'published',
    transcript: [],
    comments: 5,
  },
  {
    id: 'b-1',
    bookTitle: '아무튼, 식물',
    bookAuthor: '임이랑',
    meetingDate: '2026.03.15',
    duration: '1시간 12분',
    status: 'published',
    transcript: [],
    comments: 3,
  },
];

// ─── 사진+글 ────────────────────────────
window.PHOTOSTORIES = [
  {
    id: 'p-5',
    photoAuthor: 'H',
    textAuthor: 'Y',
    photoTitle: '카페 창가의 빈 의자',
    photoUploadedAt: '2026.05.13',
    textWrittenAt: '2026.05.14',
    status: 'completed',
    photoCount: 1,
    photoHue: 220,
    text: '누군가 앉았다 간 자리에는 항상 온기가 남아 있다.\n커피잔 자국처럼, 대화의 여운처럼.\n빈 의자는 비어 있는 게 아니라\n기다리고 있는 거다.',
    comments: 5,
  },
  {
    id: 'p-4',
    photoAuthor: 'Y',
    textAuthor: 'H',
    photoTitle: '5월의 가로수',
    photoUploadedAt: '2026.05.10',
    textWrittenAt: null,
    status: 'waiting',
    photoCount: 3,
    photoHue: 130,
    text: null,
    comments: 0,
  },
  {
    id: 'p-3',
    photoAuthor: 'H',
    textAuthor: 'Y',
    photoTitle: '오래된 LP판',
    photoUploadedAt: '2026.05.02',
    textWrittenAt: '2026.05.03',
    status: 'completed',
    photoCount: 2,
    photoHue: 30,
    text: '음악은 한 번 흘러가면 돌아오지 않지만,\n같은 노래는 매번 다른 모양으로 도착한다.\n오늘의 너에게는 이 노래가 무슨 모양으로 닿을까.',
    comments: 3,
  },
  {
    id: 'p-2',
    photoAuthor: 'Y',
    textAuthor: 'H',
    photoTitle: '비 갠 후의 보도블록',
    photoUploadedAt: '2026.04.25',
    textWrittenAt: '2026.04.26',
    status: 'completed',
    photoCount: 1,
    photoHue: 200,
    text: '비가 그치고 나면 보도블록 사이로 작은 거울이 생긴다.\n하늘이 잠시 그 안에 머문다.\n구두로 밟으면 아쉽고, 피해서 걸으면 행복하다.',
    comments: 2,
  },
  {
    id: 'p-1',
    photoAuthor: 'H',
    textAuthor: 'Y',
    photoTitle: '책장 한 켠',
    photoUploadedAt: '2026.04.12',
    textWrittenAt: '2026.04.13',
    status: 'completed',
    photoCount: 1,
    photoHue: 60,
    text: '책장은 잊어버린 것들의 박물관이다.\n읽었던 것을 잊고, 사 둔 것을 잊고,\n빌려갔다는 것을 잊는다.\n그래서 책장은 늘 채워져 있다.',
    comments: 4,
  },
];

// ─── 댓글 (샘플) ────────────────────────
window.SAMPLE_COMMENTS = [
  { nickname: '손님', text: '사진과 글이 너무 잘 어울려요.', date: '2시간 전' },
  { nickname: '잠 안 오는 사람', text: '저도 새벽 세 시에 깨어 있어요.', date: '어제' },
  { nickname: '봄', text: '두 분 글을 나란히 읽으니 더 좋네요.', date: '3일 전' },
];

// ─── 최근 활동 (홈) ──────────────────────
window.RECENT_ACTIVITY = [
  { icon: '📝', kind: '에세이', text: 'Y가 "비 오는 날의 골목"을 썼습니다', when: '2시간 전', link: '#/essay/e-12' },
  { icon: '✍️', kind: '이어쓰기', text: '"비가 오는 날이면"에 H가 이어 썼습니다', when: '어제', link: '#/relay/r-3' },
  { icon: '🎲', kind: '키워드', text: '"빈 의자" — Y ✅  H ⏳', when: '3일 전', link: '#/keyword/k-4' },
  { icon: '📖', kind: '독서모임', text: '「나는 나로 살기로 했다」 대화 공개됨', when: '1주 전', link: '#/bookclub/b-3' },
  { icon: '📷', kind: '사진+글', text: 'H가 사진을 올렸습니다, Y의 글 대기중', when: '오늘', link: '#/photostory/p-5' },
];

// ─── 어드민 통계 ────────────────────────
window.ADMIN_STATS = {
  myCounts: { Y: { essay: 6, relay: 5, keyword: 3, bookclub: 3, photo: 3 },
              H: { essay: 6, relay: 5, keyword: 3, bookclub: 3, photo: 2 } },
  todos: [
    { icon: '📷', text: 'H가 "5월의 가로수" 사진을 올렸어요 — 글을 써 주세요', link: '#/photostory/p-4' },
    { icon: '🎲', text: '키워드 "빈 의자" — 상대가 기다리고 있어요', link: '#/keyword/k-4' },
    { icon: '🔒', text: '비밀 댓글 2개', link: '#/admin/my' },
  ],
};

window.ABOUT_SECTIONS = [
  { key: 'header', title: '영희네 작업실', body: '두 사람의 글과 사진이 만나는 곳.' },
  { key: 'greeting', title: '인사', body: '안녕하세요. 영(Y)과 희(H)입니다.\n같은 도시에 살지만, 같은 풍경을 다르게 보는 두 사람의 작업실에 오신 것을 환영합니다.' },
  { key: 'y_profile', title: 'Y, 대영', body: '도시의 골목과 풍경을 좋아합니다. 매주 한 편의 에세이와 사진을 남깁니다.' },
  { key: 'h_profile', title: 'H, 희서', body: '책과 비를 좋아합니다. 글은 천천히, 사진은 가끔 찍습니다.' },
  { key: 'story', title: '작업실 이야기', body: '두 사람이 만난 후, 서로의 글을 나란히 읽고 싶다는 생각에서 시작된 작업실입니다. 같은 주제를 두고 각자의 시선으로 적어 둔 글을 한 페이지에 펼칩니다.' },
  { key: 'contact', title: '연락', body: 'yh@324.ing' },
];

window.formatAuthor = function(id) {
  if (id === 'Y' || id === 'H') return id;
  return '???';
};
