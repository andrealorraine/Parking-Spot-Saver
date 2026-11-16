'use client'

import { AlarmClock, OctagonAlert, TriangleAlert } from 'lucide-react'
import { useEffect } from 'react'
import { alertUser } from '@/lib/alerts'
import { estimateFee, formatClock, formatMoney, formatTime } from '@/lib/format'
import { updateActiveSpot } from '@/lib/storage'
import { WARNING_THRESHOLD_MS, type ParkingSpot } from '@/lib/types'
import { useNow } from '@/lib/use-now'
import { cn } from '@/lib/utils'

export function ParkingTimer({ spot }: { spot: ParkingSpot }) {
  const now = useNow()
  const elapsed = Math.max(0, now - spot.parkedAt)
  const limitMs = spot.limitMinutes * 60_000
  const hasLimit = limitMs > 0
  const remaining = limitMs - elapsed
  const expired = hasLimit && remaining <= 0
  const warning = hasLimit && !expired && remaining <= WARNING_THRESHOLD_MS
  const progress = hasLimit ? Math.min(1, elapsed / limitMs) : 0

  useEffect(() => {
    if (!hasLimit) return
    if (expired && !spot.warnedEnd) {
      updateActiveSpot({ warned15: true, warnedEnd: true })
      alertUser('Parking limit passed', `Your ${spot.limitMinutes} min limit at ${spot.mallName || 'the mall'} is up.`)
    } else if (warning && !spot.warned15) {
      updateActiveSpot({ warned15: true })
      alertUser('15 minutes or less left', `Head back to level ${spot.level}${spot.zone ? `, zone ${spot.zone}` : ''}.`)
    }
  }, [hasLimit, expired, warning, spot])

  const fee = spot.ratePerHour && spot.ratePerHour > 0 ? estimateFee(elapsed, spot.ratePerHour) : null

  return (
    <section aria-label="Parking time" className="mt-4 flex flex-col gap-3">
      {expired && (
        <div role="alert" className="flex items-center gap-3 rounded-lg bg-destructive p-4 text-destructive-foreground">
          <OctagonAlert className="size-7 shrink-0" aria-hidden="true" />
          <div>
            <p className="font-display text-2xl font-extrabold uppercase leading-none">Limit passed</p>
            <p className="text-sm opacity-90">Over by {formatClock(-remaining)}. Head back now.</p>
          </div>
        </div>
      )}
      {warning && (
        <div
          role="alert"
          className="flex items-center gap-3 rounded-lg border-2 border-warning-foreground bg-warning p-4 text-warning-foreground"
        >
          <TriangleAlert className="size-7 shrink-0" aria-hidden="true" />
          <div>
            <p className="font-display text-2xl font-extrabold uppercase leading-none">15 min or less left</p>
            <p className="text-sm">Time to start walking back to your car.</p>
          </div>
        </div>
      )}

      <div className="rounded-xl bg-card p-4">
        <div className="flex items-end justify-between gap-3">
          <div>
            <p className="font-display text-sm font-bold uppercase tracking-[0.2em] text-muted-foreground">
              Parked for
            </p>
            <p
              className="font-display text-6xl font-extrabold leading-none tabular-nums"
              aria-live="off"
              suppressHydrationWarning
            >
              {formatClock(elapsed)}
            </p>
          </div>
          <p className="pb-1 text-right text-sm text-muted-foreground">
            since <span className="font-medium text-foreground">{formatTime(spot.parkedAt)}</span>
          </p>
        </div>

        {hasLimit && (
          <div className="mt-4">
            <div
              role="progressbar"
              aria-label="Time used of parking limit"
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={Math.round(progress * 100)}
              className="h-4 overflow-hidden rounded-full bg-muted"
            >
              <div
                className={cn(
                  'h-full rounded-full transition-[width] duration-1000 ease-linear',
                  expired ? 'bg-destructive' : warning ? 'bg-primary' : 'bg-signal',
                )}
                style={{ width: `${progress * 100}%` }}
              />
            </div>
            <div className="mt-2 flex items-center justify-between text-sm">
              <span className="flex items-center gap-1.5 text-muted-foreground">
                <AlarmClock className="size-4" aria-hidden="true" />
                {spot.limitMinutes >= 60 ? `${spot.limitMinutes / 60} hr` : `${spot.limitMinutes} min`} limit
              </span>
              <span className={cn('font-semibold tabular-nums', expired && 'text-destructive')}>
                {expired ? 'Time is up' : `${formatClock(remaining)} left`}
              </span>
            </div>
          </div>
        )}

        {fee && (
          <div className="mt-4 flex items-baseline justify-between border-t border-border pt-3">
            <span className="text-sm text-muted-foreground">
              Estimated fee <span className="whitespace-nowrap">(billed hourly)</span>
            </span>
            <span className="text-right">
              <span className="font-display text-3xl font-extrabold tabular-nums">{formatMoney(fee.fee)}</span>
              <span className="block text-xs text-muted-foreground">
                {fee.hours} hr × {formatMoney(spot.ratePerHour ?? 0)}
              </span>
            </span>
          </div>
        )}
      </div>
    </section>
  )
}
