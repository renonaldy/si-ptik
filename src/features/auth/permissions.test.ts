import { describe, it, expect } from "vitest";
import { canManage, roleLabel } from "./permissions";

describe("canManage", () => {
  it("allows admin roles to manage data", () => {
    expect(canManage("super_admin")).toBe(true);
    expect(canManage("admin")).toBe(true);
  });
  it("denies non-admin roles", () => {
    expect(canManage("dosen")).toBe(false);
    expect(canManage("mahasiswa")).toBe(false);
    expect(canManage(undefined)).toBe(false);
  });
});

describe("roleLabel", () => {
  it("maps known roles to human labels", () => {
    expect(roleLabel("super_admin")).toBe("Super Admin");
    expect(roleLabel("mahasiswa")).toBe("Mahasiswa");
  });
});
