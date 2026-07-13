import { ArrowRight, type LucideIcon } from "lucide-react";

import { accentStyle, type ModuleKey } from "@/lib/moduleColors";

interface ModuleCardProps {
  accentKey: ModuleKey;
  icon: LucideIcon;
  label: string;
  count?: number;
  onClick: () => void;
}

// A domain tile: accent icon tile + left keyline + glow-on-hover. Color reinforces
// the label, never replaces it.
export function ModuleCard({ accentKey, icon: Icon, label, count, onClick }: ModuleCardProps) {
  return (
    <button
      onClick={onClick}
      style={accentStyle(accentKey)}
      className="card-hairline shadow-glow-hover group relative flex items-center gap-4 overflow-hidden rounded-xl border border-border bg-card p-4 text-left shadow-soft transition-all hover:-translate-y-0.5"
    >
      <span className="pointer-events-none absolute inset-y-3 left-0 w-[3px] rounded-full bg-[hsl(var(--ma))] opacity-0 transition-opacity group-hover:opacity-100" />
      <div
        className="pointer-events-none absolute -right-6 -top-6 h-20 w-20 rounded-full opacity-0 blur-2xl transition-opacity group-hover:opacity-100"
        style={{ background: "hsl(var(--ma) / 0.22)" }}
      />
      <div className="relative flex h-11 w-11 items-center justify-center rounded-lg bg-[hsl(var(--ma)/0.12)] text-[hsl(var(--ma))] ring-1 ring-inset ring-[hsl(var(--ma)/0.18)] transition-colors group-hover:bg-[hsl(var(--ma))] group-hover:text-white">
        <Icon className="h-5 w-5" />
      </div>
      <div className="relative min-w-0 flex-1">
        <div className="font-medium text-foreground">{label}</div>
        <div className="text-sm tabular-nums text-muted-foreground">
          {count === undefined ? "…" : `${count} data`}
        </div>
      </div>
      <ArrowRight className="relative h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-[hsl(var(--ma))]" />
    </button>
  );
}
