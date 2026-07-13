import { Menu } from "lucide-react";

import { UserMenu } from "./UserMenu";

interface TopBarProps {
  title: string;
  onMenuClick?: () => void;
}

export function TopBar({ title, onMenuClick }: TopBarProps) {
  return (
    <header className="sticky top-0 z-10 flex h-16 items-center justify-between gap-3 border-b border-border bg-background/80 px-4 backdrop-blur md:px-8">
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuClick}
          className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-muted md:hidden"
          title="Buka menu"
        >
          <Menu className="h-5 w-5" />
        </button>
        <h2 className="text-base font-semibold text-foreground">{title}</h2>
      </div>

      <UserMenu />
    </header>
  );
}
