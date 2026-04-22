'use server';

import { db } from '@ultra/db';
import { apiEndpoints } from '@ultra/db/src/schema';
import { eq } from 'drizzle-orm';
import crypto from 'crypto';
import { revalidatePath } from 'next/cache';

export async function createEndpoint(data: any) {
  await db.insert(apiEndpoints).values({
    id: crypto.randomUUID(),
    name: data.name,
    description: data.description,
    pathSlug: data.pathSlug,
    method: data.method,
    type: data.type,
    routingType: data.routingType || 'AUTOMATIC',
    targetUrl: data.targetUrl,
    handlerName: data.handlerName,
    isActive: data.isActive,
    requireAuth: data.requireAuth,
    createdAt: new Date(),
    updatedAt: new Date()
  });

  revalidatePath('/api-exchange');
  return { success: true };
}

export async function updateEndpointStatus(id: string, isActive: boolean) {
  await db.update(apiEndpoints).set({ isActive, updatedAt: new Date() }).where(eq(apiEndpoints.id, id));
  revalidatePath('/api-exchange');
  return { success: true };
}

export async function deleteEndpoint(id: string) {
  await db.delete(apiEndpoints).where(eq(apiEndpoints.id, id));
  revalidatePath('/api-exchange');
  return { success: true };
}
