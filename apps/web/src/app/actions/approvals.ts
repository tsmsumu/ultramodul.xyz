"use server";

import { db, matrixApprovals, accessMatrix, users } from "@ultra/db";
import { createAuditLog } from "@ultra/db/src/logger";
import { eq, and } from "@ultra/db";
import { randomUUID } from "crypto";

export async function getPendingApprovals() {
  try {
    return await db.select().from(matrixApprovals).where(eq(matrixApprovals.status, "PENDING"));
  } catch (error) {
    return [];
  }
}

export async function resolveApproval(approvalId: string, checkerId: string, isApproved: boolean) {
  try {
    const apps = await db.select().from(matrixApprovals).where(eq(matrixApprovals.id, approvalId));
    if (!apps.length) return { success: false };

    const apv = apps[0];

    if (isApproved) {
       const existingMtx = await db.select().from(accessMatrix).where(
         and(eq(accessMatrix.userId, apv.targetUserId), eq(accessMatrix.moduleName, apv.moduleName))
       );

       if (existingMtx.length > 0) {
         await db.update(accessMatrix)
           .set({ permissions: apv.proposedPermissions, timeRule: apv.proposedTimeRule })
           .where(eq(accessMatrix.id, existingMtx[0].id));
       } else {
         await db.insert(accessMatrix).values({
           id: randomUUID(),
           userId: apv.targetUserId,
           moduleName: apv.moduleName,
           permissions: apv.proposedPermissions,
           timeRule: apv.proposedTimeRule,
           grantedBy: checkerId,
           createdAt: new Date()
         });
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
