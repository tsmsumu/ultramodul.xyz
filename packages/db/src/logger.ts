import { db } from './index';
import { auditLogs } from './schema';
import { randomUUID } from 'crypto';

interface LogPayload {
  action: string;
  actorId: string;
  target?: string;
  metadata?: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
}

/**
 * Global Logbook Function
 * Records any action safely without redundantly rewriting inserts.
 */
export async function createAuditLog(payload: LogPayload) {
  try {
    await db.insert(auditLogs).values({
      id: randomUUID(),
      action: payload.action,
      actorId: payload.actorId,
      target: payload.target || null,
      metadata: payload.metadata ? JSON.stringify(payload.metadata) : null,
      ipAddress: payload.ipAddress || null,
      userAgent: payload.userAgent || null,
      createdAt: new Date(),
    });
  } catch (error) {
    // In strict enterprise mode, failing to log might need to block the transaction.
    // However, we just log it to console to not crash the UI abruptly for now.
    console.error('CRITICAL: Audit Log Failed', error);
  }
}
