import type { ReactNode } from "react";
import { DashboardShell } from "../../component/layout/dashboardshell";

export default function DashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  return <DashboardShell>{children}</DashboardShell>;
}