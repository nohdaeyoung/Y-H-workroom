import type { UserId } from "@/types/domain";

export type Transcript = { speaker: UserId; text: string };

export type Bookclub = {
  id: string;
  bookTitle: string;
  bookAuthor: string;
  meetingDate: string; // display string
  duration: string; // display string
  transcript: Transcript[];
  comments: number;
};

export const MOCK_BOOKCLUBS: Bookclub[] = [
  {
    id: "bc-001",
    bookTitle: "나는 나로 살기로 했다",
    bookAuthor: "김수현",
    meetingDate: "2026.05.10",
    duration: "1시간 23분",
    comments: 2,
    transcript: [
      { speaker: "Y", text: "이 책에서 가장 인상 깊었던 부분이 어디였어?" },
      {
        speaker: "H",
        text: "나는 3장에서 “완벽하지 않아도 괜찮다”는 문장이 마음에 남았어. 요즘 내가 딱 그런 상태거든.",
      },
      {
        speaker: "Y",
        text: "맞아. 나도 비슷한 부분이 와닿았는데, 특히 작가가 말한 “비교를 멈추는 순간”이라는 표현이 좋더라.",
      },
      {
        speaker: "Y",
        text: "비교는 어디서나 따라붙는 거니까. 책 한 줄로 멈출 수 있는 건 아니지만, 잠깐의 휴식 같았어.",
      },
      {
        speaker: "H",
        text: "응. 그 챕터 끝에 적어둔 문장이 있는데 보여줄게.",
      },
    ],
  },
  {
    id: "bc-002",
    bookTitle: "달과 6펜스",
    bookAuthor: "서머셋 모옴",
    meetingDate: "2026.04.21",
    duration: "1시간 02분",
    comments: 0,
    transcript: [
      {
        speaker: "H",
        text: "스트릭랜드라는 인물 자체에 대해선 어떻게 생각해?",
      },
      {
        speaker: "Y",
        text: "처음엔 거부감이 들었어. 가족도, 친구도 버리고 떠나는 인물이잖아.",
      },
      {
        speaker: "H",
        text: "맞아. 그런데 후반부의 그림 묘사 부분에서는 뭔가 이해되더라. 자기가 다른 것엔 도무지 살 수 없는 사람이라는 게.",
      },
    ],
  },
];

export function getBookclub(id: string): Bookclub | undefined {
  return MOCK_BOOKCLUBS.find((b) => b.id === id);
}
