import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import Credentials from "next-auth/providers/credentials";
import { DrizzleAdapter } from "@auth/drizzle-adapter";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";
import { getDb } from "./db";
import { users, accounts, sessions, verificationTokens } from "./db/schema";

/** Auth is "configured" once a session secret and a database are present. */
export function isAuthConfigured(): boolean {
  return Boolean(process.env.AUTH_SECRET && process.env.DATABASE_URL);
}

/** Google sign-in is available once its OAuth client is set. */
export function isGoogleConfigured(): boolean {
  return Boolean(
    (process.env.AUTH_GOOGLE_ID || process.env.GOOGLE_CLIENT_ID) &&
      (process.env.AUTH_GOOGLE_SECRET || process.env.GOOGLE_CLIENT_SECRET),
  );
}

const googleProvider = isGoogleConfigured()
  ? [
      Google({
        clientId: process.env.AUTH_GOOGLE_ID ?? process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.AUTH_GOOGLE_SECRET ?? process.env.GOOGLE_CLIENT_SECRET,
        allowDangerousEmailAccountLinking: true,
      }),
    ]
  : [];

const credentialsProvider = Credentials({
  credentials: { email: {}, password: {} },
  authorize: async (creds) => {
    const email = String(creds?.email ?? "").trim().toLowerCase();
    const password = String(creds?.password ?? "");
    if (!email || !password) return null;
    const db = getDb();
    const rows = await db.select().from(users).where(eq(users.email, email)).limit(1);
    const user = rows[0];
    if (!user?.passwordHash) return null;
    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) return null;
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      image: user.image,
      wholesaleApproved: user.wholesaleApproved,
    };
  },
});

export const { handlers, auth, signIn, signOut } = NextAuth({
  // Only attach the DB adapter when configured so the app still builds/runs
  // without DATABASE_URL.
  adapter: process.env.DATABASE_URL
    ? DrizzleAdapter(getDb(), {
        usersTable: users,
        accountsTable: accounts,
        sessionsTable: sessions,
        verificationTokensTable: verificationTokens,
      })
    : undefined,
  session: { strategy: "jwt" },
  trustHost: true,
  pages: { signIn: "/login" },
  providers: [...googleProvider, credentialsProvider],
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.id = user.id as string;
        token.wholesaleApproved = Boolean(
          (user as { wholesaleApproved?: boolean }).wholesaleApproved,
        );
      }
      // allow client `update()` to refresh wholesale state without re-login
      const upd = session as { wholesaleApproved?: boolean } | undefined;
      if (trigger === "update" && upd?.wholesaleApproved !== undefined) {
        token.wholesaleApproved = Boolean(upd.wholesaleApproved);
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.wholesaleApproved = Boolean(token.wholesaleApproved);
      }
      return session;
    },
  },
});
