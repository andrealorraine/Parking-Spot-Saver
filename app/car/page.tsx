import type { Metadata } from 'next'
import { CarView } from '@/components/car/car-view'
import { PageHeader } from '@/components/page-header'

export const metadata: Metadata = { title: 'Find my car · Parking Spot Saver' }

export default function CarPage() {
  return (
    <>
      <PageHeader title="Find my car" />
      <CarView />
    </>
  )
}
