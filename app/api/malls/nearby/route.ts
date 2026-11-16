import { callPlaces, errorResponse, parseCoord, withDistance } from '@/lib/places'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const lat = parseCoord(searchParams.get('lat'), 90)
  const lng = parseCoord(searchParams.get('lng'), 180)
  if (lat === null || lng === null) {
    return Response.json({ error: 'bad_request', message: 'Valid lat and lng are required.' }, { status: 400 })
  }

  try {
    const malls = await callPlaces('searchNearby', {
      includedTypes: ['shopping_mall'],
      rankPreference: 'DISTANCE',
      maxResultCount: 10,
      locationRestriction: {
        circle: { center: { latitude: lat, longitude: lng }, radius: 3000 },
      },
    })
    return Response.json({ malls: withDistance(malls, lat, lng) })
  } catch (err) {
    return errorResponse(err)
  }
}
