"use server";

import { db, exchangeRates, eq } from "@ultra/db";
import { createAuditLog } from "@ultra/db/src/logger";
import { randomUUID } from "crypto";

export async function getExchangeRates() {
  try {
    return await db.select().from(exchangeRates).orderBy(exchangeRates.pair);
  } catch (error) {
    console.error("Failed to fetch exchange rates", error);
    return [];
  }
}

export async function updateExchangeRate(pair: string, rate: number, isAuto: boolean) {
  try {
    const existing = await db.select().from(exchangeRates).where(eq(exchangeRates.pair, pair)).limit(1);
    
    if (existing.length > 0) {
      await db.update(exchangeRates).set({
        rate,
        isAuto,
        lastUpdated: new Date()
      }).where(eq(exchangeRates.pair, pair));
    } else {
      await db.insert(exchangeRates).values({
        id: randomUUID(),
        pair,
        rate,
        isAuto,
        lastUpdated: new Date()
      });
    }

    await createAuditLog({
      action: "UPDATE_EXCHANGE_RATE",
      actorId: "SYSTEM", // In reality, fetch from session
      target: pair,
      metadata: { rate, isAuto }
    });

    return { success: true };
  } catch (error) {
    console.error("Failed to update exchange rate", error);
    return { success: false, error: "Failed to update exchange rate." };
  }
}

export async function syncExchangeRates() {
  try {
    // Simulasi fetch dari API eksternal (e.g. Fixer.io, ExchangeRate-API)
    // Dalam produksi, gunakan fetch() ke layanan sungguhan.
    const mockRates: Record<string, number> = {
      "USD_IDR": 15850.50 + (Math.random() * 100 - 50), // Fluktuasi simulasi
      "USD_EUR": 0.92 + (Math.random() * 0.05 - 0.025),
      "USD_GBP": 0.79 + (Math.random() * 0.04 - 0.02),
      "USD_JPY": 151.20 + (Math.random() * 5 - 2.5),
    };

    const autoRates = await db.select().from(exchangeRates).where(eq(exchangeRates.isAuto, true));
    
    let syncCount = 0;
    for (const er of autoRates) {
      if (mockRates[er.pair]) {
        await db.update(exchangeRates)
          .set({ rate: mockRates[er.pair], lastUpdated: new Date() })
          .where(eq(exchangeRates.id, er.id));
        syncCount++;
      }
    }

    // Jika kosong sama sekali (pertama kali), inisiasi USD_IDR
    if (autoRates.length === 0) {
      const existingUsdIdr = await db.select().from(exchangeRates).where(eq(exchangeRates.pair, "USD_IDR")).limit(1);
      if (existingUsdIdr.length === 0) {
        await db.insert(exchangeRates).values({
          id: randomUUID(),
          pair: "USD_IDR",
          rate: mockRates["USD_IDR"],
          isAuto: true,
          lastUpdated: new Date()
        });
        syncCount++;
      }
    }

    await createAuditLog({
      action: "SYNC_EXCHANGE_RATES",
      actorId: "SYSTEM",
      target: "EXCHANGE_ENGINE",
      metadata: { syncCount }
    });

    return { success: true, count: syncCount };
  } catch (error) {
    console.error("Sync failed", error);
    return { success: false, error: "Failed to sync exchange rates." };
  }
}
