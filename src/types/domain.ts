export type UserId = "Y" | "H";

export type EssayStatus = "draft" | "published" | "private";

export type Essay = {
  id: string;
  author: UserId;
  title: string;
  content: string;
  excerpt?: string;
  images?: string[];
  tags?: string[];
  status: EssayStatus;
  createdAt: number;
  updatedAt: number;
};

export type Comment = {
  id: string;
  parentType: "essay" | "relay" | "keyword" | "bookclub" | "photostory";
  parentId: string;
  nickname: string;
  text: string;
  secret: boolean;
  createdAt: number;
};

export type RelayStatus = "ongoing" | "completed";

export type RelaySentence = {
  id: string;
  order: number;
  text: string;
  author: UserId;
  createdAt: number;
};

export type Relay = {
  id: string;
  title: string;
  status: RelayStatus;
  yAgreed: boolean;
  hAgreed: boolean;
  sentenceCount: number;
  firstSentenceText: string;
  lastSentenceText: string;
  lastAuthor: UserId;
  createdAt: number;
  updatedAt: number;
};

export type RelayWithSentences = Relay & {
  sentences: RelaySentence[];
};
