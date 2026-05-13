import type { NextAuthConfig } from "next-auth";

export const authConfig: NextAuthConfig = {
  trustHost: true,
  session: { strategy: "jwt" },
  pages: { signIn: "/login" },
  providers: [],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        const u = user as { id?: string; displayName?: string };
        if (u.id) token.uid = u.id;
        if (u.displayName) token.displayName = u.displayName;
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
