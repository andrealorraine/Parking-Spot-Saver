import { cn } from './utils'

type Variant = 'primary' | 'dark' | 'outline' | 'signal' | 'danger'

const VARIANTS: Record<Variant, string> = {
  primary: 'bg-primary text-primary-foreground border-primary-foreground/90 hover:brightness-95',
  dark: 'bg-secondary text-secondary-foreground border-secondary hover:opacity-90',
  outline: 'bg-card text-foreground border-foreground/80 hover:bg-muted',
  signal: 'bg-signal text-signal-foreground border-signal hover:opacity-90',
  danger: 'bg-card text-destructive border-destructive hover:bg-destructive/10',
}

export function bigButton(variant: Variant = 'primary', className?: string) {
  return cn(
    'inline-flex min-h-14 w-full items-center justify-center gap-2 rounded-lg border-2 px-4 py-3',
    'font-display text-xl font-bold uppercase tracking-wide transition',
    'focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-ring/60',
    'disabled:cursor-not-allowed disabled:opacity-60 active:translate-y-px',
    VARIANTS[variant],
    className,
  )
}
