import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { requireAdmin } from "@/server/auth/admin";

export const dynamic = "force-dynamic";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const admin = await requireAdmin();
  return (
    <div className="admin-shell">
      <AdminSidebar adminName={admin.name} />
      <main className="admin-main" id="main-content">
        {children}
      </main>
    </div>
  );
}
