'use client'

import { Camera, LoaderCircle, SquareParking, X } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useId, useRef, useState } from 'react'
import { requestNotificationPermission } from '@/lib/alerts'
import { getCurrentPosition } from '@/lib/geo'
import { compressImage } from '@/lib/image'
import { addToHistory, getActiveSpot, setActiveSpot, useHydrated } from '@/lib/storage'
import { LEVELS, LIMITS, ZONES, type ParkingSpot } from '@/lib/types'
import { bigButton } from '@/lib/ui'
import { ChipGroup } from './chip-group'
import { MallPicker, type MallValue } from './mall-picker'

export function SaveForm({ replace }: { replace: boolean }) {
  const hydrated = useHydrated()
  if (!hydrated) return <div className="h-96 animate-pulse rounded-xl bg-muted" aria-busy="true" />
  return <SaveFormInner replace={replace} />
}

function SaveFormInner({ replace }: { replace: boolean }) {
  const router = useRouter()
  const ids = useId()
  const fileRef = useRef<HTMLInputElement>(null)
  const [existing] = useState(() => getActiveSpot())
  const prefill = replace ? existing : null

  const [mall, setMall] = useState<MallValue>({
    name: prefill?.mallName ?? '',
    placeId: prefill?.mallPlaceId ?? null,
    lat: prefill?.mallLat ?? null,
    lng: prefill?.mallLng ?? null,
  })
  const [level, setLevel] = useState<string | null>(prefill?.level ?? null)
  const [zone, setZone] = useState<string | null>(prefill?.zone || null)
  const [note, setNote] = useState(prefill?.note ?? '')
  const [limit, setLimit] = useState<number>(prefill?.limitMinutes ?? 0)
  const [rate, setRate] = useState(prefill?.ratePerHour ? String(prefill.ratePerHour) : '')
  const [photo, setPhoto] = useState<string | null>(prefill?.photoDataUrl ?? null)
  const [photoBusy, setPhotoBusy] = useState(false)
  const [photoError, setPhotoError] = useState<string | null>(null)
  const [levelError, setLevelError] = useState<string | null>(null)
  const [saving, setSaving] = useState<null | 'locating' | 'saving'>(null)
  const [saveError, setSaveError] = useState<string | null>(null)

  const onPhoto = async (file: File | undefined) => {
    if (!file) return
    setPhotoBusy(true)
    setPhotoError(null)
    try {
      setPhoto(await compressImage(file))
    } catch (err) {
      setPhotoError(err instanceof Error ? err.message : 'Could not use this photo.')
    } finally {
      setPhotoBusy(false)
      if (fileRef.current) fileRef.current.value = ''
    }
  }

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!level) {
      setLevelError('Pick the level you parked on.')
      document.getElementById(`${ids}-level`)?.scrollIntoView({ behavior: 'smooth', block: 'center' })
      return
    }
    setSaveError(null)
    setSaving('locating')

    let lat: number | null = null
    let lng: number | null = null
    let accuracyMeters: number | null = null
    try {
      const pos = await getCurrentPosition({ enableHighAccuracy: true, timeout: 10000, maximumAge: 0 })
      lat = pos.coords.latitude
      lng = pos.coords.longitude
      accuracyMeters = Math.round(pos.coords.accuracy)
    } catch {
      // Location denied or unavailable: save without GPS.
    }

    setSaving('saving')
    const rateNum = Number.parseFloat(rate)
    const spot: ParkingSpot = {
      mallName: mall.name,
      mallPlaceId: mall.placeId,
      mallLat: mall.lat,
      mallLng: mall.lng,
      level,
      zone: zone ?? '',
      note: note.trim(),
      photoDataUrl: photo,
      lat,
      lng,
      accuracyMeters,
      parkedAt: replace && existing ? existing.parkedAt : Date.now(),
      limitMinutes: limit,
      ratePerHour: Number.isFinite(rateNum) && rateNum > 0 ? rateNum : null,
      warned15: false,
      warnedEnd: false,
    }

    const current = getActiveSpot()
    if (current && !replace) addToHistory(current, Date.now())

    const result = setActiveSpot(spot)
    if (result === 'failed') {
      setSaving(null)
      setSaveError('Could not save on this device. Storage may be full or disabled (private browsing).')
      return
    }
    if (limit > 0) requestNotificationPermission()
    router.push('/')
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-7" noValidate>
      <MallPicker value={mall} onChange={setMall} />

      <div id={`${ids}-level`}>
        <ChipGroup
          label="Level"
          required
          options={LEVELS.map((l) => ({ label: l, value: l }))}
          value={level}
          onChange={(v) => {
            setLevel(v)
            setLevelError(null)
          }}
          error={levelError ?? undefined}
        />
      </div>

      <ChipGroup
        label="Zone"
        columns={6}
        options={ZONES.map((z) => ({ label: z, value: z }))}
        value={zone}
        onChange={(v) => setZone((cur) => (cur === v ? null : v))}
      />

      <div>
        <label htmlFor={`${ids}-note`} className="mb-2 block font-display text-lg font-bold uppercase tracking-wide">
          Landmark note
        </label>
        <textarea
          id={`${ids}-note`}
          rows={2}
          maxLength={200}
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Near elevator, blue pillar 14"
          className="w-full rounded-lg border-2 border-input bg-card p-3 text-base outline-none focus:border-ring"
        />
      </div>

      <div className="flex flex-col gap-2">
        <span className="font-display text-lg font-bold uppercase tracking-wide">Photo</span>
        {photo ? (
          <div className="relative">
            {/* eslint-disable-next-line @next/next/no-img-element -- local data URL */}
            <img src={photo} alt="Preview of your parking spot photo" className="w-full rounded-lg border-2 border-border" />
            <button
              type="button"
              onClick={() => setPhoto(null)}
              className="absolute right-2 top-2 grid size-12 place-items-center rounded-full bg-secondary text-secondary-foreground"
              aria-label="Remove photo"
            >
              <X className="size-5" aria-hidden="true" />
            </button>
          </div>
        ) : null}
        <label className={bigButton('outline', 'cursor-pointer')}>
          {photoBusy ? (
            <LoaderCircle className="size-5 animate-spin" aria-hidden="true" />
          ) : (
            <Camera className="size-5" aria-hidden="true" />
          )}
          {photo ? 'Retake photo' : 'Take a photo'}
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            capture="environment"
            className="sr-only"
            onChange={(e) => onPhoto(e.target.files?.[0])}
          />
        </label>
        {photoError && <p className="text-sm font-medium text-destructive">{photoError}</p>}
      </div>

      <ChipGroup
        label="Time limit"
        columns={5}
        options={LIMITS.map((l) => ({ label: l.label, value: l.minutes }))}
        value={limit}
        onChange={setLimit}
      />

      <div>
        <label htmlFor={`${ids}-rate`} className="mb-2 block font-display text-lg font-bold uppercase tracking-wide">
          Hourly rate <span className="text-sm font-medium normal-case text-muted-foreground">(optional)</span>
        </label>
        <input
          id={`${ids}-rate`}
          type="number"
          inputMode="decimal"
          min={0}
          step="any"
          value={rate}
          onChange={(e) => setRate(e.target.value)}
          placeholder="e.g. 50"
          className="h-14 w-full rounded-lg border-2 border-input bg-card px-3 text-base outline-none focus:border-ring"
        />
      </div>

      {saveError && (
        <p role="alert" className="rounded-lg bg-destructive p-3 text-sm font-medium text-destructive-foreground">
          {saveError}
        </p>
      )}

      <div className="sticky bottom-[calc(4.5rem+env(safe-area-inset-bottom))] -mx-1 bg-background/90 px-1 py-2 backdrop-blur">
        <button type="submit" disabled={saving !== null} className={bigButton('primary', 'min-h-16 text-2xl')}>
          {saving ? (
            <LoaderCircle className="size-6 animate-spin" aria-hidden="true" />
          ) : (
            <SquareParking className="size-6" aria-hidden="true" />
          )}
          {saving === 'locating' ? 'Getting GPS…' : saving === 'saving' ? 'Saving…' : 'Save my spot'}
        </button>
      </div>
    </form>
  )
}
