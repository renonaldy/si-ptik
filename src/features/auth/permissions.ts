// Role identifiers shared with the backend (user.Role* constants).
export const ROLES = {
  SUPER_ADMIN: "super_admin",
  ADMIN: "admin",
  DOSEN: "dosen",
  MAHASISWA: "mahasiswa",
} as const;

export type Role = (typeof ROLES)[keyof typeof ROLES];

// Roles that may create/update/delete data and reach admin pages. Others get
// read-only access. super_admin and admin are equivalent here — the ONLY
// difference is that admin cannot see the system version (see isSuperAdmin).
export function canManage(role?: string): boolean {
  return role === ROLES.SUPER_ADMIN || role === ROLES.ADMIN;
}

// super_admin exclusives (currently: the system version). Admin is deliberately
// excluded per requirement.
export function isSuperAdmin(role?: string): boolean {
  return role === ROLES.SUPER_ADMIN;
}

// Roles whose sidebar is configurable by an admin.
export function isConfigurableRole(role?: string): boolean {
  return role === ROLES.DOSEN || role === ROLES.MAHASISWA;
}

// Which target roles an actor may create/assign to an account.
// super_admin can assign any role; admin can only manage the two lower roles.
export function assignableRoles(actorRole?: string): Role[] {
  if (actorRole === ROLES.SUPER_ADMIN) {
    return [ROLES.ADMIN, ROLES.DOSEN, ROLES.MAHASISWA];
  }
  if (actorRole === ROLES.ADMIN) {
    return [ROLES.DOSEN, ROLES.MAHASISWA];
  }
  return [];
}

// Whether an actor may edit/delete an account that currently has targetRole.
export function canManageAccount(actorRole?: string, targetRole?: string): boolean {
  if (actorRole === ROLES.SUPER_ADMIN) return true;
  if (actorRole === ROLES.ADMIN) return targetRole === ROLES.DOSEN || targetRole === ROLES.MAHASISWA;
  return false;
}

export function roleLabel(role?: string): string {
  switch (role) {
    case ROLES.SUPER_ADMIN:
      return "Super Admin";
    case ROLES.ADMIN:
      return "Admin";
    case ROLES.DOSEN:
      return "Dosen";
    case ROLES.MAHASISWA:
      return "Mahasiswa";
    default:
      return role || "—";
  }
}
