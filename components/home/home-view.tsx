'use client'

import { SquareParking } from 'lucide-react'
import Link from 'next/link'
import { PageHeader } from '@/components/page-header'
import { useActiveSpot, useHistory, useHydrated } from '@/lib/storage'
import { bigButton } from '@/lib/ui'
import { ActiveSpot } from './active-spot'
import { RecentSpots } from './recent-spots'

export function HomeView() {
  const hydrated = useHydrated()
  const spot = useActiveSpot()
  const history = useHistory()

  if (!hydrated) {
    return (
      <div aria-busy="true" aria-label="Loading">
        <PageHeader title="Parking Spot Saver" />
        <div className="h-64 animate-pulse rounded-xl bg-muted" />
      </div>
    )
  }

  if (spot) {
    return (
      <>
        <PageHeader title="You parked here" subtitle="Your saved spot" />
        <ActiveSpot spot={spot} />
      </>
    )
  }

  return (
    <>
      <PageHeader title="Parking Spot Saver" subtitle="Never lose your car at the mall again." />
      <section className="rounded-xl border-2 border-dashed border-foreground/40 bg-card p-6 text-center">
        <SquareParking className="mx-auto size-16 text-signal" aria-hidden="true" strokeWidth={1.75} />
        <h2 className="mt-3 font-display text-2xl font-bold uppercase">No spot saved</h2>
        <p className="mx-auto mt-1 max-w-xs text-sm text-muted-foreground text-pretty">
          Just parked? Save your level, zone, and a photo so you can walk straight back later.
        </p>
        <Link href="/save" className={bigButton('primary', 'mt-5 min-h-20 text-2xl')}>
          Save parking spot
        </Link>
      </section>
      <RecentSpots items={history.slice(0, 3)} total={history.length} />
    </>
  )
}
