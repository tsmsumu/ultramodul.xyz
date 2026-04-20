import { cookies } from "next/headers";
import ClientDashboardLayout from "./client-layout";
import { ReactNode } from "react";
import { getResolvedPermissions } from "../actions/matrix";
import { redirect } from "next/navigation";

export default async function DashboardLayoutServer({ children }: { children: ReactNode }) {
  const cookieStore = await cookies();
  const layoutType = cookieStore.get("PREF_LAYOUT")?.value || "sidebar";
  const activeUserId = cookieStore.get("UNIVERSAL_SESSION_ID")?.value || null;

  if (!activeUserId) {
    redirect("/auth");
  }

  const permissionsMatrix = await getResolvedPermissions(activeUserId);
  const finalMatrix = permissionsMatrix;  

  return <ClientDashboardLayout layoutType={layoutType} permissions={finalMatrix} activeUserId={activeUserId}>{children}</ClientDashboardLayout>;
}
