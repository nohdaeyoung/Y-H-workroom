import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { authConfig } from "@/auth.config";
import { getUserById } from "@/lib/users";

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [
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
  ],
});
