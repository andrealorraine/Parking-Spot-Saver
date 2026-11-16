import type { Metadata } from 'next'
import { PageHeader } from '@/components/page-header'
import { SaveForm } from '@/components/save/save-form'

export const metadata: Metadata = { title: 'Save spot · Parking Spot Saver' }

export default async function SavePage({ searchParams }: { searchParams: Promise<{ replace?: string }> }) {
  const { replace } = await searchParams
  const isReplace = replace === '1'
  return (
    <>
      <PageHeader
        title={isReplace ? 'Replace spot' : 'Save my spot'}
        subtitle="Takes about 10 seconds. Level is the only must-have."
      />
      <SaveForm replace={isReplace} />
    </>
  )
}
