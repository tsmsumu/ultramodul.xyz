import { cookies } from "next/headers";
import ClientDashboardLayout from "./client-layout";
import { ReactNode } from "react";

export default async function DashboardLayoutServer({ children }: { children: ReactNode }) {
  const cookieStore = await cookies();
  const layoutType = cookieStore.get("PREF_LAYOUT")?.value || "sidebar";

  return <ClientDashboardLayout layoutType={layoutType}>{children}</ClientDashboardLayout>;
}
