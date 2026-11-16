'use client'

import { History } from 'lucide-react'
import Link from 'next/link'
import { deleteHistoryItem, useHistory, useHydrated } from '@/lib/storage'
import { bigButton } from '@/lib/ui'
import { HistoryRow } from './history-row'

export function HistoryView() {
  const hydrated = useHydrated()
  const history = useHistory()

  if (!hydrated) return <div className="h-40 animate-pulse rounded-xl bg-muted" aria-busy="true" />

  if (history.length === 0) {
    return (
      <div className="rounded-xl border-2 border-dashed border-foreground/40 bg-card p-6 text-center">
        <History className="mx-auto size-12 text-muted-foreground" aria-hidden="true" />
        <p className="mt-3 font-display text-xl font-bold uppercase">Nothing here yet</p>
        <p className="mt-1 text-sm text-muted-foreground">
          When you tap &ldquo;I&apos;ve left&rdquo;, the spot is saved here.
        </p>
        <Link href="/save" className={bigButton('primary', 'mt-5')}>
          Save parking spot
        </Link>
      </div>
    )
  }

  return (
    <ul className="flex flex-col gap-2">
      {history.map((item) => (
        <HistoryRow key={item.id} item={item} onDelete={deleteHistoryItem} />
      ))}
    </ul>
  )
}
