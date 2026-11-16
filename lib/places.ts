import 'server-only'
import { distanceMeters } from './geo'
import type { Mall } from './types'

const FIELD_MASK = 'places.id,places.displayName,places.location,places.formattedAddress'

type PlacesResponse = {
  places?: {
    id: string
    displayName?: { text?: string }
    location?: { latitude?: number; longitude?: number }
    formattedAddress?: string
  }[]
}

export class PlacesError extends Error {
  constructor(
    message: string,
    public status: number,
    public code: 'missing_key' | 'upstream_error',
  ) {
    super(message)
  }
}

export async function callPlaces(endpoint: 'searchNearby' | 'searchText', body: object): Promise<Mall[]> {
  const key = process.env.GOOGLE_PLACES_API_KEY
  if (!key) throw new PlacesError('GOOGLE_PLACES_API_KEY is not configured.', 503, 'missing_key')

  const res = await fetch(`https://places.googleapis.com/v1/places:${endpoint}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Goog-Api-Key': key,
      'X-Goog-FieldMask': FIELD_MASK,
    },
    body: JSON.stringify(body),
    cache: 'no-store',
    signal: AbortSignal.timeout(8000),
  })

  if (!res.ok) {
    console.error('[places] upstream error', res.status, await res.text().catch(() => ''))
    throw new PlacesError('Places search failed.', 502, 'upstream_error')
  }

  const data = (await res.json()) as PlacesResponse
  return (data.places ?? []).map((p) => ({
    id: p.id,
    name: p.displayName?.text ?? 'Unnamed mall',
    address: p.formattedAddress ?? '',
    lat: p.location?.latitude ?? null,
    lng: p.location?.longitude ?? null,
  }))
}

export function withDistance(malls: Mall[], lat: number, lng: number): Mall[] {
  return malls
    .map((m) => ({
      ...m,
      distanceMeters:
        m.lat !== null && m.lng !== null ? Math.round(distanceMeters(lat, lng, m.lat, m.lng)) : undefined,
    }))
    .sort((a, b) => (a.distanceMeters ?? Infinity) - (b.distanceMeters ?? Infinity))
}

export function parseCoord(value: string | null, limit: number) {
  if (value === null || value.trim() === '') return null
  const n = Number(value)
  return Number.isFinite(n) && Math.abs(n) <= limit ? n : null
}

export function errorResponse(err: unknown) {
  if (err instanceof PlacesError) {
    return Response.json({ error: err.code, message: err.message }, { status: err.status })
  }
  console.error('[places] unexpected error', err)
  return Response.json({ error: 'upstream_error', message: 'Places search failed.' }, { status: 502 })
}
