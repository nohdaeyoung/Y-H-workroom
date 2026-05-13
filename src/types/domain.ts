export type UserId = "Y" | "H";

export type UserProfile = {
  id: UserId;
  displayName: string;
  desc: string;
  passwordHash: string | null; // Firestore 우선, null이면 env 시드 fallback
  updatedAt: number;
};

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

export type KeywordEssay = {
  title: string;
  content: string;
  writtenAt: number;
};

export type KeywordStatus = "waiting" | "y_done" | "h_done" | "both_done";

export type Keyword = {
  id: string;
  keyword: string;
  suggestedAt: number;
  yEssay: KeywordEssay | null;
  hEssay: KeywordEssay | null;
  status: KeywordStatus;
};

export type BookclubTranscriptLine = {
  speaker: UserId;
  text: string;
};

// reading: 독서중 (Y/H에만 보임) · met: 모임 완료 (공개) · finished: 완독 (공개)
export type BookclubStatus = "reading" | "met" | "finished";

export const BOOKCLUB_STATUS_LABEL: Record<BookclubStatus, string> = {
  reading: "독서중",
  met: "모임 완료",
  finished: "완독",
};

// Legacy 호환: review → reading, published → met
export function normalizeBookclubStatus(raw: unknown): BookclubStatus {
  if (raw === "reading" || raw === "met" || raw === "finished") return raw;
  if (raw === "review" || raw === "processing") return "reading";
  if (raw === "published") return "met";
  return "reading";
}

export type PhotostoryStatus = "waiting" | "completed";

export type Photostory = {
  id: string;
  photoAuthor: UserId;
  textAuthor: UserId;
  photoTitle: string;
  photos: string[]; // R2 public URLs
  photoUploadedAt: number;
  text: string | null; // HTML
  textWrittenAt: number | null;
  status: PhotostoryStatus;
  createdAt: number;
};

export type AboutSection = {
  key: string;
  title: string;
  body: string; // HTML
  imageUrl?: string;
};

export type AboutContent = {
  sections: AboutSection[];
  lastEditedBy: UserId | null;
  lastEditedAt: number;
  publishedAt: number | null;
};

export type BookclubImpression = {
  title: string;
  content: string; // HTML (RichEditor)
  writtenAt: number;
};

export type BookclubQuote = {
  id: string;
  author: UserId;
  text: string;
  source: string;
  createdAt: number;
};

export type Bookclub = {
  id: string;
  bookTitle: string;
  bookAuthor: string;
  meetingDate: string;
  duration: string;
  coverUrl: string | null;
  audioUrl: string | null;
  transcript: BookclubTranscriptLine[];
  yImpression: BookclubImpression | null;
  hImpression: BookclubImpression | null;
  quotes: BookclubQuote[];
  status: BookclubStatus;
  createdAt: number;
  publishedAt: number | null;
};
