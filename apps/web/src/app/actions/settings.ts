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

import { systemSettings } from "@ultra/db/src/schema";
import { getCurrentUserRole } from "./iam";
import { revalidatePath } from "next/cache";

export async function getPlatformName() {
  try {
    const record = await db.select().from(systemSettings).where(eq(systemSettings.key, "PLATFORM_NAME")).limit(1);
    if (record.length > 0) return record[0].value;
  } catch (error) {
    console.error("Failed to fetch platform name", error);
  }
  return null;
}

export async function updatePlatformName(newName: string) {
  try {
    const role = await getCurrentUserRole();
    if (role !== "owner") {
      return { success: false, message: "Akses Ditolak: Fitur ini eksklusif untuk Supreme Mode (Owner)." };
    }

    if (!newName || newName.trim() === "") {
      return { success: false, message: "Nama platform tidak boleh kosong." };
    }

    const existing = await db.select().from(systemSettings).where(eq(systemSettings.key, "PLATFORM_NAME")).limit(1);
    
    if (existing.length > 0) {
      await db.update(systemSettings)
        .set({ value: newName.trim(), updatedAt: new Date() })
        .where(eq(systemSettings.key, "PLATFORM_NAME"));
    } else {
      await db.insert(systemSettings).values({
        key: "PLATFORM_NAME",
        value: newName.trim(),
        updatedAt: new Date()
      });
    }

    revalidatePath("/about"); // Revalidate cache for the about page
    return { success: true, message: "Platform Name berhasil diubah!" };
  } catch (error: any) {
    console.error("Update Platform Name Error:", error);
    return { success: false, message: "Kesalahan internal server." };
  }
}

