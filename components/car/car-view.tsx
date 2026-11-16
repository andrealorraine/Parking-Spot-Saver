'use client'

import { Car, Footprints, MapPinned, TriangleAlert } from 'lucide-react'
import Link from 'next/link'
import { directionsFor } from '@/components/home/active-spot'
import { SpotExtras, SpotSign } from '@/components/spot/spot-sign'
import { mallMapsUrl } from '@/lib/geo'
import { useActiveSpot, useHydrated } from '@/lib/storage'
import { UNRELIABLE_GPS_METERS } from '@/lib/types'
import { bigButton } from '@/lib/ui'
import { CarMap } from './car-map'

export function CarView() {
  const hydrated = useHydrated()
  const spot = useActiveSpot()

  if (!hydrated) return <div className="aspect-square animate-pulse rounded-xl bg-muted" aria-busy="true" />

  if (!spot) {
    return (
      <div className="rounded-xl border-2 border-dashed border-foreground/40 bg-card p-6 text-center">
        <Car className="mx-auto size-12 text-muted-foreground" aria-hidden="true" />
        <p className="mt-3 font-display text-xl font-bold uppercase">No car saved</p>
        <p className="mt-1 text-sm text-muted-foreground">Save your spot when you park and it will appear here.</p>
        <Link href="/save" className={bigButton('primary', 'mt-5')}>
          Save parking spot
        </Link>
      </div>
    )
  }

  const directions = directionsFor(spot)
  const unreliable = spot.accuracyMeters === null || spot.accuracyMeters > UNRELIABLE_GPS_METERS

  return (
    <>
      <CarMap spot={spot} />

      {unreliable && (
        <p role="note" className="mt-3 flex items-start gap-2 rounded-lg border-2 border-warning-foreground/80 bg-warning p-3 text-sm font-medium text-warning-foreground">
          <TriangleAlert className="mt-0.5 size-5 shrink-0" aria-hidden="true" />
          <span>
            GPS is unreliable inside covered parking. Trust the level, zone, and photo first.
            {spot.accuracyMeters !== null && (
              <span className="block font-normal">Saved accuracy: about {spot.accuracyMeters} m.</span>
            )}
          </span>
        </p>
      )}

      <div className="mt-4 flex flex-col gap-3">
        {directions && (
          <a href={directions} target="_blank" rel="noopener noreferrer" className={bigButton('primary')}>
            <Footprints className="size-6" aria-hidden="true" /> Walk to my car
          </a>
        )}
        {spot.mallName && (
          <a
            href={mallMapsUrl(spot.mallName, spot.mallPlaceId)}
            target="_blank"
            rel="noopener noreferrer"
            className={bigButton('signal')}
          >
            <MapPinned className="size-5" aria-hidden="true" /> Open mall in Google Maps
          </a>
        )}
      </div>

      <div className="mt-6">
        <SpotSign spot={spot} />
        <SpotExtras spot={spot} />
      </div>
    </>
  )
}
