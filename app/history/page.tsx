import type { Metadata } from 'next'
import { HistoryView } from '@/components/history/history-view'
import { PageHeader } from '@/components/page-header'

export const metadata: Metadata = { title: 'History · Parking Spot Saver' }

export default function HistoryPage() {
  return (
    <>
      <PageHeader title="History" subtitle="Your last 20 parking spots, stored on this phone." />
      <HistoryView />
    </>
  )
}
