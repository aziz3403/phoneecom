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
  isAdmin: boolean("isAdmin").notNull().default(false),
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

/** Trade-in submissions from the wizard. Prices are re-derived from the price
 * book server-side, so a tampered client can't inflate its own payout. */
export const tradeIns = pgTable("tradeIn", {
  id: text("id").primaryKey(), // human-facing TI-XXXXXX
  userId: text("userId").references(() => users.id, { onDelete: "set null" }),
  email: text("email").notNull(),
  firstName: text("firstName").notNull(),
  lastName: text("lastName").notNull(),
  phone: text("phone").notNull(),
  payoutMethod: text("payoutMethod").notNull(), // paypal | bank | credit
  total: integer("total").notNull(),
  deviceCount: integer("deviceCount").notNull(),
  status: text("status").notNull().default("Submitted"),
  createdAt: timestamp("createdAt", { mode: "date" }).notNull().defaultNow(),
  /** full submission snapshot (lines, payout details, shipping eligibility) */
  data: jsonb("data").notNull(),
});

export type DbTradeIn = typeof tradeIns.$inferSelect;

/** Bulk buyback quote requests from vendors (resellers, repair shops…). */
export const bulkQuotes = pgTable("bulkQuote", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  firstName: text("firstName").notNull(),
  lastName: text("lastName").notNull(),
  company: text("company"),
  email: text("email").notNull(),
  phone: text("phone").notNull(),
  batchSize: text("batchSize").notNull(),
  notes: text("notes"),
  status: text("status").notNull().default("New"),
  createdAt: timestamp("createdAt", { mode: "date" }).notNull().defaultNow(),
});

export type DbBulkQuote = typeof bulkQuotes.$inferSelect;

/** Wholesale trade-account applications — reviewed by the owner in /admin
 * (approval is no longer self-serve). */
export const wholesaleApplications = pgTable("wholesaleApplication", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  userId: text("userId")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  company: text("company").notNull(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  volume: text("volume"),
  businessType: text("businessType"),
  region: text("region"),
  message: text("message"),
  status: text("status").notNull().default("Pending"),
  createdAt: timestamp("createdAt", { mode: "date" }).notNull().defaultNow(),
  decidedAt: timestamp("decidedAt", { mode: "date" }),
});

export type DbWholesaleApplication = typeof wholesaleApplications.$inferSelect;
