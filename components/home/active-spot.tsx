'use client'

import { Footprints, LogOut, Map, RefreshCcw } from 'lucide-react'
import Link from 'next/link'
import { useState } from 'react'
import { SpotExtras, SpotSign } from '@/components/spot/spot-sign'
import { walkingDirectionsByNameUrl, walkingDirectionsUrl } from '@/lib/geo'
import { endActiveSpot } from '@/lib/storage'
import type { ParkingSpot } from '@/lib/types'
import { bigButton } from '@/lib/ui'
import { ParkingTimer } from './parking-timer'

export function directionsFor(spot: ParkingSpot) {
  if (spot.lat !== null && spot.lng !== null) return walkingDirectionsUrl(spot.lat, spot.lng)
  if (spot.mallLat !== null && spot.mallLng !== null) return walkingDirectionsUrl(spot.mallLat, spot.mallLng)
  if (spot.mallName) return walkingDirectionsByNameUrl(spot.mallName)
  return null
}

export function ActiveSpot({ spot }: { spot: ParkingSpot }) {
  const [confirming, setConfirming] = useState(false)
  const directions = directionsFor(spot)

  return (
    <>
      <SpotSign spot={spot} />
      <ParkingTimer spot={spot} />
      <SpotExtras spot={spot} />

      <div className="mt-6 flex flex-col gap-3">
        {directions ? (
          <a href={directions} target="_blank" rel="noopener noreferrer" className={bigButton('primary')}>
            <Footprints className="size-6" aria-hidden="true" /> Walk to my car
          </a>
        ) : (
          <Link href="/car" className={bigButton('primary')}>
            <Footprints className="size-6" aria-hidden="true" /> Walk to my car
          </Link>
        )}
        <Link href="/car" className={bigButton('outline')}>
          <Map className="size-5" aria-hidden="true" /> Show on map
        </Link>

        {confirming ? (
          <div role="group" aria-label="Confirm leaving" className="rounded-lg border-2 border-foreground bg-card p-4">
            <p className="font-medium">Picked up your car?</p>
            <p className="text-sm text-muted-foreground">This spot will move to your history.</p>
            <div className="mt-3 grid grid-cols-2 gap-2">
              <button type="button" className={bigButton('outline')} onClick={() => setConfirming(false)}>
                Cancel
              </button>
              <button type="button" className={bigButton('dark')} onClick={() => endActiveSpot()} autoFocus>
                Yes, I left
              </button>
            </div>
          </div>
        ) : (
          <button type="button" className={bigButton('dark')} onClick={() => setConfirming(true)}>
            <LogOut className="size-5" aria-hidden="true" /> I&apos;ve left
          </button>
        )}

        <Link href="/save?replace=1" className={bigButton('outline', 'text-lg')}>
          <RefreshCcw className="size-5" aria-hidden="true" /> Replace this spot
        </Link>
      </div>
    </>
  )
}
