import { ReactNode } from "react";

interface PageHeaderProps {
  title: string;
  description?: string;
  /** Show a per-domain colored rule under the title (reads --ma from an ancestor). */
  accent?: boolean;
  children?: ReactNode; // right-aligned actions
}

export function PageHeader({ title, description, accent, children }: PageHeaderProps) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 className="font-display text-2xl font-medium tracking-[-0.02em] text-foreground">{title}</h1>
        {accent && <div className="mt-2 h-0.5 w-10 rounded-full bg-gradient-to-r from-[hsl(var(--ma))] to-[hsl(var(--ma)/0.4)]" />}
        {description && <p className="mt-1 text-sm text-muted-foreground">{description}</p>}
      </div>
      {children && <div className="flex items-center gap-2">{children}</div>}
    </div>
  );
}
