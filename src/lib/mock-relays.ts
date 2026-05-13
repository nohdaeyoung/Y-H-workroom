import type { UserId } from "@/types/domain";

export type RelaySentence = {
  text: string;
  author: UserId;
  createdAt: number;
};

export type Relay = {
  id: string;
  title: string;
  status: "ongoing" | "completed";
  sentences: RelaySentence[];
  yAgreed: boolean;
  hAgreed: boolean;
  createdAt: number;
  updatedAt: number;
};

const day = 24 * 60 * 60 * 1000;
const now = Date.now();

export const MOCK_RELAYS: Relay[] = [
  {
    id: "relay-1",
    title: "비가 오는 날이면",
    status: "ongoing",
    yAgreed: false,
    hAgreed: false,
    createdAt: now - 4 * day,
    updatedAt: now - 6 * 60 * 60 * 1000,
    sentences: [
      {
        text: "비가 오는 날이면 항상 그 골목이 생각난다.",
        author: "Y",
        createdAt: now - 4 * day,
      },
      {
        text: "골목 끝에는 빨간 우체통이 있었고, 그 옆엔 항상 누군가가 우산을 접고 있었다.",
        author: "H",
        createdAt: now - 3 * day,
      },
      {
        text: "우산이 접히는 소리는 비 오는 날의 첫 인사 같았다.",
        author: "Y",
        createdAt: now - 2 * day,
      },
      {
        text: "그 인사를 받아 적기 시작한 것이 오늘 이 글의 시작이다.",
        author: "H",
        createdAt: now - 6 * 60 * 60 * 1000,
      },
    ],
  },
  {
    id: "relay-2",
    title: "오래된 카페에서",
    status: "ongoing",
    yAgreed: true,
    hAgreed: false,
    createdAt: now - 8 * day,
    updatedAt: now - 1 * day,
    sentences: [
      {
        text: "그 카페의 문을 밀면 종소리보다 먼저 커피 향이 손목을 잡았다.",
        author: "H",
        createdAt: now - 8 * day,
      },
      {
        text: "주인은 잔을 닦다 말고 고개를 들지도 않고 자리를 가리켰다.",
        author: "Y",
        createdAt: now - 7 * day,
      },
      {
        text: "익숙한 자리에 앉으면 시간이 한 박자 늦게 흐르는 것 같았다.",
        author: "H",
        createdAt: now - 1 * day,
      },
    ],
  },
  {
    id: "relay-3",
    title: "골목 끝의 우체통",
    status: "completed",
    yAgreed: true,
    hAgreed: true,
    createdAt: now - 30 * day,
    updatedAt: now - 14 * day,
    sentences: [
      {
        text: "어떤 골목에는 끝이 우체통이다.",
        author: "Y",
        createdAt: now - 30 * day,
      },
      {
        text: "거기까지 가본 사람만 아는 사실이다.",
        author: "H",
        createdAt: now - 28 * day,
      },
      {
        text: "우체통은 비어 있어도 우리는 거기 서서 무언가를 적어두곤 했다.",
        author: "Y",
        createdAt: now - 20 * day,
      },
      {
        text: "쓴 적 없는 편지가 그곳에 쌓여 있을지도 모른다.",
        author: "H",
        createdAt: now - 14 * day,
      },
    ],
  },
];

export function getRelay(id: string): Relay | undefined {
  return MOCK_RELAYS.find((r) => r.id === id);
}
