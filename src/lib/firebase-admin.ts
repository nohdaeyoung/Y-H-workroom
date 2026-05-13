import "server-only";
import { cert, getApps, initializeApp, type App } from "firebase-admin/app";
import { getFirestore, type Firestore } from "firebase-admin/firestore";

let cachedApp: App | null = null;
let cachedDb: Firestore | null = null;

function getApp(): App | null {
  if (cachedApp) return cachedApp;
  const existing = getApps();
  if (existing.length > 0) {
    cachedApp = existing[0]!;
    return cachedApp;
  }

  const raw = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
  if (!raw || raw === "{}" || raw.trim().length === 0) {
    if (process.env.NODE_ENV !== "production") {
      console.warn(
        "[firebase-admin] FIREBASE_SERVICE_ACCOUNT_KEY 미설정 — Firestore 호출은 null 반환합니다."
      );
    }
    return null;
  }

  try {
    const credentials = JSON.parse(raw);
    cachedApp = initializeApp({ credential: cert(credentials) });
    return cachedApp;
  } catch (err) {
    console.error("[firebase-admin] service account JSON 파싱 실패:", err);
    return null;
  }
}

export function getDb(): Firestore | null {
  if (cachedDb) return cachedDb;
  const app = getApp();
  if (!app) return null;
  const db = getFirestore(app);
  // undefined 필드 무시 — optional 필드(excerpt, tags 등) 누락 시에도 저장 가능
  // settings는 한 번만 적용 가능 → hot reload 시 중복 호출 무시
  try {
    db.settings({ ignoreUndefinedProperties: true });
  } catch {
    // already configured
  }
  cachedDb = db;
  return cachedDb;
}

export function getDbOrThrow(): Firestore {
  const db = getDb();
  if (!db) {
    throw new Error(
      "Firestore가 초기화되지 않았습니다. .env.local의 FIREBASE_SERVICE_ACCOUNT_KEY를 확인하세요."
    );
  }
  return db;
}
