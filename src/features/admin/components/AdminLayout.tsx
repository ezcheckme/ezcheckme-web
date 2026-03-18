import type { ReactNode } from "react";
import { AdminMenu } from "./AdminMenu";

interface AdminLayoutProps {
  children: ReactNode;
}

export function AdminLayout({ children }: AdminLayoutProps) {
  return (
    <div className="flex h-full w-full overflow-hidden bg-[#fafafa]">
      {/* Sidebar menu */}
      <AdminMenu />

      {/* Main content area */}
      <main className="flex-1 overflow-y-auto p-6">{children}</main>
    </div>
  );
}
