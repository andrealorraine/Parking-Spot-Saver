import { ExternalLink, MapPinOff, StickyNote } from 'lucide-react'
import { mallMapsUrl } from '@/lib/geo'
import type { ParkingSpot } from '@/lib/types'

export function SpotSign({ spot }: { spot: ParkingSpot }) {
  return (
    <section
      aria-label="Saved parking spot"
      className="overflow-hidden rounded-xl border-2 border-secondary bg-secondary text-secondary-foreground shadow-md"
    >
      <div className="hazard-stripe h-3" aria-hidden="true" />
      <div className="grid grid-cols-2 divide-x-2 divide-secondary-foreground/20">
        <div className="p-4 text-center">
          <p className="font-display text-sm font-bold uppercase tracking-[0.2em] text-secondary-foreground/70">
            Level
          </p>
          <p className="font-display text-7xl font-extrabold leading-none text-primary">{spot.level}</p>
        </div>
        <div className="p-4 text-center">
          <p className="font-display text-sm font-bold uppercase tracking-[0.2em] text-secondary-foreground/70">
            Zone
          </p>
          <p className="font-display text-7xl font-extrabold leading-none text-primary">{spot.zone || '—'}</p>
        </div>
      </div>
      <div className="border-t-2 border-secondary-foreground/20 px-4 py-3">
        {spot.mallName ? (
          <a
            href={mallMapsUrl(spot.mallName, spot.mallPlaceId)}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 font-display text-2xl font-bold uppercase leading-tight underline decoration-2 underline-offset-4 hover:text-primary"
          >
            {spot.mallName}
            <ExternalLink className="size-4 shrink-0" aria-hidden="true" />
            <span className="sr-only">(opens in Google Maps)</span>
          </a>
        ) : (
          <p className="font-display text-2xl font-bold uppercase text-secondary-foreground/70">Unnamed location</p>
        )}
        {spot.lat === null && (
          <p className="mt-1 flex items-center gap-1.5 text-sm text-secondary-foreground/80">
            <MapPinOff className="size-4" aria-hidden="true" /> No GPS saved.
          </p>
        )}
      </div>
    </section>
  )
}

export function SpotExtras({ spot }: { spot: ParkingSpot }) {
  if (!spot.note && !spot.photoDataUrl) return null
  return (
    <div className="mt-4 flex flex-col gap-3">
      {spot.note && (
        <p className="flex gap-2 rounded-lg border-l-4 border-primary bg-card p-3 text-base">
          <StickyNote className="mt-0.5 size-5 shrink-0 text-muted-foreground" aria-hidden="true" />
          <span className="text-pretty">{spot.note}</span>
        </p>
      )}
      {spot.photoDataUrl && (
        // eslint-disable-next-line @next/next/no-img-element -- local data URL
        <img
          src={spot.photoDataUrl}
          alt={`Photo of your parking spot${spot.note ? `: ${spot.note}` : ''}`}
          className="w-full rounded-lg border-2 border-border object-cover"
        />
      )}
    </div>
  )
}
