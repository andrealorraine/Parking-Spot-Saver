'use client'

import {
  AdvancedMarker,
  APIProvider,
  APILoadingStatus,
  ColorScheme,
  Map,
  Pin,
  useApiLoadingStatus,
  useMap,
} from '@vis.gl/react-google-maps'
import { Car, MapPinOff, Store } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import type { ParkingSpot } from '@/lib/types'

type LatLng = { lat: number; lng: number }

const MAPS_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY

function useWatchPosition() {
  const [position, setPosition] = useState<LatLng | null>(null)
  useEffect(() => {
    if (!('geolocation' in navigator)) return
    const id = navigator.geolocation.watchPosition(
      (pos) => setPosition({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      () => {},
      { enableHighAccuracy: true, maximumAge: 5000, timeout: 20000 },
    )
    return () => navigator.geolocation.clearWatch(id)
  }, [])
  return position
}

export function CarMap({ spot }: { spot: ParkingSpot }) {
  const me = useWatchPosition()
  const car = spot.lat !== null && spot.lng !== null ? { lat: spot.lat, lng: spot.lng } : null
  const mall = spot.mallLat !== null && spot.mallLng !== null ? { lat: spot.mallLat, lng: spot.mallLng } : null

  if (!MAPS_KEY) {
    return (
      <MapFallback
        title="Find your car"
        body="Use your level, zone, and photo below. Tap “Walk to my car” to open walking directions in Google Maps."
      />
    )
  }

  if (!car && !mall && !me) {
    return <MapFallback title="No location saved" body="No GPS saved for this spot. Use the level, zone, and photo below." />
  }

  return (
    <APIProvider apiKey={MAPS_KEY}>
      <MapInner car={car} mall={mall} me={me} />
    </APIProvider>
  )
}

function MapInner({ car, mall, me }: { car: LatLng | null; mall: LatLng | null; me: LatLng | null }) {
  const status = useApiLoadingStatus()
  if (status === APILoadingStatus.AUTH_FAILURE || status === APILoadingStatus.FAILED) {
    return (
      <MapFallback
        title="Map unavailable"
        body={
          status === APILoadingStatus.AUTH_FAILURE
            ? 'The Google Maps key was rejected. Check its HTTP referrer restrictions.'
            : "The map couldn't load. You may be offline. Your spot details are below."
        }
      />
    )
  }

  const center = car ?? mall ?? me ?? { lat: 0, lng: 0 }

  return (
    <div className="relative overflow-hidden rounded-xl border-2 border-secondary">
      <Map
        className="aspect-square w-full"
        defaultCenter={center}
        defaultZoom={18}
        mapId="DEMO_MAP_ID"
        colorScheme={ColorScheme.FOLLOW_SYSTEM}
        gestureHandling="greedy"
        disableDefaultUI
        zoomControl
        clickableIcons={false}
      >
        {mall && (
          <AdvancedMarker position={mall} title="Mall">
            <Pin background="#2563eb" borderColor="#1e3a8a" glyphColor="#ffffff">
              <Store className="size-3.5 text-white" aria-hidden="true" />
            </Pin>
          </AdvancedMarker>
        )}
        {car && (
          <AdvancedMarker position={car} title="Your car" zIndex={10}>
            <div className="grid size-12 place-items-center rounded-md border-2 border-[#1f2226] bg-[#f5c518] shadow-lg">
              <Car className="size-7 text-[#1f2226]" aria-hidden="true" />
            </div>
          </AdvancedMarker>
        )}
        {me && (
          <AdvancedMarker position={me} title="You are here" zIndex={20}>
            <span className="block size-5 rounded-full border-[3px] border-white bg-[#2563eb] shadow-[0_0_0_6px_rgba(37,99,235,0.25)]" />
          </AdvancedMarker>
        )}
        <FitBounds points={[car, mall, me]} />
      </Map>
      <ul className="absolute bottom-2 left-2 flex gap-1.5 text-xs font-semibold" aria-label="Map legend">
        {car && <Legend color="bg-[#f5c518]" label="Car" />}
        {mall && <Legend color="bg-[#2563eb]" label="Mall" />}
        {me && <Legend color="bg-[#2563eb] ring-2 ring-white" label="You" round />}
      </ul>
    </div>
  )
}

function Legend({ color, label, round }: { color: string; label: string; round?: boolean }) {
  return (
    <li className="flex items-center gap-1.5 rounded-full bg-card/95 px-2.5 py-1 text-card-foreground shadow">
      <span className={`size-3 ${round ? 'rounded-full' : 'rounded-sm'} ${color}`} aria-hidden="true" />
      {label}
    </li>
  )
}

function FitBounds({ points }: { points: (LatLng | null)[] }) {
  const map = useMap()
  const fittedCount = useRef(0)
  const valid = points.filter((p): p is LatLng => p !== null)

  useEffect(() => {
    if (!map || valid.length === 0 || valid.length <= fittedCount.current) return
    fittedCount.current = valid.length
    if (valid.length === 1) {
      map.setCenter(valid[0])
      return
    }
    const bounds = new google.maps.LatLngBounds()
    valid.forEach((p) => bounds.extend(p))
    map.fitBounds(bounds, 48)
    const listener = google.maps.event.addListenerOnce(map, 'idle', () => {
      if ((map.getZoom() ?? 0) > 19) map.setZoom(19)
    })
    return () => listener.remove()
  }, [map, valid])

  return null
}

function MapFallback({ title, body }: { title: string; body: string }) {
  return (
    <div className="flex aspect-[4/3] flex-col items-center justify-center rounded-xl border-2 border-dashed border-foreground/40 bg-card p-6 text-center">
      <MapPinOff className="size-10 text-muted-foreground" aria-hidden="true" />
      <p className="mt-3 font-display text-xl font-bold uppercase">{title}</p>
      <p className="mt-1 max-w-xs text-sm text-muted-foreground text-pretty">{body}</p>
    </div>
  )
}
