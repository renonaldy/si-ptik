// Roles that may create/update/delete data. Others get read-only access.
export function canManage(role?: string): boolean {
  return role === "super_admin" || role === "admin";
}

export function roleLabel(role?: string): string {
  switch (role) {
    case "super_admin":
      return "Super Admin";
    case "admin":
      return "Admin";
    case "dosen":
      return "Dosen";
    case "mahasiswa":
      return "Mahasiswa";
    default:
      return role || "—";
  }
}
