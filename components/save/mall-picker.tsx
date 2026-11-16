'use client'

import { Check, CornerDownLeft, History, Store } from 'lucide-react'
import { useId, useMemo, useState } from 'react'
import { useHistory } from '@/lib/storage'
import { cn } from '@/lib/utils'

export type MallValue = { name: string; placeId: string | null; lat: number | null; lng: number | null }

const MAX_SUGGESTIONS = 5

function toMall(name: string): MallValue {
  return { name: name.trim(), placeId: null, lat: null, lng: null }
}

export function MallPicker({ value, onChange }: { value: MallValue; onChange: (v: MallValue) => void }) {
  const inputId = useId()
  const history = useHistory()
  const [query, setQuery] = useState('')
  const [editing, setEditing] = useState(!value.name)

  const pastMalls = useMemo(() => {
    const seen = new Set<string>()
    const names: string[] = []
    for (const item of history) {
      const name = item.mallName?.trim()
      if (!name) continue
      const key = name.toLowerCase()
      if (seen.has(key)) continue
      seen.add(key)
      names.push(name)
    }
    return names
  }, [history])

  const q = query.trim().toLowerCase()
  const suggestions = pastMalls
    .filter((name) => (q ? name.toLowerCase().includes(q) && name.toLowerCase() !== q : true))
    .slice(0, MAX_SUGGESTIONS)

  const confirm = (name: string) => {
    const trimmed = name.trim()
    if (!trimmed) return
    onChange(toMall(trimmed))
    setQuery('')
    setEditing(false)
  }

  return (
    <section aria-labelledby={`${inputId}-heading`} className="flex flex-col gap-3">
      <h2 id={`${inputId}-heading`} className="font-display text-lg font-bold uppercase tracking-wide">
        Mall
      </h2>

      {!editing && value.name ? (
        <div className="flex items-center gap-3 rounded-lg border-2 border-primary-foreground/80 bg-primary p-3 text-primary-foreground">
          <Check className="size-6 shrink-0" aria-hidden="true" />
          <div className="min-w-0 flex-1">
            <p className="text-xs font-semibold uppercase tracking-wide opacity-80">Parked at</p>
            <p className="truncate font-display text-xl font-bold uppercase leading-tight">{value.name}</p>
          </div>
          <button
            type="button"
            onClick={() => {
              setQuery(value.name)
              setEditing(true)
            }}
            className="h-10 rounded-md px-3 text-sm font-semibold underline underline-offset-4"
          >
            Change
          </button>
        </div>
      ) : (
        <>
          <div>
            <label htmlFor={inputId} className="mb-1.5 block text-sm font-medium">
              Type the mall name, then press Enter
            </label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Store
                  className="pointer-events-none absolute left-3 top-1/2 size-5 -translate-y-1/2 text-muted-foreground"
                  aria-hidden="true"
                />
                <input
                  id={inputId}
                  type="text"
                  autoComplete="off"
                  autoCapitalize="words"
                  enterKeyHint="done"
                  placeholder="e.g. SM City Baliwag"
                  value={query}
                  onChange={(e) => {
                    setQuery(e.target.value)
                    onChange(toMall(e.target.value))
                  }}
                  onKeyDown={(e) => {
                    if (e.key !== 'Enter') return
                    e.preventDefault()
                    if (e.nativeEvent.isComposing || e.keyCode === 229) return
                    confirm(query)
                  }}
                  className="h-14 w-full rounded-lg border-2 border-input bg-card pl-10 pr-3 text-base outline-none focus:border-ring"
                />
              </div>
              <button
                type="button"
                onClick={() => confirm(query)}
                disabled={!query.trim()}
                aria-label="Use this mall name"
                className="flex h-14 w-14 shrink-0 items-center justify-center rounded-lg border-2 border-foreground/80 bg-primary text-primary-foreground transition disabled:opacity-40"
              >
                <CornerDownLeft className="size-6" aria-hidden="true" />
              </button>
            </div>
          </div>

          {suggestions.length > 0 && (
            <div className="flex flex-col gap-2">
              <p className="flex items-center gap-1.5 text-sm font-medium text-muted-foreground">
                <History className="size-4" aria-hidden="true" />
                {q ? 'Matching malls you used before' : 'Malls you used before'}
              </p>
              <ul className="flex flex-wrap gap-2">
                {suggestions.map((name) => (
                  <li key={name}>
                    <button
                      type="button"
                      onClick={() => confirm(name)}
                      className={cn(
                        'min-h-12 rounded-lg border-2 border-border bg-card px-4 text-left font-medium transition hover:bg-muted',
                      )}
                    >
                      {name}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </>
      )}
    </section>
  )
}
