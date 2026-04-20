"use server";

import { db, accessMatrix, users } from "@ultra/db";
import { createAuditLog } from "@ultra/db/src/logger";
import { and, eq } from "@ultra/db";
import { randomUUID } from "crypto";

export async function getUserMatrix(userId: string) {
  try {
    return await db.select().from(accessMatrix).where(eq(accessMatrix.userId, userId));
  } catch (error) {
    console.error("Failed to fetch matrix", error);
    return [];
  }
}

export async function saveUserMatrix(userId: string, moduleName: string, permissions: string[]) {
  try {
    const existing = await db.select().from(accessMatrix).where(
      and(eq(accessMatrix.userId, userId), eq(accessMatrix.moduleName, moduleName))
    );

    const jsonPerms = JSON.stringify(permissions);

    if (existing.length > 0) {
      await db.update(accessMatrix)
        .set({ permissions: jsonPerms })
        .where(eq(accessMatrix.id, existing[0].id));
    } else {
      await db.insert(accessMatrix).values({
        id: randomUUID(),
        userId,
        moduleName,
        permissions: jsonPerms,
        grantedBy: "SYSTEM",
        createdAt: new Date()
      });
    }

    // Rekam Jejak
    await createAuditLog({
      action: "UPDATE_GRANULAR_MATRIX",
      actorId: "SYSTEM",
      target: userId,
      metadata: { moduleName, permissions }
    });

    return { success: true };
  } catch (error) {
    console.error("Failed to save matrix", error);
    return { success: false };
  }
}
