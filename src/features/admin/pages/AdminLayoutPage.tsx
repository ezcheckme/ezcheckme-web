import { Outlet } from "@tanstack/react-router";
import { AdminLayout } from "../components/AdminLayout";

export function AdminLayoutPage() {
  return (
    <AdminLayout>
      <title>Admin Dashboard — ezCheckMe</title>
      <Outlet />
    </AdminLayout>
  );
}
