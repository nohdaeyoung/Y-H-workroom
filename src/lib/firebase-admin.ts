import "server-only";
import { cert, getApps, initializeApp, type App } from "firebase-admin/app";
import { getFirestore, type Firestore } from "firebase-admin/firestore";

let cachedApp: App | null = null;

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
  const app = getApp();
  if (!app) return null;
  return getFirestore(app);
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
