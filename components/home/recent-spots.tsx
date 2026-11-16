import Link from 'next/link'
import { HistoryRow } from '@/components/history/history-row'
import type { HistoryItem } from '@/lib/types'

export function RecentSpots({ items, total }: { items: HistoryItem[]; total: number }) {
  return (
    <section aria-labelledby="recent-heading" className="mt-8">
      <div className="mb-3 flex items-baseline justify-between">
        <h2 id="recent-heading" className="font-display text-xl font-bold uppercase tracking-wide">
          Recent spots
        </h2>
        {total > items.length && (
          <Link href="/history" className="text-sm font-medium text-signal underline-offset-4 hover:underline">
            See all ({total})
          </Link>
        )}
      </div>
      {items.length === 0 ? (
        <p className="rounded-lg bg-card p-4 text-sm text-muted-foreground">
          Your past parking spots will show up here.
        </p>
      ) : (
        <ul className="flex flex-col gap-2">
          {items.map((item) => (
            <HistoryRow key={item.id} item={item} />
          ))}
        </ul>
      )}
    </section>
  )
}
