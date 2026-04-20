"use server";

import { db, users, eq } from "@ultra/db";
import { createAuditLog } from "@ultra/db/src/logger";
import { randomUUID, createHash } from "crypto";

/**
 * Universal Identity Verifier (AI Sandbox)
 * Platform Universal: Tidak terikat pada NIK Indonesia.
 * Menerima Passport, SSO ID, NIK, atau ID Universal lainnya.
 */
function isValidIdentityFormat(identityStr: string): boolean {
  // Hukum Universal: Minimal 5 karakter, maksimal 30 karakter, Alphanumeric
  const isAlphaNumeric = /^[a-zA-Z0-9_-]{5,30}$/.test(identityStr);
  return isAlphaNumeric;
}

export async function registerPublicMember(formData: FormData) {
  try {
    const ssoId = formData.get("username") as string; 
    const name = formData.get("name") as string;
    const plainPassword = formData.get("password") as string;

    if (!ssoId || !name || !plainPassword) {
      return { success: false, message: "Semua kolom merah wajib diisi." };
    }

    // Cek duplikasi Identity Code
    const existing = await db.select().from(users).where(eq(users.username, ssoId)).get();
    if (existing) {
      return { success: false, message: "Peringatan: ID Universal ini sudah terdaftar dalam radar sistem!" };
    }

    // EKSEKUSI MESIN VERVAL UNIVERSAL
    const isValid = isValidIdentityFormat(ssoId);
    const assignedStatus = isValid ? "active" : "pending";

    // Hash Kriptografi Password
    const passwordHash = createHash("sha256").update(plainPassword).digest("hex");
    const newId = randomUUID();

    // Injeksi ke Database Utama (Zero-Redundancy)
    await db.insert(users).values({
      id: newId,
      username: ssoId,
      name,
      role: "member", // Kuncian takhta Publik
      branchCode: "PUBLIC",
      status: assignedStatus,
      passwordHash,
      createdAt: new Date()
    });

    // Logging Intelijen
    await createAuditLog({
      action: "PUBLIC_REGISTRATION",
      actorId: newId,
      metadata: { 
        note: `Masyarakat mendaftar mandiri. Mesin Verval memutuskan: ${assignedStatus.toUpperCase()}` 
      }
    });

    return { 
      success: true, 
      status: assignedStatus,
      message: isValid ? "Verval Berhasil Ditembus" : "Verval Gagal, Karantina Pengawas"
    };

  } catch (error) {
    return { success: false, message: "Konektor Drizzle Runtuh saat menyuntik data." };
  }
}
