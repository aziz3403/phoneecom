import {
  pgTable,
  text,
  timestamp,
  boolean,
  integer,
  jsonb,
  primaryKey,
} from "drizzle-orm/pg-core";
import type { AdapterAccountType } from "next-auth/adapters";

/**
 * Auth.js core tables (users / accounts / sessions / verificationTokens) plus
 * reMint extras: a password hash for the credentials provider, wholesale
 * approval state, password-reset tokens, and persisted orders.
 */

export const users = pgTable("user", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  name: text("name"),
  email: text("email").unique(),
  emailVerified: timestamp("emailVerified", { mode: "date" }),
  image: text("image"),
  // reMint extras
  passwordHash: text("passwordHash"),
  wholesaleApproved: boolean("wholesaleApproved").notNull().default(false),
  wholesaleCompany: text("wholesaleCompany"),
});

export const accounts = pgTable(
  "account",
  {
    userId: text("userId")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    type: text("type").$type<AdapterAccountType>().notNull(),
    provider: text("provider").notNull(),
    providerAccountId: text("providerAccountId").notNull(),
    refresh_token: text("refresh_token"),
    access_token: text("access_token"),
    expires_at: integer("expires_at"),
    token_type: text("token_type"),
    scope: text("scope"),
    id_token: text("id_token"),
    session_state: text("session_state"),
  },
  (account) => [
    primaryKey({ columns: [account.provider, account.providerAccountId] }),
  ],
);

export const sessions = pgTable("session", {
  sessionToken: text("sessionToken").primaryKey(),
  userId: text("userId")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  expires: timestamp("expires", { mode: "date" }).notNull(),
});

export const verificationTokens = pgTable(
  "verificationToken",
  {
    identifier: text("identifier").notNull(),
    token: text("token").notNull(),
    expires: timestamp("expires", { mode: "date" }).notNull(),
  },
  (vt) => [primaryKey({ columns: [vt.identifier, vt.token] })],
);

/** Editable saved profile / shipping address (separate table → adding it never
 * touches the auth tables or login queries). */
export const userProfiles = pgTable("userProfile", {
  userId: text("userId")
    .primaryKey()
    .references(() => users.id, { onDelete: "cascade" }),
  fullName: text("fullName"),
  phone: text("phone"),
  line1: text("line1"),
  city: text("city"),
  state: text("state"),
  zip: text("zip"),
  country: text("country").default("United States"),
  updatedAt: timestamp("updatedAt", { mode: "date" }).notNull().defaultNow(),
});

export const passwordResetTokens = pgTable("passwordResetToken", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  userId: text("userId")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  token: text("token").notNull().unique(),
  expires: timestamp("expires", { mode: "date" }).notNull(),
});

export const orders = pgTable("order", {
  id: text("id").primaryKey(), // human-facing RM-XXXXXX
  userId: text("userId").references(() => users.id, { onDelete: "set null" }),
  email: text("email"),
  total: integer("total").notNull(),
  status: text("status").notNull().default("Confirmed"),
  createdAt: timestamp("createdAt", { mode: "date" }).notNull().defaultNow(),
  /** full order snapshot (lines, shipping, totals, eco) for the receipt */
  data: jsonb("data").notNull(),
});

export type DbOrder = typeof orders.$inferSelect;
