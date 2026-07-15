import { ReactNode } from "react";
import { Navigate } from "react-router-dom";

import { useMe } from "@/features/auth/useMe";
import { useMenuAccessList } from "@/features/menuAccess/hooks/useMenuAccess";
import { canManage } from "@/features/auth/permissions";
import { ALWAYS_ALLOWED, type MenuKey } from "@/lib/menu";

interface RouteAccessProps {
  children: ReactNode;
  /** The menu key this route belongs to (used to gate dosen/mahasiswa). */
  menu?: MenuKey;
  /** Restrict to super_admin/admin regardless of menu config. */
  adminOnly?: boolean;
}

function Spinner() {
  return (
    <div className="flex h-screen items-center justify-center bg-background">
      <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
    </div>
  );
}

// Per-route authorization. Runs inside the authenticated Outlet, so `me` is
// already loaded; admins bypass all checks, lower roles are gated by the menu
// access config (dashboard is always reachable).
export function RouteAccess({ children, menu, adminOnly }: RouteAccessProps) {
  const { data: me, isLoading } = useMe();
  const menuAccess = useMenuAccessList();

  if (isLoading) return <Spinner />;
  const role = me?.role;

  if (canManage(role)) return <>{children}</>;
  if (adminOnly) return <Navigate to="/dashboard" replace />;

  // dosen / mahasiswa
  if (!menu || ALWAYS_ALLOWED.includes(menu)) return <>{children}</>;
  if (menuAccess.isLoading) return <Spinner />;

  const allowed = menuAccess.data?.find((a) => a.role === role)?.menu_keys ?? [];
  return allowed.includes(menu) ? <>{children}</> : <Navigate to="/dashboard" replace />;
}
