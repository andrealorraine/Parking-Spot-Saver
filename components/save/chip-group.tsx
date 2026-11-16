'use client'

import { cn } from '@/lib/utils'

type Option<T> = { label: string; value: T }

export function ChipGroup<T extends string | number>({
  label,
  options,
  value,
  onChange,
  required,
  columns = 4,
  error,
}: {
  label: string
  options: Option<T>[]
  value: T | null
  onChange: (value: T) => void
  required?: boolean
  columns?: 3 | 4 | 5 | 6
  error?: string
}) {
  const id = `chips-${label.toLowerCase().replace(/\W+/g, '-')}`
  return (
    <fieldset aria-describedby={error ? `${id}-error` : undefined}>
      <legend className="mb-2 font-display text-lg font-bold uppercase tracking-wide">
        {label}
        {required && <span className="ml-1 text-sm font-medium normal-case text-muted-foreground">(required)</span>}
      </legend>
      <div
        role="radiogroup"
        aria-label={label}
        aria-required={required}
        className={cn(
          'grid gap-2',
          { 3: 'grid-cols-3', 4: 'grid-cols-4', 5: 'grid-cols-5', 6: 'grid-cols-6' }[columns],
        )}
      >
        {options.map((opt) => {
          const selected = opt.value === value
          return (
            <button
              key={String(opt.value)}
              type="button"
              role="radio"
              aria-checked={selected}
              onClick={() => onChange(opt.value)}
              className={cn(
                'min-h-14 rounded-lg border-2 px-2 font-display text-xl font-bold uppercase transition',
                'focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-ring/60',
                selected
                  ? 'border-primary-foreground bg-primary text-primary-foreground shadow-[inset_0_-3px_0_rgba(0,0,0,0.25)]'
                  : 'border-border bg-card text-foreground hover:border-foreground/60',
              )}
            >
              {opt.label}
            </button>
          )
        })}
      </div>
      {error && (
        <p id={`${id}-error`} className="mt-2 text-sm font-medium text-destructive">
          {error}
        </p>
      )}
    </fieldset>
  )
}
