import "server-only";
import { getDb, getDbOrThrow } from "@/lib/firebase-admin";
import type { SiteSettings, UserId } from "@/types/domain";

const COLLECTION = "settings";
const DOC = "site";

export const DEFAULT_SITE_SETTINGS: SiteSettings = {
  metaTitle: "영희네 작업실",
  metaDescription: "두 사람의 글과 사진이 만나는 곳",
  ogImageUrl: "",
  headHtml: "",
  bodyStartHtml: "",
  bodyEndHtml: "",
  lastEditedAt: 0,
  lastEditedBy: null,
};

export async function getSiteSettings(): Promise<SiteSettings> {
  const db = getDb();
  if (!db) return DEFAULT_SITE_SETTINGS;
  try {
    const doc = await db.collection(COLLECTION).doc(DOC).get();
    if (!doc.exists) return DEFAULT_SITE_SETTINGS;
    const data = doc.data() as Partial<SiteSettings>;
    return { ...DEFAULT_SITE_SETTINGS, ...data };
  } catch {
    return DEFAULT_SITE_SETTINGS;
  }
}

export async function saveSiteSettings(
  patch: Partial<SiteSettings>,
  editor: UserId
): Promise<void> {
  const db = getDbOrThrow();
  const next: SiteSettings = {
    ...DEFAULT_SITE_SETTINGS,
    ...patch,
    lastEditedAt: Date.now(),
    lastEditedBy: editor,
  };
  await db.collection(COLLECTION).doc(DOC).set(next, { merge: false });
}
