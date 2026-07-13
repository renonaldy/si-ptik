interface PublicPageHeaderProps {
  eyebrow?: string;
  title: string;
  subtitle?: string;
}

// Reusable gradient hero band for interior public pages — gives every page a
// premium, cohesive top instead of a plain white heading.
export function PublicPageHeader({ eyebrow, title, subtitle }: PublicPageHeaderProps) {
  return (
    <section className="relative overflow-hidden bg-hero-aurora text-white">
      <div className="pointer-events-none absolute inset-0 bg-grid opacity-30 [mask-image:radial-gradient(ellipse_at_top,black,transparent_75%)]" />
      <div className="pointer-events-none absolute -right-16 -top-20 h-56 w-56 rounded-full bg-white/10 blur-3xl animate-aurora" />
      <div className="pointer-events-none absolute -bottom-24 -left-16 h-56 w-56 rounded-full bg-violet-500/20 blur-3xl" />
      <div className="relative mx-auto max-w-6xl px-4 py-14 text-center md:px-6 md:py-16">
        {eyebrow && (
          <span className="inline-block rounded-full border border-white/25 bg-white/10 px-3 py-1 text-xs font-medium backdrop-blur-sm">
            {eyebrow}
          </span>
        )}
        <h1 className="mt-4 font-display text-3xl font-medium tracking-[-0.02em] md:text-4xl">{title}</h1>
        {subtitle && <p className="mx-auto mt-3 max-w-xl text-white/80">{subtitle}</p>}
      </div>
    </section>
  );
}
