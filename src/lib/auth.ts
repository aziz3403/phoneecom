import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import Credentials from "next-auth/providers/credentials";
import { DrizzleAdapter } from "@auth/drizzle-adapter";
import { eq, and, isNull } from "drizzle-orm";
import bcrypt from "bcryptjs";
import { getDb } from "./db";
import { users, accounts, sessions, verificationTokens, orders } from "./db/schema";

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
  session: { strategy: "jwt", maxAge: 60 * 60 * 24 * 30 }, // stay signed in 30 days
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
      // Client `update()` refreshes wholesale state without re-login — but the
      // value comes from the DB, never the client (approval is owner-gated).
      void session;
      if (trigger === "update" && token.id) {
        try {
          const db = getDb();
          const rows = await db
            .select({ wholesaleApproved: users.wholesaleApproved })
            .from(users)
            .where(eq(users.id, token.id as string))
            .limit(1);
          if (rows[0]) token.wholesaleApproved = rows[0].wholesaleApproved;
        } catch {
          /* keep the existing token value */
        }
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
  events: {
    // Attach any orders placed as a guest (same email) to the account on sign-in.
    async signIn({ user }) {
      if (!user?.id || !user.email) return;
      try {
        const db = getDb();
        await db
          .update(orders)
          .set({ userId: user.id })
          .where(and(eq(orders.email, user.email.toLowerCase()), isNull(orders.userId)));
      } catch {
        /* non-fatal */
      }
    },
  },
});
