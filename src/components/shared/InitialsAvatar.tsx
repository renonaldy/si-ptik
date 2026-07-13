import { cn, initialsOf } from "@/lib/utils";

interface InitialsAvatarProps {
  name: string;
  className?: string;
}

// A small tinted circle showing a person's initials — used in tables/topbar.
export function InitialsAvatar({ name, className }: InitialsAvatarProps) {
  return (
    <div
      className={cn(
        // Tints to the nearest --ma accent (falls back to violet outside an accent wrapper).
        "flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[hsl(var(--ma,var(--primary))/0.12)] text-[hsl(var(--ma,var(--primary)))] text-xs font-semibold ring-1 ring-inset ring-[hsl(var(--ma,var(--primary))/0.18)]",
        className,
      )}
    >
      {initialsOf(name) || "?"}
    </div>
  );
}
