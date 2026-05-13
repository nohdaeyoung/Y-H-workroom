import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import bcrypt from "bcryptjs";
import { authConfig } from "@/auth.config";
import { getUserById } from "@/lib/users";

const providers = [
  Credentials({
    id: "yh-credentials",
    name: "Y/H 로그인",
    credentials: {
      id: { label: "아이디", type: "text" },
      password: { label: "비밀번호", type: "password" },
    },
    async authorize(credentials) {
      const id = typeof credentials?.id === "string" ? credentials.id : "";
      const password =
        typeof credentials?.password === "string" ? credentials.password : "";

      if (!id || !password) return null;

      const user = getUserById(id);
      if (!user || !user.passwordHash) return null;

      const valid = await bcrypt.compare(password, user.passwordHash);
      if (!valid) return null;

      return {
        id: user.id,
        name: user.name,
        displayName: user.displayName,
        email: user.email || undefined,
      };
    },
  }),
];

// Google OAuth — env 있을 때만 활성화
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  providers.push(
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      authorization: {
        params: {
          prompt: "select_account",
        },
      },
    }) as never
  );
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers,
});

export function isGoogleEnabled(): boolean {
  return !!(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET);
}
