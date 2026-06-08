import "server-only";
import { getDb, getDbOrThrow } from "@/lib/firebase-admin";
import type { AboutContent, AboutSection, UserId } from "@/types/domain";

const COLLECTION = "aboutContent";
const DOC_ID = "main";

export const SECTION_TITLES: Record<string, string> = {
  header: "헤더",
  greeting: "인삿말",
  y_profile: "프로필",
  story: "이야기",
  contact: "연락처",
};

export const DEFAULT_SECTIONS: AboutSection[] = [
  {
    key: "header",
    title: "영이네 작업실",
    body: "<p>영이가 글과 사진을 쌓아두는 작은 공간</p>",
  },
  {
    key: "greeting",
    title: "여기는 영이가 혼자 글을 쌓아두는 작업실입니다.",
    body: "<p>그날의 빛, 그날의 책, 그날의 장면을 모아둡니다.</p><p>누구든 들러 읽고, 한 마디 두고 갈 수 있어요. 빈 자리에 닉네임 하나 적어두면 작은 편지가 됩니다.</p>",
  },
  {
    key: "y_profile",
    title: "영 · 대영",
    body: "<p>마음에 남는 장면을 그날의 빛으로 적어두려고 합니다. 일기처럼, 편지처럼.</p>",
  },
  {
    key: "story",
    title: "왜 이런 곳을 만들었냐면",
    body: "<p>흩어져 있던 글과 사진을 한 자리에 모아두고 싶어서요. 그 모양을 한번 만들어보고 있는 중입니다.</p>",
  },
  {
    key: "contact",
    title: "혹시 하고 싶은 말이 있다면",
    body: "<p>댓글로 남겨주세요. 닉네임만 적으면 충분해요.</p>",
  },
];

export async function getAboutContent(): Promise<AboutContent> {
  const db = getDb();
  if (!db) {
    return {
      sections: DEFAULT_SECTIONS,
      lastEditedBy: null,
      lastEditedAt: 0,
      publishedAt: null,
    };
  }
  const doc = await db.collection(COLLECTION).doc(DOC_ID).get();
  if (!doc.exists) {
    return {
      sections: DEFAULT_SECTIONS,
      lastEditedBy: null,
      lastEditedAt: 0,
      publishedAt: null,
    };
  }
  const data = doc.data() as AboutContent;
  return {
    sections:
      Array.isArray(data.sections) && data.sections.length > 0
        ? data.sections
        : DEFAULT_SECTIONS,
    lastEditedBy: data.lastEditedBy ?? null,
    lastEditedAt: data.lastEditedAt ?? 0,
    publishedAt: data.publishedAt ?? null,
  };
}

export function sectionByKey(
  sections: AboutSection[],
  key: string
): AboutSection | undefined {
  return sections.find((s) => s.key === key);
}

export async function saveAboutContent(
  sections: AboutSection[],
  editor: UserId
): Promise<void> {
  const db = getDbOrThrow();
  const now = Date.now();
  await db
    .collection(COLLECTION)
    .doc(DOC_ID)
    .set(
      {
        sections,
        lastEditedBy: editor,
        lastEditedAt: now,
        publishedAt: now,
      } satisfies AboutContent,
      { merge: false }
    );
}
