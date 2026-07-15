import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { GraduationCap, ShieldCheck, Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Sparkline } from "@/components/shared/Sparkline";
import { BrandLogo } from "@/components/shared/BrandLogo";
import { useLogin, getStoredToken } from "@/features/auth/useAuth";
import { accentStyle, type ModuleKey } from "@/lib/moduleColors";

const FEATURES: { icon: typeof GraduationCap; text: string; accent: string }[] = [
  { icon: GraduationCap, text: "Kelola data dosen, alumni, skripsi, dan wisudawan", accent: "--m-dosen" },
  { icon: ShieldCheck, text: "Akses aman dengan autentikasi berbasis token", accent: "--m-skripsi" },
  { icon: Sparkles, text: "Antarmuka modern, cepat, dan mudah digunakan", accent: "--m-alumni" },
];

const STATS: { n: string; l: string; k: ModuleKey }[] = [
  { n: "10", l: "Modul", k: "dosen" },
  { n: "1.2k", l: "Data", k: "alumni" },
  { n: "24/7", l: "Akses", k: "wisudawan" },
];

export default function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const login = useLogin();

  if (getStoredToken()) {
    navigate("/dashboard", { replace: true });
    return null;
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    login.mutate(
      { email, password },
      {
        onSuccess: () => navigate("/dashboard", { replace: true }),
        onError: (err: Error) => toast.error(err.message || "Gagal masuk"),
      },
    );
  };

  return (
    <div className="grid min-h-screen lg:grid-cols-[1.05fr_1fr]">
      {/* Brand panel */}
      <div className="relative hidden overflow-hidden bg-mesh p-12 text-white lg:flex lg:flex-col lg:justify-between xl:p-14">
        <div className="pointer-events-none absolute inset-0 bg-grid [mask-image:radial-gradient(ellipse_at_center,transparent_25%,black)]" />
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(120%_120%_at_50%_0%,transparent_45%,rgb(0_0_0/0.55))]" />
        <div className="pointer-events-none absolute -right-20 top-1/3 h-72 w-72 rounded-full bg-white/10 blur-3xl animate-aurora" />

        {/* Brand lockup */}
        <div className="relative flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10 p-1.5 ring-1 ring-white/20 backdrop-blur">
            <BrandLogo className="h-full w-full" />
          </div>
          <div className="leading-tight">
            <div className="text-base font-bold">SI PTIK</div>
            <div className="text-xs text-white/60">Sistem Informasi Program Studi</div>
          </div>
        </div>

        {/* Editorial statement */}
        <div className="relative max-w-md space-y-6">
          <span className="text-[11px] font-medium uppercase tracking-[0.2em] text-white/60">Satu sumber data</span>
          <h2 className="font-display text-[2.6rem] font-medium leading-[1.08] tracking-[-0.02em]">
            Satu sistem untuk seluruh data program studi.
          </h2>
          <div className="h-px w-16 bg-white/20" />
          <ul className="space-y-4">
            {FEATURES.map((f) => (
              <li key={f.text} className="flex items-start gap-3 text-sm text-white/80">
                <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/10 ring-1 ring-white/15">
                  <f.icon className="h-4 w-4" style={{ color: `hsl(var(${f.accent}))` }} />
                </span>
                {f.text}
              </li>
            ))}
          </ul>
        </div>

        {/* Glass mini-stat strip */}
        <div className="relative space-y-6">
          <div className="grid grid-cols-3 gap-3">
            {STATS.map((s) => (
              <div key={s.l} style={accentStyle(s.k)} className="rounded-xl bg-white/5 p-4 ring-1 ring-white/10 backdrop-blur">
                <div className="font-display text-2xl font-medium tabular-nums">{s.n}</div>
                <div className="text-[11px] uppercase tracking-wider text-white/50">{s.l}</div>
                <Sparkline data={[3, 5, 4, 7, 6, 9]} className="mt-2 h-6 w-full" />
              </div>
            ))}
          </div>
          <div className="text-xs text-white/40">© {`${new Date().getFullYear()}`} Program Studi PTIK</div>
        </div>
      </div>

      {/* Form panel */}
      <div className="relative flex items-center justify-center bg-app-aurora px-6 py-12">
        <div className="w-full max-w-[400px]">
          <div className="mb-6 flex justify-center lg:hidden">
            <BrandLogo className="h-14 w-14" />
          </div>

          <div className="card-hairline rounded-2xl border border-border bg-card/70 p-8 shadow-soft-lg backdrop-blur-sm">
            <span className="text-[11px] font-medium uppercase tracking-[0.18em] text-primary">Masuk</span>
            <h1 className="mt-2 font-display text-3xl font-medium tracking-[-0.02em] text-foreground">Selamat datang</h1>
            <p className="mt-1.5 text-sm text-muted-foreground">Masuk untuk melanjutkan ke SI PTIK.</p>
            <div className="my-6 h-px bg-border" />

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-1.5">
                <Label htmlFor="email">Email atau NPM</Label>
                <Input id="email" type="text" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="admin@ptik.id atau NPM" required autoFocus />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="password">Password</Label>
                <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" required />
              </div>
              <Button
                type="submit"
                disabled={login.isPending}
                className="h-11 w-full text-[15px] font-semibold bg-gradient-to-r from-[hsl(var(--aurora-1))] to-[hsl(263_74%_50%)] shadow-[0_6px_20px_-6px_hsl(var(--glow)/0.6)] transition-all hover:brightness-110"
              >
                {login.isPending ? "Memproses…" : "Masuk"}
              </Button>
            </form>

            {/* <p className="mt-6 rounded-lg border border-dashed border-border bg-muted/30 p-3 text-center text-xs text-muted-foreground">
              Demo: <span className="font-medium text-foreground">admin@ptik.id</span> / <span className="font-medium text-foreground">admin12345</span>
            </p> */}
          </div>
        </div>
      </div>
    </div>
  );
}
