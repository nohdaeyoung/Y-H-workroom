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
