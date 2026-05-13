import "server-only";

export type UserId = "Y" | "H";

export type User = {
  id: UserId;
  name: string;
  displayName: string;
  email: string;
  passwordHash: string;
};

const PROFILES: Record<UserId, { name: string; displayName: string }> = {
  Y: { name: "Y", displayName: "대영" },
  H: { name: "H", displayName: "희서" },
};

function normalizeId(input: string): UserId | null {
  const raw = input.trim().toLowerCase();
  if (!raw) return null;
  if (raw === "y") return "Y";
  if (raw === "h") return "H";
  const yAlias = process.env.SEED_Y_LOGIN_ID?.trim().toLowerCase();
  const hAlias = process.env.SEED_H_LOGIN_ID?.trim().toLowerCase();
  if (yAlias && raw === yAlias) return "Y";
  if (hAlias && raw === hAlias) return "H";
  return null;
}

function loadPasswordHash(id: UserId): string {
  // bcrypt 해시($로 시작)는 dotenv-expand가 변수로 잘못 해석 → base64 우회
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

export function getUserById(input: string): User | null {
  const id = normalizeId(input);
  if (!id) return null;
  const profile = PROFILES[id];
  return {
    id,
    name: profile.name,
    displayName: profile.displayName,
    email: process.env[`SEED_${id}_EMAIL`] ?? "",
    passwordHash: loadPasswordHash(id),
  };
}

export function listUsers(): User[] {
  return (["Y", "H"] as const)
    .map((id) => getUserById(id))
    .filter((u): u is User => u !== null);
}
