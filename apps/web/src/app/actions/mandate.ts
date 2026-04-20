"use server";

import { db, mandates, users, eq, desc } from "@ultra/db";
import { createAuditLog } from "@ultra/db/src/logger";
import { randomUUID } from "crypto";

export async function getMandates() {
  try {
    // Ideally we would do a standard join, but keeping it simple for the ultra-fast app router response:
    const allMandates = await db.select().from(mandates).orderBy(desc(mandates.createdAt));
    const allUsers = await db.select().from(users);

    return allMandates.map(m => {
      const delegator = allUsers.find(u => u.id === m.delegatorId);
      const delegatee = allUsers.find(u => u.id === m.delegateeId);
      return {
        ...m,
        delegatorName: delegator?.name || "Unknown",
        delegateeName: delegatee?.name || "Unknown",
      };
    });
  } catch (error) {
    console.error("Failed to fetch mandates", error);
    return [];
  }
}

export async function createMandate(data: { delegatorId: string; delegateeId: string; taskDescription: string; validUntilSeconds: number }) {
  try {
    const newId = randomUUID();
    const expiry = new Date(Date.now() + (data.validUntilSeconds * 1000));
    
    await db.insert(mandates).values({
      id: newId,
      delegatorId: data.delegatorId,
      delegateeId: data.delegateeId,
      taskDescription: data.taskDescription,
      status: "PENDING",
      validUntil: expiry,
      createdAt: new Date(),
      updatedAt: new Date()
    });

    // Otomatis tercatat di Audit Log
    await createAuditLog({
      action: "CREATE_MANDATE",
      actorId: data.delegatorId,
      target: data.delegateeId,
      metadata: { taskId: newId, expiry }
    });

    return { success: true };
  } catch (error) {
    console.error("Create mandate failed", error);
    return { success: false };
  }
}

export async function updateMandateStatus(id: string, actorId: string, newStatus: string) {
  try {
    await db.update(mandates)
      .set({ status: newStatus, updatedAt: new Date() })
      .where(eq(mandates.id, id));

    await createAuditLog({
      action: `MANDATE_STATUS_${newStatus.toUpperCase()}`,
      actorId: actorId,
      target: id,
    });

    return { success: true };
  } catch (error) {
    return { success: false };
  }
}
