import { cookies } from "next/headers";
import ClientDashboardLayout from "./client-layout";
import { ReactNode } from "react";
import { getResolvedPermissions } from "../actions/matrix";
import { redirect } from "next/navigation";
import { db, users } from "@ultra/db";
import { eq } from "drizzle-orm";

export default async function DashboardLayoutServer({ children }: { children: ReactNode }) {
  const cookieStore = await cookies();
  const layoutType = cookieStore.get("PREF_LAYOUT")?.value || "sidebar";
  const activeUserId = cookieStore.get("UNIVERSAL_SESSION_ID")?.value || null;

  if (!activeUserId) {
    redirect("/auth");
  }

  const permissionsMatrix = await getResolvedPermissions(activeUserId);
  const finalMatrix = permissionsMatrix;  

  let userLangs = ["id"];
  try {
    const recs = await db.select().from(users).where(eq(users.id, activeUserId)).limit(1);
    if (recs.length > 0 && recs[0].languages) {
      userLangs = JSON.parse(recs[0].languages);
    }
  } catch(e) {}

  return <ClientDashboardLayout layoutType={layoutType} permissions={finalMatrix} activeUserId={activeUserId} userLangs={userLangs}>{children}</ClientDashboardLayout>;
}
