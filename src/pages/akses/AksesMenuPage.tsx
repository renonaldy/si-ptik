import { useEffect, useMemo, useState } from "react";
import { ShieldCheck, Save, Eye, Pencil, Check, Users } from "lucide-react";

import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SearchBar } from "@/components/shared/SearchBar";
import { EmptyState } from "@/components/shared/EmptyState";
import { InitialsAvatar } from "@/components/shared/InitialsAvatar";
import { useMenuAccessList, useSaveMenuAccess } from "@/features/menuAccess/hooks/useMenuAccess";
import { useUsersList } from "@/features/users/hooks/useUsers";
import { roleLabel, isConfigurableRole } from "@/features/auth/permissions";
import { MENU, ALWAYS_ALLOWED, type MenuKey, type MenuItem } from "@/lib/menu";
import type { User } from "@/lib/api/usersApi";
import type { UserMenu } from "@/lib/api/menuAccessApi";
import { cn } from "@/lib/utils";

// Sections with only the toggleable (non-admin) items.
const CONFIG_SECTIONS = MENU.map((s) => ({
  heading: s.heading,
  items: s.items.filter((i) => !i.adminOnly),
})).filter((s) => s.items.length > 0);

const alwaysOn = (key: MenuKey) => ALWAYS_ALLOWED.includes(key);

type PermSet = { view: Set<string>; write: Set<string> };

function fromRow(row?: UserMenu): PermSet {
  const view = new Set<string>(row?.menu_keys ?? []);
  ALWAYS_ALLOWED.forEach((k) => view.add(k)); // dashboard is always on
  const write = new Set<string>(row?.write_keys ?? []);
  return { view, write };
}

export default function AksesMenuPage() {
  const { data: users = [], isLoading: usersLoading } = useUsersList("");
  const { data: access = [], isLoading: accessLoading } = useMenuAccessList();
  const saveMut = useSaveMenuAccess();

  const [search, setSearch] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  // perms[userId] = { view, write } — lazily initialized per account on first select.
  const [perms, setPerms] = useState<Record<string, PermSet>>({});

  const isLoading = usersLoading || accessLoading;

  // Only dosen/mahasiswa accounts are configurable (admins always see everything).
  const accounts = useMemo(
    () => users.filter((u) => isConfigurableRole(u.role)),
    [users],
  );

  const rowFor = (userId: string) => access.find((a) => a.user_id === userId);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return accounts;
    return accounts.filter(
      (u) => u.full_name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q),
    );
  }, [accounts, search]);

  // Default the selection to the first account once data has loaded.
  useEffect(() => {
    if (selectedId || accounts.length === 0) return;
    setSelectedId(accounts[0].id);
  }, [accounts, selectedId]);

  const select = (userId: string) => {
    setSelectedId(userId);
    setPerms((prev) => (prev[userId] ? prev : { ...prev, [userId]: fromRow(rowFor(userId)) }));
  };

  // Ensure the selected account's perms are initialized (covers the auto-select above).
  useEffect(() => {
    if (!selectedId) return;
    setPerms((prev) => (prev[selectedId] ? prev : { ...prev, [selectedId]: fromRow(rowFor(selectedId)) }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedId, access]);

  // Toggle "Lihat". Turning view off also drops any write grant.
  const toggleView = (item: MenuItem) => {
    if (!selectedId || alwaysOn(item.key)) return;
    setPerms((prev) => {
      const cur = prev[selectedId] ?? fromRow(rowFor(selectedId));
      const view = new Set(cur.view);
      const write = new Set(cur.write);
      if (view.has(item.key)) {
        view.delete(item.key);
        write.delete(item.key);
      } else {
        view.add(item.key);
      }
      return { ...prev, [selectedId]: { view, write } };
    });
  };

  // Toggle "Kelola" (CRUD). Turning write on implies view on.
  const toggleWrite = (item: MenuItem) => {
    if (!selectedId || !item.crud) return;
    setPerms((prev) => {
      const cur = prev[selectedId] ?? fromRow(rowFor(selectedId));
      const view = new Set(cur.view);
      const write = new Set(cur.write);
      if (write.has(item.key)) {
        write.delete(item.key);
      } else {
        write.add(item.key);
        view.add(item.key);
      }
      return { ...prev, [selectedId]: { view, write } };
    });
  };

  const save = () => {
    if (!selectedId) return;
    const cur = perms[selectedId] ?? fromRow(rowFor(selectedId));
    saveMut.mutate([
      {
        user_id: selectedId,
        menu_keys: Array.from(cur.view) as MenuKey[],
        write_keys: Array.from(cur.write) as MenuKey[],
      },
    ]);
  };

  // Live counts for a list row: from edited perms if loaded, else the stored row.
  const countsFor = (userId: string): { view: number; write: number } => {
    const p = perms[userId];
    if (p) return { view: p.view.size, write: p.write.size };
    const r = fromRow(rowFor(userId));
    return { view: r.view.size, write: r.write.size };
  };

  const selectedUser: User | undefined = accounts.find((u) => u.id === selectedId);
  const cur = selectedId ? perms[selectedId] : undefined;

  return (
    <AppLayout title="Hak Akses Menu">
      {/* Header */}
      <div className="card-hairline relative overflow-hidden rounded-2xl border border-border bg-card p-5 shadow-soft md:p-6">
        <div className="pointer-events-none absolute -right-12 -top-12 h-44 w-44 rounded-full bg-primary/10 blur-2xl" />
        <div className="relative flex items-center gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary ring-1 ring-inset ring-primary/20">
            <ShieldCheck className="h-6 w-6" />
          </div>
          <div>
            <h1 className="font-display text-2xl font-medium tracking-[-0.02em] text-foreground">Hak Akses Menu</h1>
            <p className="mt-0.5 text-sm text-muted-foreground">
              Atur menu per akun: pilih akun, lalu tentukan menu yang tampil (
              <span className="font-medium">Lihat</span>) dan hak kelola data (
              <span className="font-medium">Kelola</span>).
            </p>
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="flex h-40 items-center justify-center">
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        </div>
      ) : accounts.length === 0 ? (
        <EmptyState
          title="Belum ada akun dosen atau mahasiswa"
          description="Buat akun dosen/mahasiswa lebih dulu di Manajemen Pengguna untuk mengatur hak aksesnya."
        />
      ) : (
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-[minmax(0,320px)_1fr]">
          {/* Account picker */}
          <section className="card-hairline flex max-h-[70vh] flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-soft">
            <div className="flex items-center gap-2 border-b border-border bg-muted/30 p-3">
              <SearchBar value={search} onChange={setSearch} placeholder="Cari nama, email, atau NPM…" />
            </div>
            <div className="min-h-0 flex-1 overflow-y-auto scrollbar-thin p-2">
              {filtered.length === 0 ? (
                <p className="px-3 py-6 text-center text-sm text-muted-foreground">Tidak ada akun yang cocok.</p>
              ) : (
                filtered.map((u) => {
                  const c = countsFor(u.id);
                  const active = u.id === selectedId;
                  return (
                    <button
                      key={u.id}
                      type="button"
                      onClick={() => select(u.id)}
                      className={cn(
                        "flex w-full items-center gap-3 rounded-lg border px-3 py-2.5 text-left transition-colors",
                        active
                          ? "border-primary/40 bg-primary/5"
                          : "border-transparent hover:bg-muted/50",
                      )}
                    >
                      <InitialsAvatar name={u.full_name} />
                      <div className="min-w-0 flex-1">
                        <div className="truncate text-sm font-medium text-foreground">{u.full_name}</div>
                        <div className="truncate text-xs text-muted-foreground">{u.email}</div>
                      </div>
                      <div className="flex shrink-0 flex-col items-end gap-1">
                        <Badge variant="outline" className="px-1.5 py-0 text-[10px] font-normal">
                          {roleLabel(u.role)}
                        </Badge>
                        <span className="flex items-center gap-1 text-[10px] tabular-nums text-muted-foreground">
                          <Eye className="h-3 w-3" /> {c.view}
                          <Pencil className="ml-1 h-3 w-3" /> {c.write}
                        </span>
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </section>

          {/* Config for the selected account */}
          <section className="card-hairline flex flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-soft">
            {!selectedUser ? (
              <div className="flex flex-1 items-center justify-center p-10 text-center text-sm text-muted-foreground">
                <div>
                  <Users className="mx-auto mb-2 h-6 w-6 text-muted-foreground/60" />
                  Pilih akun di sebelah kiri untuk mengatur hak aksesnya.
                </div>
              </div>
            ) : (
              <>
                <div className="flex flex-col gap-3 border-b border-border bg-muted/30 p-5 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-center gap-3">
                    <InitialsAvatar name={selectedUser.full_name} />
                    <div>
                      <h2 className="font-display text-lg font-medium tracking-[-0.01em] text-foreground">
                        {selectedUser.full_name}
                      </h2>
                      <p className="text-xs text-muted-foreground">
                        {roleLabel(selectedUser.role)} · {selectedUser.email}
                      </p>
                    </div>
                  </div>
                  <Button onClick={save} disabled={saveMut.isPending}>
                    <Save className="mr-1.5 h-4 w-4" /> {saveMut.isPending ? "Menyimpan…" : "Simpan"}
                  </Button>
                </div>

                <div className="space-y-5 p-5">
                  {CONFIG_SECTIONS.map((section) => (
                    <div key={section.heading}>
                      <p className="pb-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                        {section.heading}
                      </p>
                      <div className="space-y-1">
                        {section.items.map((item) => {
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
                                onClick={() => toggleView(item)}
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
                                  onClick={() => toggleWrite(item)}
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
              </>
            )}
          </section>
        </div>
      )}

      <p className="text-xs text-muted-foreground">
        <span className="font-medium">Lihat</span> = menu muncul di sidebar (read-only).{" "}
        <span className="font-medium">Kelola</span> = boleh tambah, ubah, dan hapus data. Mengaktifkan
        Kelola otomatis mengaktifkan Lihat. Dashboard selalu tersedia; Super Admin &amp; Admin selalu penuh.
        Pengaturan berlaku per akun.
      </p>
    </AppLayout>
  );
}
