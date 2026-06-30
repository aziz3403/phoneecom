import type { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      wholesaleApproved: boolean;
    } & DefaultSession["user"];
  }
  interface User {
    wholesaleApproved?: boolean;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string;
    wholesaleApproved?: boolean;
  }
}
