"use server";

import { db } from "@ultra/db";
import { users, systemLogs, pengaduanPublik } from "@ultra/db/src/schema";
import { desc, count, eq } from "drizzle-orm";

export async function getGodsEyeTelemetry() {
  try {
    const totalUsersReq = db.select({ value: count() }).from(users);
    const activeUsersReq = db.select({ value: count() }).from(users).where(eq(users.status, 'active'));
    const totalComplaintsReq = db.select({ value: count() }).from(pengaduanPublik);

    // Parallel Fetch for massive speed
    const [totalUsersObj, activeUsersObj, totalComplaintsObj] = await Promise.all([
      totalUsersReq,
      activeUsersReq,
      totalComplaintsReq
    ]);

    const complaintsList = await db.select()
       .from(pengaduanPublik)
       .where(eq(pengaduanPublik.status, "OPEN"))
       .orderBy(desc(pengaduanPublik.createdAt))
       .limit(5);

    const logsList = await db.select()
       .from(systemLogs)
       .orderBy(desc(systemLogs.timestamp))
       .limit(8);

    return {
      success: true,
      data: {
        totalUsers: totalUsersObj[0].value,
        activeUsers: activeUsersObj[0].value,
        totalComplaints: totalComplaintsObj[0].value,
        recentComplaints: complaintsList,
        recentLogs: logsList
      }
    }
  } catch (err: any) {
    return { success: false, data: null, error: err.message };
  }
}
