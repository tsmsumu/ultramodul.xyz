"use server";

import { db, users, eq } from "@ultra/db";
import { createAuditLog } from "@ultra/db/src/logger";
import { randomUUID, createHash } from "crypto";

export async function getUsers() {
  try {
    return await db.select().from(users).orderBy(users.createdAt);
  } catch (error) {
    console.error("Failed to fetch users", error);
    return [];
  }
}

export async function createIdentity(data: { username: string; name: string; role: string; plainPassword?: string }) {
  try {
    const newId = randomUUID();
    let passwordHash = null;
    if (data.plainPassword) {
      passwordHash = createHash("sha256").update(data.plainPassword).digest("hex");
    }

    await db.insert(users).values({
      id: newId,
      username: data.username,
      name: data.name,
      role: data.role,
      status: "active",
      passwordHash,
      createdAt: new Date(),
    });

    // Logging the action automatically
    await createAuditLog({
      action: "CREATE_IDENTITY",
      actorId: "SYSTEM", // Placeholder for actual logged-in user
      target: data.username,
      metadata: { role: data.role, origin: "IAM Console" }
    });

    return { success: true, message: `Identity ${data.username} created.` };
  } catch (error) {
    console.error("Creation failed", error);
    return { success: false, message: "Transaction failed." };
  }
}

export async function toggleIdentityStatus(id: string, currentStatus: string) {
  try {
    // Jika pending atau blocked, klik tombol ini akan mengaktifkan (Verval Manual)
    const newStatus = currentStatus === "active" ? "blocked" : "active";
    await db.update(users).set({ status: newStatus }).where(eq(users.id, id));

    await createAuditLog({
      action: "TOGGLE_IDENTITY_STATUS",
      actorId: "SYSTEM",
      target: id,
      metadata: { newStatus, previous: currentStatus }
    });

    return { success: true };
  } catch (error) {
    return { success: false };
  }
}

export async function setRandomPassword(id: string, plainText: string) {
  try {
    const passwordHash = createHash("sha256").update(plainText).digest("hex");
    await db.update(users).set({ passwordHash }).where(eq(users.id, id));

    await createAuditLog({
      action: "GENERATE_TEMPORARY_PASSWORD",
      actorId: "SYSTEM",
      target: id,
      metadata: { note: "Admin generated new temp password" }
    });

    return { success: true };
  } catch (error) {
    return { success: false };
  }
}

export async function deleteIdentity(id: string) {
  try {
    // SECURITY: Di tahap produksi asli, kita perlu mengecek relasi matrix & mandate sebelum dihapus
    await db.delete(users).where(eq(users.id, id));

    await createAuditLog({
      action: "DELETE_IDENTITY",
      actorId: "SYSTEM",
      target: id,
      metadata: { note: "Karakter/User Berhasil Ditarik dari Database Utama" }
    });

    return { success: true };
  } catch (error) {
    console.error("Delete failed:", error);
    return { success: false, error: "Gagal menghapus user, mungkin berkaitan dengan data lain." };
  }
}
