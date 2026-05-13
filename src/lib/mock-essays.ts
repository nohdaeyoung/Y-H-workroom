import type { Essay } from "@/types/domain";

const day = 1000 * 60 * 60 * 24;
const now = Date.now();

export const MOCK_ESSAYS: Essay[] = [
  {
    id: "mock-y-1",
    author: "Y",
    title: "비오는 날",
    content:
      "<p>비가 오는 날이면 항상 그 골목이 생각난다.</p><p>빗방울이 떨어지면 먼저 듣고 싶어지는 소리들이 있고, 그건 늘 그 자리에서 시작됐다. 우산을 접던 너의 손끝, 빨간 우체통 옆에 고인 작은 웅덩이.</p><p>오늘도 비가 온다. 나는 그 골목 쪽으로 우산을 기울인다.</p>",
    excerpt: "비가 오는 날이면 항상 그 골목이 생각난다.",
    status: "published",
    tags: ["일상", "비"],
    createdAt: now - 2 * 60 * 60 * 1000,
    updatedAt: now - 2 * 60 * 60 * 1000,
  },
  {
    id: "mock-h-1",
    author: "H",
    title: "우산 하나",
    content:
      "<p>우산이 하나밖에 없는 날이면 오히려 비를 맞고 싶어진다.</p><p>어깨가 젖어가는 동안 떠오르는 사람이 있다는 건, 결국 다정한 일이다. 우산 안과 밖 사이의 그 좁은 거리, 그 거리만큼이 우리의 약속이었다.</p>",
    excerpt: "우산이 하나밖에 없는 날이면 오히려 비를 맞고 싶어진다.",
    status: "published",
    tags: ["일상", "비"],
    createdAt: now - 1 * day,
    updatedAt: now - 1 * day,
  },
  {
    id: "mock-y-2",
    author: "Y",
    title: "새벽 세 시",
    content:
      "<p>새벽 세 시에 깨어 있어 본 사람만 아는 고요가 있다. 도시가 자기 자신을 잠시 잊는 시간. 그때 쓴 글은 늘 솔직했다.</p>",
    excerpt: "새벽 세 시에 깨어 있어 본 사람만 아는 고요가 있다.",
    status: "published",
    tags: ["밤", "글쓰기"],
    createdAt: now - 4 * day,
    updatedAt: now - 4 * day,
  },
  {
    id: "mock-h-2",
    author: "H",
    title: "첫 직장의 책상",
    content:
      "<p>첫 직장의 책상은 너무 컸다. 의자에 앉아 발이 닿지 않던 그날, 어른이 되는 건 발끝부터 시작되는 일이라 생각했다.</p>",
    excerpt: "첫 직장의 책상은 너무 컸다.",
    status: "published",
    tags: ["회고"],
    createdAt: now - 6 * day,
    updatedAt: now - 6 * day,
  },
];

export function pairEssaysByDate(essays: Essay[]): Array<{ y?: Essay; h?: Essay }> {
  const sorted = [...essays].sort((a, b) => b.createdAt - a.createdAt);
  const yList = sorted.filter((e) => e.author === "Y");
  const hList = sorted.filter((e) => e.author === "H");
  const len = Math.max(yList.length, hList.length);
  const pairs: Array<{ y?: Essay; h?: Essay }> = [];
  for (let i = 0; i < len; i++) {
    pairs.push({ y: yList[i], h: hList[i] });
  }
  return pairs;
}
