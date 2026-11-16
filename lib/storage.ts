'use client'

import { useSyncExternalStore } from 'react'
import { MAX_HISTORY, type HistoryItem, type ParkingSpot } from './types'

const ACTIVE_KEY = 'pss:active-spot'
const HISTORY_KEY = 'pss:history'
const CHANGE_EVENT = 'pss:change'

function readRaw(key: string): string | null {
  try {
    return window.localStorage.getItem(key)
  } catch {
    return null
  }
}

function writeRaw(key: string, value: string | null): boolean {
  try {
    if (value === null) window.localStorage.removeItem(key)
    else window.localStorage.setItem(key, value)
    window.dispatchEvent(new Event(CHANGE_EVENT))
    return true
  } catch {
    return false
  }
}

const parseCache = new Map<string, { raw: string | null; value: unknown }>()

function readParsed<T>(key: string, fallback: T): T {
  const raw = readRaw(key)
  const cached = parseCache.get(key)
  if (cached && cached.raw === raw) return cached.value as T
  let value: T = fallback
  if (raw) {
    try {
      value = JSON.parse(raw) as T
    } catch {
      value = fallback
    }
  }
  parseCache.set(key, { raw, value })
  return value
}

const EMPTY_HISTORY: HistoryItem[] = []

export function getActiveSpot(): ParkingSpot | null {
  return readParsed<ParkingSpot | null>(ACTIVE_KEY, null)
}

export function getHistory(): HistoryItem[] {
  const list = readParsed<HistoryItem[]>(HISTORY_KEY, EMPTY_HISTORY)
  return Array.isArray(list) ? list : EMPTY_HISTORY
}

/** Returns "ok", "saved-without-photo" if storage was full, or "failed". */
export function setActiveSpot(spot: ParkingSpot): 'ok' | 'saved-without-photo' | 'failed' {
  if (writeRaw(ACTIVE_KEY, JSON.stringify(spot))) return 'ok'
  if (spot.photoDataUrl && writeRaw(ACTIVE_KEY, JSON.stringify({ ...spot, photoDataUrl: null }))) {
    return 'saved-without-photo'
  }
  return 'failed'
}

export function updateActiveSpot(patch: Partial<ParkingSpot>) {
  const current = getActiveSpot()
  if (!current) return
  writeRaw(ACTIVE_KEY, JSON.stringify({ ...current, ...patch }))
}

export function endActiveSpot() {
  const spot = getActiveSpot()
  if (!spot) return
  addToHistory(spot, Date.now())
  writeRaw(ACTIVE_KEY, null)
}

export function addToHistory(spot: ParkingSpot, endedAt: number) {
  const item: HistoryItem = {
    id: `${spot.parkedAt}-${Math.random().toString(36).slice(2, 8)}`,
    mallName: spot.mallName,
    level: spot.level,
    zone: spot.zone,
    parkedAt: spot.parkedAt,
    endedAt,
  }
  writeRaw(HISTORY_KEY, JSON.stringify([item, ...getHistory()].slice(0, MAX_HISTORY)))
}

export function deleteHistoryItem(id: string) {
  writeRaw(HISTORY_KEY, JSON.stringify(getHistory().filter((h) => h.id !== id)))
}

function subscribe(callback: () => void) {
  window.addEventListener('storage', callback)
  window.addEventListener(CHANGE_EVENT, callback)
  return () => {
    window.removeEventListener('storage', callback)
    window.removeEventListener(CHANGE_EVENT, callback)
  }
}

const noopSubscribe = () => () => {}

export function useHydrated() {
  return useSyncExternalStore(
    noopSubscribe,
    () => true,
    () => false,
  )
}

export function useActiveSpot() {
  return useSyncExternalStore(subscribe, getActiveSpot, () => null)
}

export function useHistory() {
  return useSyncExternalStore(subscribe, getHistory, () => EMPTY_HISTORY)
}
