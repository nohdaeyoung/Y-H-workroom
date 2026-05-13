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
  const v = input.trim().toUpperCase();
  if (v === "Y" || v === "H") return v;
  return null;
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
    passwordHash: process.env[`SEED_${id}_PASSWORD_HASH`] ?? "",
  };
}

export function listUsers(): User[] {
  return (["Y", "H"] as const)
    .map((id) => getUserById(id))
    .filter((u): u is User => u !== null);
}
