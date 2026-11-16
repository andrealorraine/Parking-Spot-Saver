import { Trash2 } from 'lucide-react'
import { formatDateTime, formatDuration } from '@/lib/format'
import type { HistoryItem } from '@/lib/types'

export function HistoryRow({ item, onDelete }: { item: HistoryItem; onDelete?: (id: string) => void }) {
  return (
    <li className="flex items-center gap-3 rounded-lg border border-border bg-card p-3">
      <div
        aria-label={`Level ${item.level}, zone ${item.zone || 'none'}`}
        className="flex h-14 w-16 shrink-0 flex-col items-center justify-center rounded-md bg-secondary font-display leading-none text-secondary-foreground"
      >
        <span className="text-2xl font-extrabold">{item.level}</span>
        {item.zone && <span className="text-sm font-bold text-primary">Zone {item.zone}</span>}
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate font-medium">{item.mallName || 'Unnamed location'}</p>
        <p className="text-sm text-muted-foreground">
          {formatDateTime(item.parkedAt)} · {formatDuration(item.endedAt - item.parkedAt)}
        </p>
      </div>
      {onDelete && (
        <button
          type="button"
          onClick={() => onDelete(item.id)}
          className="grid size-12 shrink-0 place-items-center rounded-md text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
          aria-label={`Delete ${item.mallName || 'spot'} from ${formatDateTime(item.parkedAt)}`}
        >
          <Trash2 className="size-5" aria-hidden="true" />
        </button>
      )}
    </li>
  )
}
