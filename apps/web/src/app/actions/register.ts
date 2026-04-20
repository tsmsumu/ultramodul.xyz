"use server";

import { db, users, eq } from "@ultra/db";
import { createAuditLog } from "@ultra/db/src/logger";
import { randomUUID, createHash } from "crypto";

/**
 * AI Verval Engine (The NIK AI Verifier)
 * Memastikan NIK masuk akal secara format Dukcapil Indonesia.
 */
function isNikFormatValid(nik: string): boolean {
  // Hukum 1: Harus mutlak 16 digit angka
  const is16Digits = /^\d{16}$/.test(nik);
  if (!is16Digits) return false;

  // Hukum 2: Ekstraksi tanggal lahir (Digit ke 7-12)
  const dd = parseInt(nik.substring(6, 8));
  const mm = parseInt(nik.substring(8, 10));
  
  const validDay = (dd >= 1 && dd <= 31) || (dd >= 41 && dd <= 71); // Pria vs Wanita
  const validMonth = (mm >= 1 && mm <= 12);
  
  return validDay && validMonth;
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

    // EKSEKUSI MESIN VERVAL NIK AI
    const isValid = isNikFormatValid(ssoId);
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
