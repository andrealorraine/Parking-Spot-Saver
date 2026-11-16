'use client'

import { Check, LoaderCircle, LocateFixed, MapPin, Search, TriangleAlert } from 'lucide-react'
import { useEffect, useId, useState } from 'react'
import useSWR from 'swr'
import { formatDistance } from '@/lib/format'
import { geoErrorMessage, getCurrentPosition } from '@/lib/geo'
import type { Mall } from '@/lib/types'
import { bigButton } from '@/lib/ui'
import { cn } from '@/lib/utils'

export type MallValue = { name: string; placeId: string | null; lat: number | null; lng: number | null }

type ApiError = Error & { code?: string }

async function fetchMalls(url: string): Promise<Mall[]> {
  const res = await fetch(url)
  const data = await res.json().catch(() => ({}))
  if (!res.ok) {
    const err = new Error(data?.message ?? 'Request failed') as ApiError
    err.code = data?.error
    throw err
  }
  return data.malls ?? []
}

const PRESELECT_WITHIN_METERS = 800

function useDebounced<T>(value: T, delay: number) {
  const [debounced, setDebounced] = useState(value)
  useEffect(() => {
    const id = window.setTimeout(() => setDebounced(value), delay)
    return () => window.clearTimeout(id)
  }, [value, delay])
  return debounced
}

export function MallPicker({ value, onChange }: { value: MallValue; onChange: (v: MallValue) => void }) {
  const inputId = useId()
  const [query, setQuery] = useState('')
  const [origin, setOrigin] = useState<{ lat: number; lng: number } | null>(null)
  const [nearby, setNearby] = useState<Mall[] | null>(null)
  const [nearbyLoading, setNearbyLoading] = useState(false)
  const [nearbyError, setNearbyError] = useState<string | null>(null)

  const debouncedQuery = useDebounced(query.trim(), 300)
  const searchKey =
    debouncedQuery.length >= 2
      ? `/api/malls/search?q=${encodeURIComponent(debouncedQuery)}${origin ? `&lat=${origin.lat}&lng=${origin.lng}` : ''}`
      : null
  const search = useSWR<Mall[], ApiError>(searchKey, fetchMalls, {
    revalidateOnFocus: false,
    shouldRetryOnError: false,
    keepPreviousData: true,
  })

  const selectMall = (mall: Mall) => {
    onChange({ name: mall.name, placeId: mall.id, lat: mall.lat, lng: mall.lng })
    setQuery('')
  }

  const findNearby = async () => {
    setNearbyLoading(true)
    setNearbyError(null)
    try {
      const pos = await getCurrentPosition({ enableHighAccuracy: true, timeout: 10000, maximumAge: 30000 })
      const here = { lat: pos.coords.latitude, lng: pos.coords.longitude }
      setOrigin(here)
      const malls = await fetchMalls(`/api/malls/nearby?lat=${here.lat}&lng=${here.lng}`)
      setNearby(malls)
      const nearest = malls[0]
      if (nearest && (nearest.distanceMeters ?? Infinity) <= PRESELECT_WITHIN_METERS) selectMall(nearest)
      if (malls.length === 0) setNearbyError('No malls found within 3 km. Search by name or type it below.')
    } catch (err) {
      const code = (err as { code?: unknown })?.code
      if (code === 'missing_key') {
        setNearbyError('Mall search is not set up yet (GOOGLE_PLACES_API_KEY missing). Type the mall name instead.')
      } else if (typeof code === 'number') {
        setNearbyError(`${geoErrorMessage(err)} Search by name instead.`)
      } else {
        setNearbyError('Search unavailable. Type the mall name instead.')
      }
    } finally {
      setNearbyLoading(false)
    }
  }

  const searchError =
    search.error?.code === 'missing_key'
      ? 'Mall search is not set up yet. Type the mall name instead.'
      : search.error
        ? 'Search unavailable. Type the mall name instead.'
        : null

  const showSuggestions = query.trim().length >= 2 && !searchError
  const suggestions = search.data ?? []

  return (
    <section aria-labelledby={`${inputId}-heading`} className="flex flex-col gap-3">
      <h2 id={`${inputId}-heading`} className="font-display text-lg font-bold uppercase tracking-wide">
        Mall
      </h2>

      <button type="button" onClick={findNearby} disabled={nearbyLoading} className={bigButton('signal')}>
        {nearbyLoading ? (
          <LoaderCircle className="size-6 animate-spin" aria-hidden="true" />
        ) : (
          <LocateFixed className="size-6" aria-hidden="true" />
        )}
        {nearbyLoading ? 'Finding malls…' : 'Find malls near me'}
      </button>

      {nearbyError && <Notice>{nearbyError}</Notice>}

      {nearby && nearby.length > 0 && (
        <MallList
          label="Malls near you"
          malls={nearby}
          selectedId={value.placeId}
          onSelect={selectMall}
        />
      )}

      {value.name && (
        <div className="flex items-center gap-3 rounded-lg border-2 border-primary-foreground/80 bg-primary p-3 text-primary-foreground">
          <Check className="size-6 shrink-0" aria-hidden="true" />
          <div className="min-w-0 flex-1">
            <p className="text-xs font-semibold uppercase tracking-wide opacity-80">
              {value.placeId ? 'Selected mall' : 'Custom name'}
            </p>
            <p className="truncate font-display text-xl font-bold uppercase leading-tight">{value.name}</p>
          </div>
          <button
            type="button"
            onClick={() => onChange({ name: '', placeId: null, lat: null, lng: null })}
            className="h-10 rounded-md px-3 text-sm font-semibold underline underline-offset-4"
          >
            Change
          </button>
        </div>
      )}

      <div>
        <label htmlFor={inputId} className="mb-1.5 block text-sm font-medium">
          Search any mall or type its name
        </label>
        <div className="relative">
          <Search
            className="pointer-events-none absolute left-3 top-1/2 size-5 -translate-y-1/2 text-muted-foreground"
            aria-hidden="true"
          />
          <input
            id={inputId}
            type="search"
            inputMode="search"
            autoComplete="off"
            enterKeyHint="done"
            placeholder="e.g. SM City Baliwag"
            value={query}
            onChange={(e) => {
              const text = e.target.value
              setQuery(text)
              onChange({ name: text.trim(), placeId: null, lat: null, lng: null })
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.nativeEvent.isComposing && e.keyCode !== 229) {
                e.preventDefault()
                ;(e.target as HTMLInputElement).blur()
              }
            }}
            className="h-14 w-full rounded-lg border-2 border-input bg-card pl-10 pr-10 text-base outline-none focus:border-ring"
          />
          {search.isLoading && (
            <LoaderCircle
              className="absolute right-3 top-1/2 size-5 -translate-y-1/2 animate-spin text-muted-foreground"
              aria-label="Searching"
            />
          )}
        </div>
      </div>

      {searchError && query.trim().length >= 2 && <Notice>{searchError}</Notice>}

      {showSuggestions && !search.isLoading && suggestions.length === 0 && search.data && (
        <p className="text-sm text-muted-foreground">
          No malls matched. We&apos;ll save &ldquo;{query.trim()}&rdquo; as the name.
        </p>
      )}

      {showSuggestions && suggestions.length > 0 && (
        <MallList label="Search results" malls={suggestions} selectedId={value.placeId} onSelect={selectMall} />
      )}
    </section>
  )
}

function Notice({ children }: { children: React.ReactNode }) {
  return (
    <p role="status" className="flex items-start gap-2 rounded-lg bg-muted p-3 text-sm">
      <TriangleAlert className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
      <span>{children}</span>
    </p>
  )
}

function MallList({
  label,
  malls,
  selectedId,
  onSelect,
}: {
  label: string
  malls: Mall[]
  selectedId: string | null
  onSelect: (m: Mall) => void
}) {
  return (
    <ul aria-label={label} className="flex flex-col overflow-hidden rounded-lg border-2 border-border bg-card">
      {malls.map((mall) => {
        const selected = mall.id === selectedId
        return (
          <li key={mall.id} className="border-b border-border last:border-b-0">
            <button
              type="button"
              onClick={() => onSelect(mall)}
              aria-pressed={selected}
              className={cn(
                'flex min-h-14 w-full items-center gap-3 px-3 py-2.5 text-left transition',
                selected ? 'bg-primary/25' : 'hover:bg-muted',
              )}
            >
              <MapPin className="size-5 shrink-0 text-signal" aria-hidden="true" />
              <span className="min-w-0 flex-1">
                <span className="block font-medium">
                  {mall.name}
                  {mall.distanceMeters !== undefined && (
                    <span className="font-normal text-muted-foreground"> · {formatDistance(mall.distanceMeters)}</span>
                  )}
                </span>
                {mall.address && <span className="block truncate text-sm text-muted-foreground">{mall.address}</span>}
              </span>
              {selected && <Check className="size-5 shrink-0" aria-label="Selected" />}
            </button>
          </li>
        )
      })}
    </ul>
  )
}
