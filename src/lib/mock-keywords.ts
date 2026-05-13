import type { UserId } from "@/types/domain";

export type KeywordEssay = {
  title: string;
  content: string;
  writtenAt: number;
};

export type Keyword = {
  id: string;
  keyword: string;
  suggestedAt: number;
  yEssay: KeywordEssay | null;
  hEssay: KeywordEssay | null;
  status: "waiting" | "y_done" | "h_done" | "both_done";
  comments: number;
};

const day = 24 * 60 * 60 * 1000;
const now = Date.now();

export const MOCK_KEYWORDS: Keyword[] = [
  {
    id: "kw-1",
    keyword: "빈 의자",
    suggestedAt: now - 3 * day,
    yEssay: {
      title: "누가 앉았다 간 자리",
      content:
        "카페 구석에 빈 의자 하나가 있었다.\n앉은 사람이 없어도, 그 자리에는 누군가의 온기가 남아 있었다.\n빈 의자는 비어 있는 게 아니라 기다리고 있는 거다.",
      writtenAt: now - 2 * day,
    },
    hEssay: null,
    status: "y_done",
    comments: 0,
  },
  {
    id: "kw-2",
    keyword: "새벽 세 시",
    suggestedAt: now - 14 * day,
    yEssay: {
      title: "고요한 시간",
      content:
        "새벽 세 시. 도시가 자기 자신을 잠깐 잊는 시간이다.\n그때 켠 스탠드 불 하나가, 하루 중 가장 정직한 빛이었다.",
      writtenAt: now - 12 * day,
    },
    hEssay: {
      title: "잠 못 드는 밤의 책상",
      content:
        "잠이 오지 않는 밤이면 새벽 세 시까지 책상에 앉아 있었다.\n쓰는 일은 잠보다 깊은 휴식이 되기도 했다.",
      writtenAt: now - 11 * day,
    },
    status: "both_done",
    comments: 3,
  },
  {
    id: "kw-3",
    keyword: "첫 직장",
    suggestedAt: now - 21 * day,
    yEssay: {
      title: "출근길의 공기",
      content:
        "첫 출근날, 지하철 환승역에서 한참을 헤맸다.\n낯선 어른 흉내가 점점 익숙해지는 게 어른이 되는 일이었다.",
      writtenAt: now - 19 * day,
    },
    hEssay: {
      title: "너무 컸던 책상",
      content:
        "첫 직장의 책상은 너무 컸다.\n의자에 앉아 발이 닿지 않던 그날, 어른이 된다는 건 발끝부터 시작된다고 생각했다.",
      writtenAt: now - 18 * day,
    },
    status: "both_done",
    comments: 1,
  },
];

export function getKeyword(id: string): Keyword | undefined {
  return MOCK_KEYWORDS.find((k) => k.id === id);
}
