export function getCurrentPosition(options?: PositionOptions): Promise<GeolocationPosition> {
  return new Promise((resolve, reject) => {
    if (typeof navigator === 'undefined' || !navigator.geolocation) {
      reject(new Error('Geolocation is not supported on this device.'))
      return
    }
    navigator.geolocation.getCurrentPosition(resolve, reject, {
      enableHighAccuracy: true,
      timeout: 12000,
      maximumAge: 0,
      ...options,
    })
  })
}

export function geoErrorMessage(err: unknown) {
  if (err && typeof err === 'object' && 'code' in err) {
    const code = (err as GeolocationPositionError).code
    if (code === 1) return 'Location permission was denied.'
    if (code === 2) return 'Your location is unavailable right now.'
    if (code === 3) return 'Getting your location took too long.'
  }
  return err instanceof Error ? err.message : 'Could not get your location.'
}

export function distanceMeters(aLat: number, aLng: number, bLat: number, bLng: number) {
  const R = 6371000
  const toRad = (d: number) => (d * Math.PI) / 180
  const dLat = toRad(bLat - aLat)
  const dLng = toRad(bLng - aLng)
  const h =
    Math.sin(dLat / 2) ** 2 + Math.cos(toRad(aLat)) * Math.cos(toRad(bLat)) * Math.sin(dLng / 2) ** 2
  return 2 * R * Math.asin(Math.sqrt(h))
}

export function walkingDirectionsUrl(lat: number, lng: number) {
  return `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}&travelmode=walking`
}

export function walkingDirectionsByNameUrl(name: string) {
  return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(name)}&travelmode=walking`
}

export function mallMapsUrl(name: string, placeId: string | null) {
  const base = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(name)}`
  return placeId ? `${base}&query_place_id=${encodeURIComponent(placeId)}` : base
}
