import { ReactNode } from "react";
import { type LucideIcon } from "lucide-react";

import { accentStyle, type ModuleKey } from "@/lib/moduleColors";

interface ListHeaderProps {
  accentKey: ModuleKey;
  icon: LucideIcon;
  title: string;
  description: string;
  count: number;
  countLabel: string;
  children?: ReactNode; // right-aligned action(s)
}

// Per-domain list-page header band: accent icon tile + glow + title + a live
// total, giving each page a strong colored identity. Chrome stays violet.
export function ListHeader({ accentKey, icon: Icon, title, description, count, countLabel, children }: ListHeaderProps) {
  return (
    <div
      style={accentStyle(accentKey)}
      className="card-hairline relative overflow-hidden rounded-2xl border border-border bg-card p-5 shadow-soft md:p-6"
    >
      <div
        className="pointer-events-none absolute -right-12 -top-12 h-44 w-44 rounded-full blur-2xl"
        style={{ background: "hsl(var(--ma) / 0.14)" }}
      />
      <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[hsl(var(--ma)/0.12)] text-[hsl(var(--ma))] ring-1 ring-inset ring-[hsl(var(--ma)/0.2)]">
            <Icon className="h-6 w-6" />
          </div>
          <div>
            <h1 className="font-display text-2xl font-medium tracking-[-0.02em] text-foreground">{title}</h1>
            <p className="mt-0.5 text-sm text-muted-foreground">{description}</p>
          </div>
        </div>
        <div className="flex items-center gap-5">
          <div className="hidden text-right sm:block">
            <div className="font-display text-2xl font-medium tabular-nums text-foreground">{count}</div>
            <div className="text-[11px] uppercase tracking-wider text-muted-foreground">{countLabel}</div>
          </div>
          {children}
        </div>
      </div>
    </div>
  );
}
