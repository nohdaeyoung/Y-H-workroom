import type { NextAuthConfig } from "next-auth";

function emailForUid(uid: "Y" | "H"): string {
  return (process.env[`SEED_${uid}_EMAIL`] ?? "").trim().toLowerCase();
}

function uidFromEmail(email: string): "Y" | "H" | null {
  const e = email.trim().toLowerCase();
  if (!e) return null;
  if (e === emailForUid("Y")) return "Y";
  if (e === emailForUid("H")) return "H";
  return null;
}

export const authConfig: NextAuthConfig = {
  trustHost: true,
  session: { strategy: "jwt" },
  pages: { signIn: "/login" },
  providers: [],
  callbacks: {
    async signIn({ user, account }) {
      // Credentials provider는 authorize에서 이미 검증 — pass
      if (account?.provider !== "google") return true;
      // Google 로그인은 사전 등록된 Y/H 이메일만 허용
      const email = user.email ?? "";
      const uid = uidFromEmail(email);
      if (!uid) {
        console.warn(`[auth] Google sign-in 거부: 화이트리스트 외 (${email})`);
        return false;
      }
      // Google user를 Y/H로 mapping (jwt 콜백에서 uid 주입)
      (user as { id?: string }).id = uid;
      const displayNames: Record<"Y" | "H", string> = {
        Y: "대영",
        H: "희서",
      };
      (user as { displayName?: string }).displayName = displayNames[uid];
      return true;
    },
    async jwt({ token, user, account }) {
      if (user) {
        const u = user as { id?: string; displayName?: string };
        const t = token as Record<string, unknown>;
        // Google 로그인 시에도 우리 signIn 콜백에서 user.id를 Y/H로 채워둠
        if (u.id === "Y" || u.id === "H") {
          t.uid = u.id;
        } else if (account?.provider === "google" && u.id) {
          // signIn에서 못 잡힌 경우 안전망 (이메일 기반 재시도)
          const email = (user.email ?? "").trim().toLowerCase();
          if (email === emailForUid("Y")) t.uid = "Y";
          else if (email === emailForUid("H")) t.uid = "H";
        }
        if (u.displayName) {
          t.displayName = u.displayName;
        }
      }
      return token;
    },
    async session({ session, token }) {
      const t = token as { uid?: string; displayName?: string };
      if (t.uid) {
        session.user.id = t.uid;
        session.user.displayName = t.displayName ?? "";
      }
      return session;
    },
  },
};
