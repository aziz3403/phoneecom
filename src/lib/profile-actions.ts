"use server";

import { eq } from "drizzle-orm";
import { auth, isAuthConfigured } from "./auth";
import { getDb } from "./db";
import { userProfiles } from "./db/schema";

export interface Profile {
  fullName: string;
  phone: string;
  line1: string;
  city: string;
  state: string;
  zip: string;
  country: string;
}

export async function getProfile(): Promise<Profile | null> {
  if (!isAuthConfigured()) return null;
  try {
    const session = await auth();
    const userId = session?.user?.id;
    if (!userId) return null;
    const db = getDb();
    const rows = await db.select().from(userProfiles).where(eq(userProfiles.userId, userId)).limit(1);
    const p = rows[0];
    if (!p) return null;
    return {
      fullName: p.fullName ?? "",
      phone: p.phone ?? "",
      line1: p.line1 ?? "",
      city: p.city ?? "",
      state: p.state ?? "",
      zip: p.zip ?? "",
      country: p.country ?? "United States",
    };
  } catch {
    // userProfile table not created yet — degrade gracefully
    return null;
  }
}

export async function saveProfileAction(input: Profile): Promise<{ ok: boolean; error?: string }> {
  if (!isAuthConfigured()) return { ok: false, error: "Accounts aren't configured." };
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) return { ok: false, error: "Please sign in." };
  try {
    const db = getDb();
    const set = {
      fullName: input.fullName.trim() || null,
      phone: input.phone.trim() || null,
      line1: input.line1.trim() || null,
      city: input.city.trim() || null,
      state: input.state.trim() || null,
      zip: input.zip.trim() || null,
      country: input.country.trim() || "United States",
      updatedAt: new Date(),
    };
    await db
      .insert(userProfiles)
      .values({ userId, ...set })
      .onConflictDoUpdate({ target: userProfiles.userId, set });
    return { ok: true };
  } catch {
    return { ok: false, error: "Saved-address storage isn't set up yet — run the userProfile migration (see SETUP.md)." };
  }
}
