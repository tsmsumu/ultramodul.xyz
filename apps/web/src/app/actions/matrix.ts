"use server";

import { db, accessMatrix, roleMatrix, users, matrixApprovals } from "@ultra/db";
import { createAuditLog } from "@ultra/db/src/logger";
import { and, eq } from "@ultra/db";
import { randomUUID } from "crypto";

const isWorkHours = () => {
  // Waktu standar: Senin (1) - Jumat (5), Jam 08:00 - 17:00
  const d = new Date();
  const day = d.getDay();
  const hour = d.getHours();
  return day >= 1 && day <= 5 && hour >= 8 && hour < 17;
};

export async function getUserMatrix(userId: string) {
  try {
    return await db.select().from(accessMatrix).where(eq(accessMatrix.userId, userId));
  } catch (error) {
    console.error("Failed to fetch matrix", error);
    return [];
  }
}

export async function getResolvedPermissions(userId: string | null) {
  try {
    if (!userId) return {}; 

    // Bypass khusus untuk akun Dewa Root agar menu tidak kosong
    if (userId === "SYSTEM_ROOT") {
       return { "ALL_ACCESS_JIT": ["VIEW", "MODIFY", "UPLOAD", "PRINT", "EXPORT"] };
    }

    const userAcc = await db.select().from(users).where(eq(users.id, userId)).limit(1);
    if (!userAcc.length) return {};

    const userObj = userAcc[0];
    const roleBase = await db.select().from(roleMatrix).where(eq(roleMatrix.roleName, userObj.role));
    const userOverrides = await db.select().from(accessMatrix).where(eq(accessMatrix.userId, userId));

    const finalMtx: Record<string, string[]> = {};

    // Jika JIT Emergency aktif, Berikan KUASA DEWA
    if (userObj.emergencyBypass && userObj.emergencyUntil && new Date(userObj.emergencyUntil) > new Date()) {
       // Bebaskan semua menu gaib karena darurat
       return { "ALL_ACCESS_JIT": ["VIEW", "MODIFY", "UPLOAD", "PRINT", "EXPORT"] }; 
       // Di production, bisa me-map seluruh module di sistem. Untuk UI sekarang kita asumsikan jika JIT aktif, sidebar tampil semua.
    }

    // Base Role injection
    roleBase.forEach((rb: any) => {
      try { finalMtx[rb.moduleName] = JSON.parse(rb.permissions); } catch(e){}
    });

    // Custom Overrides & Time Dimension Rule
    userOverrides.forEach((uo: any) => {
      try { 
         let perms = JSON.parse(uo.permissions); 
         if (uo.timeRule === 'WORK_HOURS' && !isWorkHours()) {
            // Evaluasi Beta Pillar: Hukum Ruang Waktu
            // Cabut hak resiko tinggi di luar jam kerja! Hanya boleh VIEW.
            perms = perms.filter((p: string) => p === "VIEW");
         }
         finalMtx[uo.moduleName] = perms; 
      } catch(e){}
    });

    return finalMtx;
  } catch (error) {
    console.error("Resolve matrix fail", error);
    return {};
  }
}

export async function saveUserMatrix(userId: string, moduleName: string, permissions: string[], timeRule: string = '24/7') {
  try {
    const jsonPerms = JSON.stringify(permissions);

    // [KABINET RESOLUSI MATRIKS DIAKTIFKAN]
    // Tidak lagi langsung masuk ke accessMatrix, melainkan diajukan via matrixApprovals ke Inbox

    await db.insert(matrixApprovals).values({
      id: randomUUID(),
      targetUserId: userId,
      moduleName,
      proposedPermissions: jsonPerms,
      proposedTimeRule: timeRule,
      makerId: "SYSTEM", // Seharusnya ID admin yg login
      status: "PENDING", 
      createdAt: new Date(),
    });

    await createAuditLog({
      action: "PROPOSE_MATRIX_ACCESS",
      actorId: "SYSTEM",
      target: userId,
      metadata: { moduleName, timeRule, status: "PENDING_APPROVAL" }
    });

    return { success: true };
  } catch (error) {
    console.error("Failed to propose matrix", error);
    return { success: false };
  }
}

// Fitur Darurat JIT (Panic Button)
export async function triggerEmergencyJit(userId: string, durationMinutes: number = 30) {
   try {
     const expire = new Date();
     expire.setMinutes(expire.getMinutes() + durationMinutes);

     await db.update(users)
       .set({ emergencyBypass: true, emergencyUntil: expire })
       .where(eq(users.id, userId));

     await createAuditLog({
       action: "TRIGGER_JIT_EMERGENCY",
       actorId: userId,
       metadata: { durationMinutes, expire }
     });

     return { success: true };
   } catch(e) { return { success: false }; }
}
