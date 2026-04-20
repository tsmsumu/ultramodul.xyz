"use server";

import { cookies } from "next/headers";
import { db, users } from "@ultra/db";
import { createAuditLog } from "@ultra/db/src/logger";

export async function fetchSandboxUsers() {
  try {
    return await db.select().from(users);
  } catch (error) {
    return [];
  }
}

export async function impersonateUser(userId: string) {
  try {
    const cookieStore = await cookies();
    cookieStore.set("SESSION_MOCK_USER_ID", userId, { maxAge: 86400, path: "/" });
    
    await createAuditLog({
      action: "IMPERSONATE_SANDBOX",
      actorId: userId,
      metadata: { note: "Logged in via Sandbox" }
    });
    return { success: true };
  } catch (e) {
    return { success: false };
  }
}

export async function clearImpersonation() {
   const cookieStore = await cookies();
   cookieStore.delete("SESSION_MOCK_USER_ID");
}
