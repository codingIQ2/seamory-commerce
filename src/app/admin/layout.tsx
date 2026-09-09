import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { requireAdmin } from "@/server/auth/admin";

export const dynamic = "force-dynamic";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const admin = await requireAdmin();
  return (
    <div className="admin-shell">
      <a className="skip-link" href="#main-content">
        관리자 본문으로 바로가기
      </a>
      <AdminSidebar adminName={admin.name} />
      <main className="admin-main" id="main-content" tabIndex={-1}>
        {children}
      </main>
    </div>
  );
}
