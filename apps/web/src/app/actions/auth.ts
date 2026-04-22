"use server";

import { db, users } from "@ultra/db";
import { eq, or } from "drizzle-orm";
import { createHash } from "crypto";
import { cookies } from "next/headers";
import { createAuditLog } from "@ultra/db/src/logger";

export async function loginAction(data: FormData) {
  try {
    const identCode = (data.get("identity") as string).trim();
    const pass = (data.get("password") as string).trim();

    if (!identCode || !pass) return { success: false, message: "Identity Code dan Password wajib diisi." };

    const passHash = createHash("sha256").update(pass).digest("hex");

    // Bypass dewa khusus Root (Bypass) buat jaga-jaga kalau VPS mati
    if (identCode === "1111222233334444" && pass === "sss") {
      const cookieStore = await cookies();
      cookieStore.set("UNIVERSAL_SESSION_ID", "SYSTEM_ROOT", { path: "/" });
      return { success: true };
    }

    // Auto-Sanitizer for Phone Numbers
    let normalizedPhone = identCode.replace(/\D/g, ""); // Strip non-digits
    if (normalizedPhone.startsWith("0")) {
      normalizedPhone = "62" + normalizedPhone.slice(1);
    }

    // Cek Real Database via Omni-Search (Satu input mencari ke semua titik identitas)
    const records = await db.select().from(users).where(
      or(
        eq(users.username, identCode),
        eq(users.name, identCode),
        eq(users.email, identCode),
        eq(users.phoneNumber, normalizedPhone)
      )
    ).limit(1);
    
    if (!records.length) {
      return { success: false, message: "Identitas tidak ditemukan sistem." };
    }

    const user = records[0];

    if (user.passwordHash !== passHash) {
      return { success: false, message: "Kredensial keamanan tidak cocok." };
    }

    if (user.status !== "active") {
      return { success: false, message: "Identitas Anda sedang diblokir atau pending. Hubungi Administrator." };
    }

    // Lolos otentikasi
    const cookieStore = await cookies();
    cookieStore.set("UNIVERSAL_SESSION_ID", user.id, { 
      path: "/",
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 7 * 24 * 60 * 60 // 7 days
    });

    await createAuditLog({
      action: "USER_LOGIN",
      actorId: user.id,
      metadata: { method: "Password Hash" }
    });

    return { success: true };

  } catch (error) {
    console.error("Login Error:", error);
    return { success: false, message: "Kesalahan server internal." };
  }
}

export async function logoutAction() {
  const cookieStore = await cookies();
  cookieStore.delete("UNIVERSAL_SESSION_ID");
  return { success: true };
}

export async function updateIdentity(formData: FormData) {
  try {
    const cookieStore = await cookies();
    const sessionId = cookieStore.get("UNIVERSAL_SESSION_ID")?.value;
    
    if (!sessionId) {
      return { success: false, message: "Akses Ditolak. Sesi kedaluwarsa." };
    }

    const currentRecords = await db.select().from(users).where(eq(users.id, sessionId)).limit(1);
    if (!currentRecords.length) {
      return { success: false, message: "Pengguna tidak ditemukan." };
    }

    const user = currentRecords[0];

    const fullName = (formData.get("fullName") as string)?.trim();
    const newPassword = (formData.get("password") as string)?.trim();
    
    const updatePayload: any = {};
    if (fullName && fullName !== user.name) {
      updatePayload.name = fullName;
    }

    if (newPassword && newPassword.length >= 3) {
      updatePayload.passwordHash = createHash("sha256").update(newPassword).digest("hex");
    }

    if (Object.keys(updatePayload).length > 0) {
      await db.update(users).set(updatePayload).where(eq(users.id, sessionId));
      
      await createAuditLog({
        action: "IDENTITY_UPDATE",
        actorId: sessionId,
        metadata: { updatedFields: Object.keys(updatePayload) }
      });
      
      return { success: true, message: "Identitas berhasil diperbarui di Vault." };
    }

    return { success: true, message: "Tidak ada perubahan." };

  } catch (error: any) {
    console.error("Update Identity Error:", error);
    return { success: false, message: "Kesalahan internal server." };
  }
}

export async function getActiveUserId() {
  const cookieStore = await cookies();
  return cookieStore.get("UNIVERSAL_SESSION_ID")?.value || "anonymous";
}
