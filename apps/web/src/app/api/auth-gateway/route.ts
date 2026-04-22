import { NextRequest, NextResponse } from 'next/server';
import { db } from '@ultra/db';
import { authGatewayMatrix } from '@ultra/db/src/schema';
import crypto from 'crypto';
import { eq } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    const records = await db.select().from(authGatewayMatrix);
    return NextResponse.json({ ultra_status: 'SUCCESS', data: records }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ ultra_status: 'ERROR', message: error.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const payload = await request.json();
    const { action, type, provider, name, isActive, configPayload } = payload;

    if (action === 'UPSERT') {
      // Check if exists
      const existing = await db.select().from(authGatewayMatrix).where(eq(authGatewayMatrix.provider, provider)).limit(1);
      
      if (existing.length > 0) {
        // Update
        await db.update(authGatewayMatrix)
          .set({
            isActive: isActive !== undefined ? isActive : existing[0].isActive,
            configPayload: configPayload !== undefined ? configPayload : existing[0].configPayload,
            updatedAt: new Date()
          })
          .where(eq(authGatewayMatrix.provider, provider));
      } else {
        // Insert
        await db.insert(authGatewayMatrix).values({
          id: crypto.randomUUID(),
          type,
          provider,
          name,
          isActive: isActive || false,
          configPayload: configPayload || '{}',
          createdAt: new Date(),
          updatedAt: new Date()
        });
      }

      return NextResponse.json({ ultra_status: 'SUCCESS', message: 'Provider configured successfully.' }, { status: 200 });
    }

    return NextResponse.json({ ultra_status: 'ERROR', message: 'Unknown action' }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ ultra_status: 'ERROR', message: error.message }, { status: 500 });
  }
}
