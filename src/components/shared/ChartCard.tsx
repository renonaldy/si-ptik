import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface ChartCardProps {
  title: string;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
}

export function ChartCard({ title, action, children, className }: ChartCardProps) {
  return (
    <section className={cn("card-hairline overflow-hidden rounded-2xl border border-border bg-card p-5 shadow-soft", className)}>
      <div className="mb-4 flex items-center justify-between gap-3">
        <h2 className="font-display text-base font-medium tracking-[-0.01em] text-foreground">{title}</h2>
        {action}
      </div>
      {children}
    </section>
  );
}
