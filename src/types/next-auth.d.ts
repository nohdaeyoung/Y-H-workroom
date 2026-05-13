import type { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      displayName?: string;
    } & DefaultSession["user"];
  }

  interface User {
    displayName?: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    uid?: string;
    displayName?: string;
  }
}

export {};
