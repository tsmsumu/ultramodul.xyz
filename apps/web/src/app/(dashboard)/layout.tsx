import { cookies } from "next/headers";
import ClientDashboardLayout from "./client-layout";
import { ReactNode } from "react";
import { getResolvedPermissions } from "../actions/matrix";

export default async function DashboardLayoutServer({ children }: { children: ReactNode }) {
  const cookieStore = await cookies();
  const layoutType = cookieStore.get("PREF_LAYOUT")?.value || "sidebar";
  const activeUserId = cookieStore.get("SESSION_MOCK_USER_ID")?.value || null;

  const permissionsMatrix = await getResolvedPermissions(activeUserId);

  // Jika belum ada active user, kita beri fallback (admin dewa sementara agar UI awalnya muncul semua sebelum login/sandbox aktif)
  // Pada produksi riil, jika userId null, redirect ke /login
  const finalMatrix = activeUserId ? permissionsMatrix : null; 

  return <ClientDashboardLayout layoutType={layoutType} permissions={finalMatrix} activeUserId={activeUserId}>{children}</ClientDashboardLayout>;
}
