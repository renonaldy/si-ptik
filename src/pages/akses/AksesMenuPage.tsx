import { useEffect, useMemo, useState } from "react";
import { ShieldCheck, Save, Eye, Pencil, Check } from "lucide-react";

import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { useMenuAccessList, useSaveMenuAccess } from "@/features/menuAccess/hooks/useMenuAccess";
import { roleLabel } from "@/features/auth/permissions";
import { MENU, ALWAYS_ALLOWED, type MenuKey, type MenuItem } from "@/lib/menu";
import { cn } from "@/lib/utils";

// Roles whose sidebar is configurable here (mirrors backend ConfigurableRoles).
const CONFIG_ROLES = ["dosen", "mahasiswa"] as const;

// Sections with only the toggleable (non-admin) items.
const CONFIG_SECTIONS = MENU.map((s) => ({
  heading: s.heading,
  items: s.items.filter((i) => !i.adminOnly),
})).filter((s) => s.items.length > 0);

const alwaysOn = (key: MenuKey) => ALWAYS_ALLOWED.includes(key);

type PermSet = { view: Set<string>; write: Set<string> };

export default function AksesMenuPage() {
  const { data = [], isLoading } = useMenuAccessList();
  const saveMut = useSaveMenuAccess();

  // perms[role] = { view, write } sets of enabled menu keys.
  const [perms, setPerms] = useState<Record<string, PermSet>>({});

  useEffect(() => {
    const next: Record<string, PermSet> = {};
    for (const role of CONFIG_ROLES) {
      const row = data.find((d) => d.role === role);
      const view = new Set<string>(row?.menu_keys ?? []);
      ALWAYS_ALLOWED.forEach((k) => view.add(k)); // dashboard is always on
      const write = new Set<string>(row?.write_keys ?? []);
      next[role] = { view, write };
    }
    setPerms(next);
  }, [data]);

  // Toggle "Lihat". Turning view off also drops any write grant.
  const toggleView = (role: string, item: MenuItem) => {
    if (alwaysOn(item.key)) return;
    setPerms((prev) => {
      const cur = prev[role];
      const view = new Set(cur.view);
      const write = new Set(cur.write);
      if (view.has(item.key)) {
        view.delete(item.key);
        write.delete(item.key);
      } else {
        view.add(item.key);
      }
      return { ...prev, [role]: { view, write } };
    });
  };

  // Toggle "Kelola" (CRUD). Turning write on implies view on.
  const toggleWrite = (role: string, item: MenuItem) => {
    if (!item.crud) return;
    setPerms((prev) => {
      const cur = prev[role];
      const view = new Set(cur.view);
      const write = new Set(cur.write);
      if (write.has(item.key)) {
        write.delete(item.key);
      } else {
        write.add(item.key);
        view.add(item.key);
      }
      return { ...prev, [role]: { view, write } };
    });
  };

  const save = () => {
    saveMut.mutate(
      CONFIG_ROLES.map((role) => ({
        role,
        menu_keys: Array.from(perms[role]?.view ?? []) as MenuKey[],
        write_keys: Array.from(perms[role]?.write ?? []) as MenuKey[],
      })),
    );
  };

  const counts = useMemo(
    () =>
      CONFIG_ROLES.map((role) => ({
        role,
        view: perms[role]?.view.size ?? 0,
        write: perms[role]?.write.size ?? 0,
      })),
    [perms],
  );

  return (
    <AppLayout title="Hak Akses Menu">
      {/* Header */}
      <div className="card-hairline relative overflow-hidden rounded-2xl border border-border bg-card p-5 shadow-soft md:p-6">
        <div className="pointer-events-none absolute -right-12 -top-12 h-44 w-44 rounded-full bg-primary/10 blur-2xl" />
        <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary ring-1 ring-inset ring-primary/20">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <div>
              <h1 className="font-display text-2xl font-medium tracking-[-0.02em] text-foreground">Hak Akses Menu</h1>
              <p className="mt-0.5 text-sm text-muted-foreground">
                Atur menu yang tampil (<span className="font-medium">Lihat</span>) dan hak kelola data
                (<span className="font-medium">Kelola</span>) untuk dosen &amp; mahasiswa.
              </p>
            </div>
          </div>
          <Button onClick={save} disabled={saveMut.isPending || isLoading}>
            <Save className="mr-1.5 h-4 w-4" /> {saveMut.isPending ? "Menyimpan…" : "Simpan Perubahan"}
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex h-40 items-center justify-center">
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
          {CONFIG_ROLES.map((role) => {
            const count = counts.find((c) => c.role === role);
            return (
              <section key={role} className="card-hairline overflow-hidden rounded-2xl border border-border bg-card shadow-soft">
                <div className="flex items-center justify-between border-b border-border bg-muted/30 p-5">
                  <h2 className="font-display text-lg font-medium tracking-[-0.01em] text-foreground">{roleLabel(role)}</h2>
                  <div className="flex items-center gap-2 text-xs">
                    <span className="inline-flex items-center gap-1 rounded-full border border-border bg-muted/40 px-2.5 py-0.5 font-medium tabular-nums text-muted-foreground">
                      <Eye className="h-3.5 w-3.5" /> {count?.view ?? 0}
                    </span>
                    <span className="inline-flex items-center gap-1 rounded-full border border-primary/30 bg-primary/5 px-2.5 py-0.5 font-medium tabular-nums text-primary">
                      <Pencil className="h-3.5 w-3.5" /> {count?.write ?? 0}
                    </span>
                  </div>
                </div>

                <div className="space-y-5 p-5">
                  {CONFIG_SECTIONS.map((section) => (
                    <div key={section.heading}>
                      <p className="pb-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                        {section.heading}
                      </p>
                      <div className="space-y-1">
                        {section.items.map((item) => {
                          const cur = perms[role];
                          const isView = cur?.view.has(item.key) ?? false;
                          const isWrite = cur?.write.has(item.key) ?? false;
                          const locked = alwaysOn(item.key);
                          return (
                            <div
                              key={item.key}
                              className="flex items-center gap-3 rounded-lg border border-transparent px-3 py-2 text-sm hover:bg-muted/40"
                            >
                              <item.icon className={cn("h-[18px] w-[18px] shrink-0", isView ? "text-primary" : "text-muted-foreground")} />
                              <span className={cn("flex-1 font-medium", isView ? "text-foreground" : "text-muted-foreground")}>
                                {item.label}
                              </span>

                              {/* Lihat */}
                              <button
                                type="button"
                                onClick={() => toggleView(role, item)}
                                disabled={locked}
                                title={locked ? "Selalu tampil" : "Tampilkan menu ini"}
                                className={cn(
                                  "inline-flex items-center gap-1.5 rounded-md border px-2 py-1 text-xs font-medium transition-colors",
                                  isView ? "border-primary/40 bg-primary/10 text-primary" : "border-input text-muted-foreground hover:bg-muted",
                                  locked && "cursor-not-allowed opacity-70",
                                )}
                              >
                                <Eye className="h-3.5 w-3.5" /> Lihat
                                {isView && <Check className="h-3 w-3" />}
                              </button>

                              {/* Kelola (CRUD) — only for menus with a CRUD backend */}
                              {item.crud ? (
                                <button
                                  type="button"
                                  onClick={() => toggleWrite(role, item)}
                                  title="Izinkan tambah/ubah/hapus data"
                                  className={cn(
                                    "inline-flex items-center gap-1.5 rounded-md border px-2 py-1 text-xs font-medium transition-colors",
                                    isWrite ? "border-primary/40 bg-primary/10 text-primary" : "border-input text-muted-foreground hover:bg-muted",
                                  )}
                                >
                                  <Pencil className="h-3.5 w-3.5" /> Kelola
                                  {isWrite && <Check className="h-3 w-3" />}
                                </button>
                              ) : (
                                <span className="w-[76px]" aria-hidden />
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            );
          })}
        </div>
      )}

      <p className="text-xs text-muted-foreground">
        <span className="font-medium">Lihat</span> = menu muncul di sidebar (read-only).{" "}
        <span className="font-medium">Kelola</span> = boleh tambah, ubah, dan hapus data. Mengaktifkan
        Kelola otomatis mengaktifkan Lihat. Dashboard selalu tersedia; Super Admin &amp; Admin selalu penuh.
      </p>
    </AppLayout>
  );
}
