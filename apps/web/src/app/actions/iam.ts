"use server";

import { db, users, eq, matrixApprovals, ne } from "@ultra/db";
import { createAuditLog } from "@ultra/db/src/logger";
import { randomUUID, createHash } from "crypto";
import { cookies } from "next/headers";

export async function getCurrentUserRole() {
  const cookieStore = await cookies();
  const sessionId = cookieStore.get("UNIVERSAL_SESSION_ID")?.value;
  if (!sessionId) return "viewer";
  if (sessionId === "SYSTEM_ROOT") return "owner";
  
  try {
    const user = await db.select({ role: users.role }).from(users).where(eq(users.id, sessionId)).limit(1);
    if (user.length > 0) return user[0].role;
  } catch (e) {
    console.error("Failed to fetch user role", e);
  }
  return "viewer";
}

export async function getUsers() {
  try {
    const role = await getCurrentUserRole();
    if (role === "owner") {
      return await db.select().from(users).orderBy(users.createdAt);
    } else {
      return await db.select().from(users).where(ne(users.role, "owner")).orderBy(users.createdAt);
    }
  } catch (error) {
    console.error("Failed to fetch users", error);
    return [];
  }
}

export async function createIdentity(data: { username: string; name: string; role: string; plainPassword?: string; phoneNumber?: string; email?: string }) {
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
      status: "pending", // KABINET RESOLUSI: Identitas baru harus PENDING
      passwordHash,
      phoneNumber: data.phoneNumber ? data.phoneNumber.replace(/\D/g, "") : undefined,
      email: data.email,
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
    
    // Alih-alih di-set langsung, ajukan pengubahan sandi ke Majelis (Inbox Matrix)
    await db.insert(matrixApprovals).values({
      id: randomUUID(),
      targetUserId: id,
      moduleName: "PASSWORD_RESET",
      proposedPermissions: passwordHash, // Menyusupkan hash sandi di kolom ini
      proposedTimeRule: "-",
      status: "PENDING",
      makerId: "SYSTEM",
      createdAt: new Date(),
    });

    await createAuditLog({
      action: "PROPOSE_PASSWORD_RESET",
      actorId: "SYSTEM",
      target: id,
      metadata: { note: "Pengajuan sandi baru dilempar ke Approval Inbox" }
    });

    return { success: true };
  } catch (error) {
    return { success: false };
  }
}

export async function deleteIdentity(id: string) {
  try {
    const targetUser = await db.select().from(users).where(eq(users.id, id)).limit(1);
    if (!targetUser.length) return { success: false, error: "Identitas tidak ditemukan." };
    if (targetUser[0].role === "owner") {
      return { success: false, error: "TINDAKAN ILEGAL: Kasta Owner dilindungi secara mutlak dan tidak bisa dimusnahkan." };
    }

    // KABINET RESOLUSI: Tidak lagi dihapus langsung! Lempar ke Majelis Persidangan.
    await db.insert(matrixApprovals).values({
      id: randomUUID(),
      targetUserId: id,
      moduleName: "DELETE_ACCOUNT",
      proposedPermissions: "PERMADEATH", // Penanda kehancuran mutlak
      proposedTimeRule: "-",
      status: "PENDING",
      makerId: "SYSTEM",
      createdAt: new Date(),
    });

    await createAuditLog({
      action: "PROPOSE_DELETE_IDENTITY",
      actorId: "SYSTEM",
      target: id,
      metadata: { note: "Pengajuan hukuman mati identitas dilempar ke Approval Inbox" }
    });

    return { success: true };
  } catch (error) {
    console.error("Delete proposal failed:", error);
    return { success: false, error: "Gagal memproses antrean hapus user." };
  }
}

export async function importCSVIdentities(csvText: string) {
  try {
    const rows = csvText.split('\n').map(r => r.trim()).filter(r => r.length > 0);
    // Asumsi format CSV: username,name,role
    // Lewati baris pertama jika itu header (username,name,role)
    const startIndex = rows[0].toLowerCase().includes('username') ? 1 : 0;
    
    let imported = 0;
    for (let i = startIndex; i < rows.length; i++) {
       const cols = rows[i].split(',').map(c => c.trim());
       if (cols.length >= 3) {
          const username = cols[0];
          const name = cols[1];
          const role = cols[2];
          
          const newId = randomUUID();
          await db.insert(users).values({
            id: newId,
            username,
            name,
            role,
            status: "pending", // KABINET RESOLUSI: Harus divalidasi/diaktifkan manual
            createdAt: new Date(),
          });
          imported++;
       }
    }

    await createAuditLog({
      action: "IMPORT_IDENTITIES_CSV",
      actorId: "SYSTEM",
      target: "SYS_IAM",
      metadata: { count: imported }
    });

    return { success: true, count: imported };
  } catch (error) {
    console.error("CSV Import failed:", error);
    return { success: false, error: "Gagal mengimpor CSV. Pastikan format: username,name,role" };
  }
}

export async function updateIdentityLanguages(id: string, languages: string[]) {
  try {
    await db.update(users).set({ languages: JSON.stringify(languages) }).where(eq(users.id, id));

    await createAuditLog({
      action: "UPDATE_LANGUAGES",
      actorId: "SYSTEM",
      target: id,
      metadata: { languages }
    });

    return { success: true };
  } catch (error) {
    console.error("Update languages failed:", error);
    return { success: false, error: "Gagal memperbarui bahasa." };
  }
}

export async function updateIdentityByAdmin(id: string, data: { name: string; role: string; phoneNumber?: string; email?: string }) {
  try {
    const targetUser = await db.select().from(users).where(eq(users.id, id)).limit(1);
    if (!targetUser.length) return { success: false, error: "Identitas tidak ditemukan." };
    if (targetUser[0].role === "owner" && data.role !== "owner") {
      return { success: false, error: "TINDAKAN ILEGAL: Kasta Owner tidak bisa diturunkan jabatannya secara sepihak." };
    }

    const phoneNumber = data.phoneNumber ? data.phoneNumber.replace(/\D/g, "") : null;

    await db.update(users).set({
      name: data.name,
      role: data.role,
      phoneNumber,
      email: data.email || null
    }).where(eq(users.id, id));

    await createAuditLog({
      action: "ADMIN_UPDATE_IDENTITY",
      actorId: "SYSTEM",
      target: id,
      metadata: { role: data.role, origin: "IAM Console - Super Edit" }
    });

    return { success: true, message: `Identity updated.` };
  } catch (error) {
    console.error("Update failed", error);
    return { success: false, error: "Gagal memperbarui profil identitas." };
  }
}
