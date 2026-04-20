"use server";

import { db } from "@ultra/db/src";
import { sql } from "drizzle-orm";

export async function executeVacuumDb() {
   try {
      await db.run(sql`VACUUM`);
      return { success: true };
   } catch (error: any) {
      return { success: false, error: error.message };
   }
}

export async function executeReindexDb() {
   try {
      await db.run(sql`REINDEX`);
      return { success: true };
   } catch (error: any) {
      return { success: false, error: error.message };
   }
}
