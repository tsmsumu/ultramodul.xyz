"use server";

import { db, users } from "@ultra/db";
import { eq } from "drizzle-orm";
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

    // Cek Real Database
    const records = await db.select().from(users).where(eq(users.username, identCode)).limit(1);
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
