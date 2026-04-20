"use server";

import { db, users, eq } from "@ultra/db";
import { createAuditLog } from "@ultra/db/src/logger";
import { cookies } from "next/headers";

export async function saveUserPreferences(aktorId: string, payload: { layoutTemplate?: string, colorSkin?: string }) {
  try {
    const updatePayload: any = {};
    if (payload.layoutTemplate) updatePayload.layoutTemplate = payload.layoutTemplate;
    if (payload.colorSkin) updatePayload.colorSkin = payload.colorSkin;

    await db.update(users).set(updatePayload).where(eq(users.id, aktorId));

    // Fast rendering syncing via cookies (so App Router server components can read immediately without DB trip)
    const cookieStore = await cookies();
    if (payload.layoutTemplate) {
      cookieStore.set("PREF_LAYOUT", payload.layoutTemplate, { maxAge: 31536000, path: "/" });
    }
    if (payload.colorSkin) {
      cookieStore.set("PREF_SKIN", payload.colorSkin, { maxAge: 31536000, path: "/" });
    }

    await createAuditLog({
      action: "UPDATE_PREFERENCES",
      actorId: aktorId,
      metadata: updatePayload,
    });

    return { success: true };
  } catch (error) {
    console.error("Preference update failed", error);
    return { success: false };
  }
}
