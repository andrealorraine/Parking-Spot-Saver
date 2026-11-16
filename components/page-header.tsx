export function PageHeader({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <header className="mb-5 flex items-center gap-3">
      <span
        aria-hidden="true"
        className="grid size-11 shrink-0 place-items-center rounded-md bg-signal font-display text-3xl font-extrabold leading-none text-signal-foreground"
      >
        P
      </span>
      <div className="min-w-0">
        <h1 className="font-display text-3xl font-extrabold uppercase leading-none tracking-wide text-balance">
          {title}
        </h1>
        {subtitle && <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>}
      </div>
    </header>
  )
}
