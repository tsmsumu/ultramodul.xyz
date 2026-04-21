"use server";

import { db, matrixApprovals, accessMatrix, users } from "@ultra/db";
import { createAuditLog } from "@ultra/db/src/logger";
import { eq, and } from "@ultra/db";
import { randomUUID } from "crypto";

export async function getPendingApprovals() {
  try {
    const list: any[] = [];
    
    // 1. Fetch Pendings for Matrix
    const matrixReqs = await db.select().from(matrixApprovals).where(eq(matrixApprovals.status, "PENDING"));
    matrixReqs.forEach(m => list.push({ type: "MATRIX", ...m }));

    // 2. Fetch Pendings for New Identities
    const userReqs = await db.select().from(users).where(eq(users.status, "pending"));
    userReqs.forEach(u => list.push({
       type: "IDENTITY",
       id: u.id,
       moduleName: "SYSTEM_ACCOUNT",
       targetUserId: u.username,
       proposedTimeRule: "Registration",
       proposedPermissions: `Role: ${u.role} | Nama: ${u.name}`,
    }));

    return list;
  } catch (error) {
    return [];
  }
}

export async function resolveApproval(approvalId: string, checkerId: string, isApproved: boolean, type: string = "MATRIX") {
  try {
    if (type === "IDENTITY") {
      // Resolve Account Registration
      const newStatus = isApproved ? "active" : "blocked";
      await db.update(users).set({ status: newStatus }).where(eq(users.id, approvalId));
      
      await createAuditLog({
        action: "RESOLVE_IDENTITY_APPROVAL",
        actorId: checkerId,
        target: approvalId,
        metadata: { isApproved, newStatus }
      });
      return { success: true };
    }

    // Resolve Matrix Access
    const apps = await db.select().from(matrixApprovals).where(eq(matrixApprovals.id, approvalId));
    if (!apps.length) return { success: false };

    const apv = apps[0];

    if (isApproved) {
       if (apv.moduleName === "PASSWORD_RESET") {
          // GANTI SANDI
          await db.update(users).set({ passwordHash: apv.proposedPermissions }).where(eq(users.id, apv.targetUserId));
       } else if (apv.moduleName === "DELETE_ACCOUNT") {
          // PEMUSNAHAN IDENTITAS (PERMADEATH)
          await db.delete(users).where(eq(users.id, apv.targetUserId));
       } else {
         const existingMtx = await db.select().from(accessMatrix).where(
           and(eq(accessMatrix.userId, apv.targetUserId), eq(accessMatrix.moduleName, apv.moduleName))
         );

         if (existingMtx.length > 0) {
           await db.update(accessMatrix)
             .set({ permissions: apv.proposedPermissions, timeRule: apv.proposedTimeRule || "24/7" })
             .where(eq(accessMatrix.id, existingMtx[0].id));
         } else {
           await db.insert(accessMatrix).values({
             id: randomUUID(),
             userId: apv.targetUserId,
             moduleName: apv.moduleName,
             permissions: apv.proposedPermissions,
             timeRule: apv.proposedTimeRule || "24/7",
             grantedBy: checkerId,
             createdAt: new Date()
           });
         }
       }
    }

    // Update status
    await db.update(matrixApprovals).set({
      status: isApproved ? "APPROVED" : "REJECTED",
      checkerId,
      resolvedAt: new Date()
    }).where(eq(matrixApprovals.id, approvalId));

    await createAuditLog({
      action: "RESOLVE_MATRIX_APPROVAL",
      actorId: checkerId,
      target: approvalId,
      metadata: { isApproved }
    });

    return { success: true };
  } catch (e) {
    return { success: false };
  }
}
