export type ParkingSpot = {
  mallName: string
  mallPlaceId: string | null
  mallLat: number | null
  mallLng: number | null
  level: string
  zone: string
  note: string
  photoDataUrl: string | null
  lat: number | null
  lng: number | null
  accuracyMeters: number | null
  parkedAt: number
  /** 0 = no limit */
  limitMinutes: number
  ratePerHour: number | null
  warned15: boolean
  warnedEnd: boolean
}

export type HistoryItem = {
  id: string
  mallName: string
  level: string
  zone: string
  parkedAt: number
  endedAt: number
}

export type Mall = {
  id: string
  name: string
  address: string
  lat: number | null
  lng: number | null
  distanceMeters?: number
}

export const LEVELS = ['G', 'P1', 'P2', 'P3', 'P4', 'B1', 'B2', 'Roof'] as const
export const ZONES = ['A', 'B', 'C', 'D', 'E', 'F'] as const
export const LIMITS = [
  { label: 'No limit', minutes: 0 },
  { label: '1 hr', minutes: 60 },
  { label: '2 hr', minutes: 120 },
  { label: '3 hr', minutes: 180 },
  { label: '4 hr', minutes: 240 },
] as const

export const WARNING_THRESHOLD_MS = 15 * 60 * 1000
export const UNRELIABLE_GPS_METERS = 25
export const MAX_HISTORY = 20
