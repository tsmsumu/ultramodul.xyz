"use server";

import { db } from "@ultra/db/src";
import { pengaduanPublik } from "@ultra/db/src/schema";
import { v4 as uuidv4 } from "uuid";

export async function submitComplaintAction(formData: FormData) {
  try {
    const topic = formData.get("topic") as string;
    const content = formData.get("content") as string;
    
    if (!topic || !content) {
      throw new Error("Data pelaporan tidak lengkap. Mohon isi semua bidang.");
    }

    // Insert real record to Drizzle SQLite
    // In a real flow, reporter_id is bound to current IAM Session Context.
    // For now we lock it to a generic public identifier since it's a citizen gateway.
    const newId = uuidv4();
    await db.insert(pengaduanPublik).values({
      id: newId,
      reporterId: "Warga-ID-" + newId.substring(0, 8),
      topic: topic,
      content: content,
      channelSource: "WEB_PORTAL",
      status: "OPEN",
      createdAt: new Date(),
    });

    return { success: true, id: newId };
  } catch (error: any) {
    console.error("Gagal menaruh data laporan publik:", error);
    return { success: false, error: error.message };
  }
}
