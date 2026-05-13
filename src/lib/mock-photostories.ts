import type { UserId } from "@/types/domain";

export type Photostory = {
  id: string;
  photoAuthor: UserId;
  textAuthor: UserId;
  photoTitle: string;
  photoUploadedAt: string; // display
  photoCount: number;
  photoHue: number;
  text: string | null;
  textWrittenAt: string | null;
  status: "waiting" | "completed";
  comments: number;
};

export const MOCK_PHOTOSTORIES: Photostory[] = [
  {
    id: "ps-1",
    photoAuthor: "H",
    textAuthor: "Y",
    photoTitle: "빈 의자가 놓인 카페 창가",
    photoUploadedAt: "2026.05.13",
    photoCount: 1,
    photoHue: 30,
    text: "누군가 앉았다 간 자리에는\n항상 온기가 남아 있다.\n커피잔 자국처럼, 대화의 여운처럼.\n빈 의자는 비어 있는 게 아니라\n기다리고 있는 거다.",
    textWrittenAt: "2026.05.14",
    status: "completed",
    comments: 3,
  },
  {
    id: "ps-2",
    photoAuthor: "Y",
    textAuthor: "H",
    photoTitle: "한낮의 골목",
    photoUploadedAt: "2026.05.11",
    photoCount: 2,
    photoHue: 80,
    text: null,
    textWrittenAt: null,
    status: "waiting",
    comments: 0,
  },
  {
    id: "ps-3",
    photoAuthor: "H",
    textAuthor: "Y",
    photoTitle: "비 그친 후",
    photoUploadedAt: "2026.05.08",
    photoCount: 3,
    photoHue: 220,
    text: "비 그친 길은 한 번 더 비를 맞은 것 같다.\n물웅덩이가 다 같이 하늘을 비추는 시간.",
    textWrittenAt: "2026.05.09",
    status: "completed",
    comments: 1,
  },
  {
    id: "ps-4",
    photoAuthor: "Y",
    textAuthor: "H",
    photoTitle: "오래된 책장",
    photoUploadedAt: "2026.05.05",
    photoCount: 1,
    photoHue: 50,
    text: "책장은 시간을 모은다.\n어떤 책은 한 번도 펼치지 않았는데도\n나를 알고 있는 것 같다.",
    textWrittenAt: "2026.05.07",
    status: "completed",
    comments: 0,
  },
  {
    id: "ps-5",
    photoAuthor: "H",
    textAuthor: "Y",
    photoTitle: "골목 끝 우체통",
    photoUploadedAt: "2026.05.03",
    photoCount: 1,
    photoHue: 10,
    text: null,
    textWrittenAt: null,
    status: "waiting",
    comments: 0,
  },
];

export function getPhotostory(id: string): Photostory | undefined {
  return MOCK_PHOTOSTORIES.find((p) => p.id === id);
}
