import "server-only";
import { getDb, getDbOrThrow } from "@/lib/firebase-admin";
import type { UserId, UserProfile } from "@/types/domain";

const COLLECTION = "users";

const DEFAULTS: Record<UserId, { displayName: string; desc: string }> = {
  Y: { displayName: "대영", desc: "" },
  H: { displayName: "희서", desc: "" },
};

function envPasswordHash(id: UserId): string {
  const b64 = process.env[`SEED_${id}_PASSWORD_HASH_B64`];
  if (b64) {
    try {
      return Buffer.from(b64, "base64").toString("utf8");
    } catch {
      return "";
    }
  }
  return process.env[`SEED_${id}_PASSWORD_HASH`] ?? "";
}

export async function getUserProfile(id: UserId): Promise<UserProfile> {
  const db = getDb();
  const fallback: UserProfile = {
    id,
    displayName: DEFAULTS[id].displayName,
    desc: DEFAULTS[id].desc,
    passwordHash: null,
    updatedAt: 0,
  };
  if (!db) return fallback;
  const doc = await db.collection(COLLECTION).doc(id).get();
  if (!doc.exists) return fallback;
  const data = doc.data() ?? {};
  return {
    id,
    displayName:
      typeof data.displayName === "string" && data.displayName
        ? data.displayName
        : DEFAULTS[id].displayName,
    desc: typeof data.desc === "string" ? data.desc : "",
    passwordHash:
      typeof data.passwordHash === "string" && data.passwordHash
        ? data.passwordHash
        : null,
    updatedAt: typeof data.updatedAt === "number" ? data.updatedAt : 0,
  };
}

/** auth용 — Firestore에 저장된 해시 우선, 없으면 env */
export async function resolvePasswordHash(id: UserId): Promise<string> {
  const profile = await getUserProfile(id);
  if (profile.passwordHash) return profile.passwordHash;
  return envPasswordHash(id);
}

export async function updateUserProfile(
  id: UserId,
  patch: { displayName?: string; desc?: string }
): Promise<void> {
  const db = getDbOrThrow();
  const update: Record<string, unknown> = { updatedAt: Date.now() };
  if (patch.displayName !== undefined)
    update.displayName = patch.displayName.trim().slice(0, 50) ||
      DEFAULTS[id].displayName;
  if (patch.desc !== undefined) update.desc = patch.desc.trim().slice(0, 200);
  await db.collection(COLLECTION).doc(id).set(update, { merge: true });
}

export async function updateUserPasswordHash(
  id: UserId,
  passwordHash: string
): Promise<void> {
  const db = getDbOrThrow();
  await db
    .collection(COLLECTION)
    .doc(id)
    .set({ passwordHash, updatedAt: Date.now() }, { merge: true });
}
