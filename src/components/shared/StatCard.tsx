import { type CSSProperties } from "react";
import { type LucideIcon } from "lucide-react";

import { accentStyle, type ModuleKey } from "@/lib/moduleColors";
import { Sparkline } from "./Sparkline";

interface StatCardProps {
  label: string;
  value: string | number;
  icon: LucideIcon;
  hint?: string;
  loading?: boolean;
  accentKey?: ModuleKey;
  series?: number[];
  delta?: string;
}

export function StatCard({ label, value, icon: Icon, hint, loading, accentKey, series, delta }: StatCardProps) {
  // Accent falls back to the violet brand token when no domain key is given.
  const style: CSSProperties = accentKey
    ? accentStyle(accentKey)
    : ({ ["--ma" as string]: "var(--primary)" } as CSSProperties);

  return (
    <div
      style={style}
      className="card-hairline shadow-glow-hover group relative overflow-hidden rounded-xl border border-border bg-card p-5 shadow-soft transition-all hover:-translate-y-0.5"
    >
      <span className="pointer-events-none absolute inset-x-0 top-0 h-[3px]" style={{ background: "hsl(var(--ma))" }} />
      <div
        className="pointer-events-none absolute -right-8 -top-8 h-24 w-24 rounded-full opacity-50 blur-2xl transition-opacity group-hover:opacity-90"
        style={{ background: "hsl(var(--ma) / 0.16)" }}
      />
      <div className="relative flex items-center justify-between">
        <span className="text-[13px] font-medium text-muted-foreground">{label}</span>
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[hsl(var(--ma)/0.12)] text-[hsl(var(--ma))] ring-1 ring-inset ring-[hsl(var(--ma)/0.18)]">
          <Icon className="h-[18px] w-[18px]" />
        </div>
      </div>
      {loading ? (
        <div className="mt-4 h-9 w-20 animate-pulse rounded-md bg-muted" />
      ) : (
        <div className="relative mt-3 flex items-end justify-between gap-3">
          <div className="font-display text-[2.1rem] font-medium leading-none tracking-[-0.01em] tabular-nums text-foreground">
            {value}
          </div>
          {series && series.length > 1 && <Sparkline data={series} className="h-8 w-20" />}
        </div>
      )}
      {(hint || delta) && (
        <p className="relative mt-2 text-xs text-muted-foreground">
          {delta && <span className="font-medium text-emerald-600">{delta} </span>}
          {hint}
        </p>
      )}
    </div>
  );
}
