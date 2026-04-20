"use server";

import { db, users, eq } from "@ultra/db";
import { createAuditLog } from "@ultra/db/src/logger";
import { randomUUID } from "crypto";

export async function getUsers() {
  try {
    return await db.select().from(users).orderBy(users.createdAt);
  } catch (error) {
    console.error("Failed to fetch users", error);
    return [];
  }
}

export async function createIdentity(data: { nik: string; name: string; role: string }) {
  try {
    const newId = randomUUID();
    await db.insert(users).values({
      id: newId,
      nik: data.nik,
      name: data.name,
      role: data.role,
      status: "active",
      createdAt: new Date(),
    });

    // Logging the action automatically
    await createAuditLog({
      action: "CREATE_IDENTITY",
      actorId: "SYSTEM", // Placeholder for actual logged-in user
      target: data.nik,
      metadata: { role: data.role, origin: "IAM Console" }
    });

    return { success: true, message: `Identity ${data.nik} created.` };
  } catch (error) {
    console.error("Creation failed", error);
    return { success: false, message: "Transaction failed." };
  }
}

export async function toggleIdentityStatus(id: string, currentStatus: string) {
  try {
    const newStatus = currentStatus === "active" ? "inactive" : "active";
    await db.update(users).set({ status: newStatus }).where(eq(users.id, id));

    await createAuditLog({
      action: "TOGGLE_IDENTITY_STATUS",
      actorId: "SYSTEM",
      target: id,
      metadata: { newStatus }
    });

    return { success: true };
  } catch (error) {
    return { success: false };
  }
}
